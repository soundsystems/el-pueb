'use client';

import { EnvelopeIcon } from '@heroicons/react/20/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { submitContact } from '../app/actions';
import { useToast } from '../hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

const MotionInput = motion(Input);
const MotionTextarea = motion(Textarea);
const MotionCard = motion(Card);
const MotionFormMessage = motion(FormMessage);

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

const ContactForm = () => {
  const { toast } = useToast();
  const [state, formAction] = useActionState<ContactFormState, FormData>(
    submitContact,
    {}
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      message: '',
    },
  });

  // Watch for state changes and show toast
  useEffect(() => {
    if (state?.success) {
      toast({
        title: 'Success!',
        description:
          "We've received your message and will get back to you shortly.",
      });
      form.reset();
    } else if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state, form, toast]);

  const { handleSubmit } = form;
  const [isOpen, setIsOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const { pending } = useFormStatus();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await formAction(data);
    setIsOpen(true);
    setFormSubmitted(true);
  };

  const inputVariants = {
    focused: { scale: 1.03 },
    blurred: { scale: 1 },
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {formSubmitted ? (
          <div className="invisible" />
        ) : (
          <MotionCard className="mx-auto w-5/6 max-w-lg bg-zinc-50/70 backdrop-blur-sm dark:bg-zinc-950/90">
            <CardHeader>
              <CardTitle className="text-center font-bold text-xl text-zinc-900 dark:text-zinc-50">
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                >
                  <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-900 dark:text-zinc-50">
                              First Name
                            </FormLabel>
                            <FormControl>
                              <MotionInput
                                {...field}
                                variants={inputVariants}
                                initial="blurred"
                                whileFocus="focused"
                                className={cn(
                                  'mt-2 bg-zinc-50 font-light text-white text-xs',
                                  'focus:border-pueb/80 focus:ring-pueb/80',
                                  'dark:bg-zinc-900 dark:text-zinc-100',
                                  form.formState.errors.firstName &&
                                    'border-red-500/50'
                                )}
                                placeholder="First Name"
                              />
                            </FormControl>
                            <MotionFormMessage
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-2"
                            >
                              {form.formState.errors.firstName && (
                                <motion.div className="rounded-lg bg-zinc-50/70 px-3 py-1.5 backdrop-blur-sm dark:bg-zinc-950/90">
                                  <span className="font-light text-red-500/80 text-xs">
                                    {form.formState.errors.firstName.message}
                                  </span>
                                </motion.div>
                              )}
                            </MotionFormMessage>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-900 dark:text-zinc-50">
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <MotionInput
                                {...field}
                                variants={inputVariants}
                                initial="blurred"
                                whileFocus="focused"
                                className={cn(
                                  'mt-2 bg-zinc-50 font-light text-white text-xs',
                                  'focus:border-pueb/80 focus:ring-pueb/80',
                                  'dark:bg-zinc-900 dark:text-zinc-100',
                                  form.formState.errors.lastName &&
                                    'border-red-500/50'
                                )}
                                placeholder="Last Name"
                              />
                            </FormControl>
                            <MotionFormMessage
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-2"
                            >
                              {form.formState.errors.lastName && (
                                <motion.div className="rounded-lg bg-zinc-50/70 px-3 py-1.5 backdrop-blur-sm dark:bg-zinc-950/90">
                                  <span className="font-light text-red-500/80 text-xs">
                                    {form.formState.errors.lastName.message}
                                  </span>
                                </motion.div>
                              )}
                            </MotionFormMessage>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-900 dark:text-zinc-50">
                            Email
                          </FormLabel>
                          <FormControl>
                            <MotionInput
                              {...field}
                              variants={inputVariants}
                              initial="blurred"
                              whileFocus="focused"
                              type="email"
                              className={cn(
                                'mt-2 bg-zinc-50 font-light text-white text-xs',
                                'focus:border-pueb/80 focus:ring-pueb/80',
                                'dark:bg-zinc-900 dark:text-zinc-100',
                                form.formState.errors.email &&
                                  'border-red-500/50'
                              )}
                              placeholder="Email"
                            />
                          </FormControl>
                          <MotionFormMessage
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2"
                          >
                            {form.formState.errors.email && (
                              <motion.div className="rounded-lg bg-zinc-50/70 px-3 py-1.5 backdrop-blur-sm dark:bg-zinc-950/90">
                                <span className="font-light text-red-500/80 text-xs">
                                  {form.formState.errors.email.message}
                                </span>
                              </motion.div>
                            )}
                          </MotionFormMessage>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-900 dark:text-zinc-50">
                            Message
                          </FormLabel>
                          <FormControl>
                            <MotionTextarea
                              {...field}
                              variants={inputVariants}
                              initial="blurred"
                              whileFocus="focused"
                              className={cn(
                                'mt-2 bg-zinc-50 font-light text-white text-xs',
                                'focus:border-pueb/80 focus:ring-pueb/80',
                                'dark:bg-zinc-900 dark:text-zinc-100',
                                form.formState.errors.message &&
                                  'border-red-500/50'
                              )}
                              placeholder="Message"
                              rows={4}
                            />
                          </FormControl>
                          <MotionFormMessage
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2"
                          >
                            {form.formState.errors.message && (
                              <motion.div className="rounded-lg bg-zinc-50/70 px-3 py-1.5 backdrop-blur-sm dark:bg-zinc-950/90">
                                <span className="font-light text-red-500/80 text-xs">
                                  {form.formState.errors.message.message}
                                </span>
                              </motion.div>
                            )}
                          </MotionFormMessage>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex w-full justify-center">
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      disabled={pending}
                      className={cn(
                        'text-pueb dark:text-zinc-50',
                        'w-1/2',
                        'hover:bg-zinc-950/90 hover:text-orange-50',
                        'dark:hover:text-pueb',
                        pending && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <div className="flex items-center">
                        Send&nbsp;
                        <EnvelopeIcon className="h-8 w-8" />
                      </div>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </MotionCard>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-zinc-50">
            <DialogHeader>
              <DialogTitle>Thank You</DialogTitle>
            </DialogHeader>
            <p className="text-gray-500 text-sm">
              We have received your message and will get back to you shortly.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="hover:bg-orange-50 focus-visible:ring-pueb"
            >
              Close
            </Button>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default ContactForm;
