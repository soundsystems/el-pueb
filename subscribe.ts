'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type State = {
  [x: string]: any;
  message: string;
  error: boolean;
};

export async function subscribe(
  prevState: State,
  formData: FormData
): Promise<State> {
  const email = formData.get('email') as string;

  if (!email || !email.includes('@')) {
    return {
      message: 'Please provide a valid email address',
      error: true,
    };
  }

  try {
    await resend.emails.send({
      from: 'Your App <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to the Family!',
      text: 'Thanks for subscribing!',
      // You can also use react-email templates here
    });

    return {
      message: 'Successfully subscribed!',
      error: false,
    };
  } catch (error) {
    return {
      message: 'Something went wrong. Please try again.',
      error: true,
    };
  }
}
