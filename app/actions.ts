'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
  inquiryType: z.string(),
  reason: z.string().min(1, 'Please select a reason for contact'),
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
  inquiryType: string;
  reason: string;
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
      from: 'El Pueblito Contact Form <hola@familia.elpueblitonwa.com>',
      to: 'team@elpueblitonwa.com',
      subject: `New ${formData.reason} (${formData.inquiryType})`,
      html: `
        <h2>New ${formData.inquiryType}</h2>
        <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Reason:</strong> ${formData.reason}</p>
        <p><strong>Message:</strong> ${formData.message}</p>
      `,
    });

    return {
      success: true,
      firstName: prevState.firstName || formData.firstName,
    };
  } catch (_) {
    return {
      error: 'Something went wrong. Please try again later.',
    };
  }
}

const PHONE_VALIDATION_REGEX =
  /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

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
      PHONE_VALIDATION_REGEX,
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

const subscriberCache = new Set<string>();

// Add this type definition
type SubscribeFormData = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

// Update helper functions with proper typing
function validateDetailsStep(formData: SubscribeFormData) {
  const schema = subscribeFormSchema.extend({
    firstName: z.string().min(1, 'Please enter your first name'),
    lastName: z.string().min(1, 'Please enter your last name'),
    phone: z
      .string()
      .min(1, 'Please enter your phone number')
      .regex(
        PHONE_VALIDATION_REGEX,
        'Please enter a valid phone number like (123) 456-7890'
      ),
  });
  return schema.safeParse(formData);
}

async function sendWelcomeEmails(formData: SubscribeFormData) {
  await resend.emails.send({
    from: 'El Pueblito <hola@familia.elpueblitonwa.com>',
    to: formData.email,
    subject: 'Welcome to La Familia Pueblito! 🌮',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #03502D;">¡Bienvenidos a La Familia Pueblito!</h1>
        <p>¡Muchas gracias! You've succesfully signed up for our newsletter${formData.firstName ? `, <strong>${formData.firstName}</strong>` : ''}! We're excited to have you join our family.</p>
        <p>You'll be the first to know about:</p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li style="margin-bottom: 12px;">
            <span style="color: #F8C839; font-size: 24px; margin-right: 8px;">●</span>
            Exclusive promotions and deals
          </li>
          <li style="margin-bottom: 12px;">
            <span style="color: #016945; font-size: 24px; margin-right: 8px;">●</span>
            New menu items
          </li>
          <li style="margin-bottom: 12px;">
            <span style="color: #CF0822; font-size: 24px; margin-right: 8px;">●</span>
            Events and celebrations
          </li>
          <li style="margin-bottom: 12px;">
            <span style="color: #088589; font-size: 24px; margin-right: 8px;">●</span>
            Restaurant news and updates
          </li>
          <li style="margin-bottom: 12px;">
            <span style="color: #EF6A4B; font-size: 24px; margin-right: 8px;">●</span>
            Our upcoming rewards program
          </li>
          <li style="margin-bottom: 12px;">
            <span style="color: #9DA26A; font-size: 24px; margin-right: 8px;">●</span>
            And more!
          </li>
        </ul>
        <p>Stay tuned for our next update!</p>
        <p style="color: #666;">Mucho Amor,<br>El Pueblito Management</p>
      </div>
    `,
  });

  await resend.emails.send({
    from: 'El Pueblito Notifications <notifications@familia.elpueblitonwa.com>',
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
}

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
      if (subscriberCache.has(formData.email)) {
        return {
          success: true,
          message: 'Already subscribed!',
          error: false,
          step: 'details',
        };
      }

      const validatedFields = validateDetailsStep(formData);
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
        subscriberCache.add(formData.email);
        await sendWelcomeEmails(formData);
        return {
          success: true,
          message: 'Successfully subscribed!',
          error: false,
          step: 'details',
        };
      } catch (_) {
        subscriberCache.delete(formData.email);
        return {
          error: true,
          message: 'Error sending welcome email. Please try again.',
          step: prevState.step,
        };
      }
    }

    const validatedEmail = emailSchema.safeParse({ email: formData.email });
    if (!validatedEmail.success) {
      return {
        error: true,
        message:
          validatedEmail.error.errors[0]?.message || 'Please check your email',
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
  } catch (_) {
    return {
      error: true,
      message: 'Something went wrong. Please try again.',
      step: prevState.step,
    };
  }
}
