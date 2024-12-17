'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const formSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

// Add type for form state
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

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitContact(
  prevState: ContactFormState,
  formData: ContactFormData
): Promise<ContactFormState> {
  try {
    const validatedFields = formSchema.safeParse(formData);

    if (!validatedFields.success) {
      return {
        error: 'Invalid form data. Please check your inputs.',
      };
    }

    // Send email using Resend
    await resend.emails.send({
      from: 'El Pueblito Contact Form <onboarding@resend.dev>', // Start with this, verify domain later
      to: 'elpueblito@email.com', // Where you want to receive the emails
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
    console.error('Error sending email:', error);
    return {
      error: 'Something went wrong. Please try again later.',
    };
  }
}
