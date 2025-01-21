'use client';

import { EnvelopeIcon } from '@heroicons/react/20/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { submitContact } from '../app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage as ShadcnFormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const MotionInput = motion.create(Input);
const MotionTextarea = motion.create(Textarea);
const MotionCard = motion.create(Card);

type InquiryType = 'customer' | 'business';

const CUSTOMER_OPTIONS = [
  'General Question/Inquiry',
  'Feedback on My Experience',
  'Reservation Request',
  'Event Booking Inquiry',
  'Menu Questions (Dietary Restrictions, Allergies, etc.)',
] as const;

const BUSINESS_OPTIONS = [
  'Catering Inquiry',
  'Partnership or Collaboration Proposal',
  'Vendor/Supplier Inquiry',
] as const;

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
  reason: z.string().min(1, 'Please select a reason for contact'),
});

type ContactFormState = {
  success?: boolean;
  error?: string;
  firstName?: string;
};

const FormMessage = ({ ...props }) => {
  return <ShadcnFormMessage {...props} className="mt-2 text-red-300" />;
};

const ContactForm = () => {
  const router = useRouter();
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
      reason: '',
    },
  });

  useEffect(() => {
    if (state?.success) {
      setIsOpen(true);
      setFormSubmitted(true);
      form.reset();
    }
  }, [state, form]);

  const { handleSubmit } = form;
  const [isOpen, setIsOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedTab, setSelectedTab] = useState<InquiryType>('customer');

  const { pending } = useFormStatus();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const inquiryType =
      selectedTab === 'customer' ? 'Customer Inquiry' : 'Business Opportunity';

    const submissionData = {
      ...data,
      inquiryType,
    };

    startTransition(() => {
      formAction(submissionData);
    });
  };

  const inputVariants = {
    focused: { scale: 1.03 },
    blurred: { scale: 1 },
  };

  const getSelectOptions = (type: InquiryType) => {
    return type === 'customer'
      ? CUSTOMER_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))
      : BUSINESS_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ));
  };

  const selectVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
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
          <MotionCard className="mx-auto w-5/6 max-w-lg bg-stone-50/70 backdrop-blur-sm dark:bg-stone-950/90">
            <CardHeader>
              <CardTitle className="text-center font-bold text-stone-900 text-xl dark:text-stone-50">
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
                  <Tabs
                    defaultValue="customer"
                    onValueChange={(value) =>
                      setSelectedTab(value as InquiryType)
                    }
                    className="w-full"
                  >
                    <TabsList className="relative grid w-full grid-cols-2 gap-2 rounded-xl bg-stone-800/90 p-1 dark:bg-stone-900">
                      <TabsTrigger
                        value="customer"
                        className="relative z-20 rounded-xl text-stone-100 transition-all data-[state=active]:text-stone-50"
                      >
                        <span className="relative z-20">Customer</span>
                        {selectedTab === 'customer' && (
                          <motion.div
                            className="absolute inset-0 z-10 rounded-xl bg-stone-700/90 dark:bg-stone-800"
                            layoutId="contact-bubble"
                            transition={{
                              type: 'spring',
                              bounce: 0.15,
                              duration: 0.3,
                            }}
                          />
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="business"
                        className="relative z-20 rounded-xl text-stone-100 transition-all data-[state=active]:text-stone-50"
                      >
                        <span className="relative z-20">Business</span>
                        {selectedTab === 'business' && (
                          <motion.div
                            className="absolute inset-0 z-10 rounded-xl bg-stone-700/90 dark:bg-stone-800"
                            layoutId="contact-bubble"
                            transition={{
                              type: 'spring',
                              bounce: 0.15,
                              duration: 0.3,
                            }}
                          />
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedTab}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={selectVariants}
                        transition={{
                          duration: 0.2,
                        }}
                      >
                        <TabsContent value={selectedTab} forceMount>
                          <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-stone-900 dark:text-stone-50">
                                  Reason for Contact
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="mt-2 border-stone-700 bg-stone-800/90 text-stone-100">
                                      <SelectValue placeholder="Select a reason" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="border-stone-700 bg-stone-800 text-stone-100">
                                    {getSelectOptions(selectedTab)}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                      </motion.div>
                    </AnimatePresence>
                  </Tabs>

                  <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-stone-900 dark:text-stone-50">
                              First Name
                            </FormLabel>
                            <FormControl>
                              <MotionInput
                                {...field}
                                variants={inputVariants}
                                initial="blurred"
                                whileFocus="focused"
                                className={cn(
                                  'mt-2 bg-stone-50 font-light text-xs',
                                  'focus:border-pueb/80 focus:ring-pueb/80',
                                  'dark:bg-stone-900 dark:text-stone-100'
                                )}
                                placeholder="First Name"
                              />
                            </FormControl>
                            <FormMessage />
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
                            <FormLabel className="text-stone-900 dark:text-stone-50">
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <MotionInput
                                {...field}
                                variants={inputVariants}
                                initial="blurred"
                                whileFocus="focused"
                                className={cn(
                                  'mt-2 bg-stone-50 font-light text-xs',
                                  'focus:border-pueb/80 focus:ring-pueb/80',
                                  'dark:bg-stone-900 dark:text-stone-100'
                                )}
                                placeholder="Last Name"
                              />
                            </FormControl>
                            <FormMessage />
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
                          <FormLabel className="text-stone-900 dark:text-stone-50">
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
                                'mt-2 bg-stone-50 font-light text-xs',
                                'focus:border-pueb/80 focus:ring-pueb/80',
                                'dark:bg-stone-900 dark:text-stone-100'
                              )}
                              placeholder="Email"
                            />
                          </FormControl>
                          <FormMessage />
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
                          <FormLabel className="text-stone-900 dark:text-stone-50">
                            Message
                          </FormLabel>
                          <FormControl>
                            <MotionTextarea
                              {...field}
                              variants={inputVariants}
                              initial="blurred"
                              whileFocus="focused"
                              className={cn(
                                'mt-2 bg-stone-50 font-light text-xs',
                                'focus:border-pueb/80 focus:ring-pueb/80',
                                'dark:bg-stone-900 dark:text-stone-100'
                              )}
                              placeholder="Message"
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
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
                        'text-pueb dark:text-stone-50',
                        'w-1/2',
                        'hover:bg-stone-950/90 hover:text-orange-50',
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
          <DialogContent className="bg-stone-50">
            <DialogHeader>
              <DialogTitle>Gracias mi amigo</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-stone-600">
              We have received your message and will get back to you shortly.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                router.push('/');
              }}
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
