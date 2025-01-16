'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
});

type ContactFormState = {
  success?: boolean;
  error?: string;
  firstName?: string;
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export async function submitContact(
  prevState: ContactFormState,
  formData: ContactFormData
): Promise<ContactFormState> {
  try {
    const validatedFields = formSchema.safeParse(formData);

    if (!validatedFields.success) {
      return {
        error:
          validatedFields.error.errors[0]?.message ||
          'Invalid form data. Please check your inputs.',
      };
    }

    await resend.emails.send({
      from: 'El Pueblito Contact Form <onboarding@resend.dev>',
      to: 'elpueblitonwa@gmail.com',
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Message:</strong> ${formData.message}</p>
      `,
    });

    return {
      success: true,
      firstName: prevState.firstName || formData.firstName,
    };
  } catch (error) {
    return {
      error: 'Something went wrong. Please try again later.',
    };
  }
}

const subscribeFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email')
    .email('Please provide a valid email address'),
  firstName: z.string().min(1, 'Please enter your first name').optional(),
  lastName: z.string().min(1, 'Please enter your last name').optional(),
  phone: z
    .string()
    .min(1, 'Please enter your phone number')
    .regex(
      /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
      'Please enter a valid phone number like (123) 456-7890'
    )
    .optional(),
});

const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email')
    .email('Please provide a valid email address'),
});

type SubscribeFormState = {
  success?: boolean;
  error?: boolean | string;
  message?: string;
  step?: 'email' | 'details';
  email?: string;
};

export async function subscribe(
  prevState: SubscribeFormState,
  formData: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }
): Promise<SubscribeFormState> {
  try {
    if (prevState.step === 'details') {
      const schema = subscribeFormSchema.extend({
        firstName: z.string().min(1, 'Please enter your first name'),
        lastName: z.string().min(1, 'Please enter your last name'),
        phone: z
          .string()
          .min(1, 'Please enter your phone number')
          .regex(
            /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
            'Please enter a valid phone number like (123) 456-7890'
          ),
      });

      const validatedFields = schema.safeParse(formData);

      if (!validatedFields.success) {
        return {
          error: true,
          message:
            validatedFields.error.errors[0]?.message ||
            'Please check your inputs',
          step: prevState.step,
        };
      }

      try {
        await resend.emails.send({
          from: 'El Pueblito <onboarding@resend.dev>',
          to: formData.email,
          subject: 'Welcome to La Familia Pueblito! 🌮',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #03502D;">¡Bienvenidos a La Familia Pueblito!</h1>
              <p>Thank you for subscribing to our newsletter${formData.firstName ? `, ${formData.firstName}` : ''}! We're excited to have you join our family.</p>
              <p>You'll be the first to know about:</p>
              <ul>
                <li>Special promotions and deals</li>
                <li>New menu items</li>
                <li>Events and celebrations</li>
                <li>Restaurant news and updates</li>
                <li>Our upcoming rewards program</li>
                <li>And more!</li>
              </ul>
              <p>Stay tuned for our next update!</p>
              <p style="color: #666;">With love,<br>La Familia Pueblito</p>
            </div>
          `,
        });

        await resend.emails.send({
          from: 'El Pueblito Notifications <onboarding@resend.dev>',
          to: 'elpueblitonwa@gmail.com',
          subject: 'New Newsletter Subscriber',
          html: `
            <h2>New Newsletter Subscriber</h2>
            <p><strong>Email:</strong> ${formData.email}</p>
            ${formData.firstName ? `<p><strong>First Name:</strong> ${formData.firstName}</p>` : ''}
            ${formData.lastName ? `<p><strong>Last Name:</strong> ${formData.lastName}</p>` : ''}
            ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ''}
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          `,
        });

        return {
          success: true,
          message: 'Successfully subscribed!',
          error: false,
          step: 'details',
        };
      } catch (error) {
        return {
          error: true,
          message: 'Error sending welcome email. Please try again.',
          step: prevState.step,
        };
      }
    } else {
      const validatedEmail = emailSchema.safeParse({ email: formData.email });

      if (!validatedEmail.success) {
        return {
          error: true,
          message:
            validatedEmail.error.errors[0]?.message ||
            'Please check your email',
          step: 'email',
        };
      }

      return {
        success: true,
        message: 'Email validated',
        step: 'details',
        email: formData.email,
        error: false,
      };
    }
  } catch (error) {
    return {
      error: true,
      message: 'Something went wrong. Please try again.',
      step: prevState.step,
    };
  }
}
