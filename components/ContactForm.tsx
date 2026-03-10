"use client";

import { EnvelopeIcon } from "@heroicons/react/20/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m as motion,
} from "framer-motion";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useReducer } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage as ShadcnFormMessage,
} from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { submitContact } from "../app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

// Fix motion types
const MotionInput = motion(Input);
const MotionTextarea = motion(Textarea);
const MotionCard = motion(Card);

type InquiryType = "customer" | "business";

const CUSTOMER_OPTIONS = [
  "General Question/Inquiry",
  "Feedback on My Experience",
  "Catering",
  "Event Booking Inquiry",
  "Menu Questions (Dietary Restrictions, Allergies, etc.)",
] as const;

const BUSINESS_OPTIONS = [
  "Catering",
  "Event Booking Inquiry",
  "Partnership or Collaboration Proposal",
  "Vendor/Supplier Inquiry",
  "Other",
] as const;

const LOCATIONS = [
  "Bella Vista",
  "Highfill",
  "Prairie Creek",
  "Centerton",
  "All Locations",
] as const;

const formSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  businessName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
  reason: z.string().min(1, "Please select a reason for contact"),
  location: z.string().min(1, "Please select a location"),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface FormData extends FormSchemaType {
  inquiryType: string;
}

interface ContactFormState {
  error?: string;
  firstName?: string;
  success?: boolean;
}

interface ContactFormUiState {
  formSubmitted: boolean;
  isOpen: boolean;
  reason: string;
  selectedTab: InquiryType;
}

type ContactFormUiAction =
  | { type: "close_dialog" }
  | { type: "open_dialog" }
  | { type: "set_reason"; reason: string }
  | { type: "set_submitted"; submitted: boolean }
  | { type: "set_tab"; tab: InquiryType }
  | { type: "sync_from_url"; reason: string; selectedTab: InquiryType };

function contactFormUiReducer(
  state: ContactFormUiState,
  action: ContactFormUiAction
): ContactFormUiState {
  switch (action.type) {
    case "close_dialog":
      return { ...state, isOpen: false };
    case "open_dialog":
      return { ...state, formSubmitted: true, isOpen: true };
    case "set_reason":
      return { ...state, reason: action.reason };
    case "set_submitted":
      return { ...state, formSubmitted: action.submitted };
    case "set_tab":
      return { ...state, selectedTab: action.tab };
    case "sync_from_url":
      return {
        ...state,
        reason: action.reason,
        selectedTab: action.selectedTab,
      };
    default:
      return state;
  }
}

const FormMessage = (props: React.ComponentProps<typeof ShadcnFormMessage>) => (
  <ShadcnFormMessage {...props} className="mt-2 text-red-300" />
);

const ContactForm = () => {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    ContactFormState,
    FormData
  >(submitContact, {
    success: false,
    error: undefined,
    firstName: undefined,
  });
  // Check URL parameters for initial state
  const getInitialState = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isCatering = urlParams.get("catering") === "true";
      const isEvent = urlParams.get("event") === "true";

      if (isCatering) {
        return {
          selectedTab: "customer" as InquiryType,
          reason: "Catering",
        };
      }
      if (isEvent) {
        return {
          selectedTab: "customer" as InquiryType,
          reason: "Event Booking Inquiry",
        };
      }
    }
    return {
      selectedTab: "customer" as InquiryType,
      reason: "",
    };
  };

  const initialState = getInitialState();
  const [uiState, dispatch] = useReducer(contactFormUiReducer, {
    formSubmitted: false,
    isOpen: false,
    reason: initialState.reason,
    selectedTab: initialState.selectedTab,
  });
  const { formSubmitted, isOpen, reason, selectedTab } = uiState;

  const form = useForm<FormSchemaType>({
    resolver: async (data, context, options) => {
      const result = await zodResolver(formSchema)(data, context, options);

      // If we're on the business tab, add custom validation
      if (
        selectedTab === "business" &&
        !result.errors &&
        !data.businessName &&
        !(data.firstName && data.lastName)
      ) {
        return {
          values: {},
          errors: {
            businessName: {
              type: "custom",
              message:
                "Either Business Name or both First and Last Name are required",
            },
          },
        };
      }

      return result;
    },
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      message: "",
      reason,
      businessName: "",
      location: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (state?.success) {
      dispatch({ type: "open_dialog" });
      form.reset();
    }
  }, [state, form]);

  // Watch for URL changes and update form accordingly
  useEffect(() => {
    const checkUrlParams = () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const isCatering = urlParams.get("catering") === "true";
        const isEvent = urlParams.get("event") === "true";

        if (isCatering) {
          dispatch({
            type: "sync_from_url",
            reason: "Catering",
            selectedTab: "customer",
          });
          form.setValue("reason", "Catering");
          return;
        }

        if (isEvent) {
          dispatch({
            type: "sync_from_url",
            reason: "Event Booking Inquiry",
            selectedTab: "customer",
          });
          form.setValue("reason", "Event Booking Inquiry");
        }
      }
    };

    // Check on mount and when URL changes
    checkUrlParams();

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", checkUrlParams);

    // Also check periodically in case URL was updated programmatically
    const interval = setInterval(checkUrlParams, 1000);

    return () => {
      window.removeEventListener("popstate", checkUrlParams);
      clearInterval(interval);
    };
  }, [form]);

  const { handleSubmit } = form;
  const onSubmit = (data: FormSchemaType) => {
    const submissionData = {
      ...data,
      inquiryType: selectedTab === "customer" ? "Customer" : "Business",
      location: data.location,
      businessName: data.businessName || undefined,
    };

    startTransition(() => {
      formAction(submissionData);
    });
  };

  const inputVariants = {
    focused: { scale: 1.02 },
    blurred: { scale: 1 },
  };

  const getSelectOptions = (type: InquiryType) =>
    type === "customer"
      ? CUSTOMER_OPTIONS.map((option) => (
          <SelectItem
            className="transition-all hover:bg-black/10 hover:shadow-md dark:hover:bg-white/10"
            key={option}
            value={option}
          >
            {option}
          </SelectItem>
        ))
      : BUSINESS_OPTIONS.map((option) => (
          <SelectItem
            className="transition-all hover:bg-black/10 hover:shadow-md dark:hover:bg-white/10"
            key={option}
            value={option}
          >
            {option}
          </SelectItem>
        ));

  const selectVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="w-full">
        <motion.div
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          {formSubmitted ? (
            <div className="invisible" />
          ) : (
            <MotionCard className="mx-auto w-5/6 max-w-lg bg-stone-50/70 backdrop-blur-sm dark:bg-stone-950/90">
              <CardHeader>
                <CardTitle className="text-center font-bold text-stone-900 text-xl dark:text-stone-50">
                  Búscanos
                </CardTitle>
                <p className="mt-2 text-center font-semibold text-sm text-stone-700 dark:text-stone-300">
                  Please allow our team up to 48 hours{" "}
                  <br className="tablet:hidden" /> to respond to your request.
                </p>
                {/* <p className="mt-2 text-left text-xs text-stone-700 dark:text-stone-300">
                If the matter is urgent or time-sensitive, please give us a call  
                at the relevant location during open hours.
              </p> */}
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    className="space-y-4"
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <Tabs
                      className="w-full"
                      defaultValue="customer"
                      onValueChange={(value) =>
                        dispatch({ type: "set_tab", tab: value as InquiryType })
                      }
                    >
                      <TabsList
                        aria-label="Contact type"
                        className="relative grid w-full grid-cols-2 gap-2 rounded-xl bg-[#152B20]/95 p-1 dark:bg-[#152B20]"
                      >
                        <TabsTrigger
                          aria-controls="customer-tab"
                          aria-selected={selectedTab === "customer"}
                          className="relative z-20 rounded-xl text-stone-100 transition-all hover:bg-[#2C5C44]/20 focus-visible:ring-2 focus-visible:ring-[#2C5C44] focus-visible:ring-offset-2 data-[state=active]:text-stone-50"
                          role="tab"
                          value="customer"
                        >
                          <span className="relative z-20">Customer</span>
                          {selectedTab === "customer" && (
                            <motion.div
                              animate={{ opacity: 0.9 }}
                              className="absolute inset-0 z-10 rounded-xl bg-gradient-to-br from-[#347852] to-[#1C3B2C] opacity-90 dark:from-[#347852] dark:to-[#1C3B2C]"
                              initial={{ opacity: 0 }}
                              layoutId="contact-bubble"
                              transition={{
                                type: "spring",
                                bounce: 0.15,
                                duration: 0.5,
                              }}
                            />
                          )}
                        </TabsTrigger>
                        <TabsTrigger
                          aria-controls="business-tab"
                          aria-selected={selectedTab === "business"}
                          className="relative z-20 rounded-xl text-stone-100 transition-all hover:bg-[#2C5C44]/20 focus-visible:ring-2 focus-visible:ring-[#2C5C44] focus-visible:ring-offset-2 data-[state=active]:text-stone-50"
                          role="tab"
                          value="business"
                        >
                          <span className="relative z-20">Business</span>
                          {selectedTab === "business" && (
                            <motion.div
                              animate={{ opacity: 0.9 }}
                              className="absolute inset-0 z-10 rounded-xl bg-gradient-to-br from-[#347852] to-[#1C3B2C] opacity-90 dark:from-[#347852] dark:to-[#1C3B2C]"
                              initial={{ opacity: 0 }}
                              layoutId="contact-bubble"
                              transition={{
                                type: "spring",
                                bounce: 0.15,
                                duration: 0.5,
                              }}
                            />
                          )}
                        </TabsTrigger>
                      </TabsList>

                      <AnimatePresence mode="wait">
                        <motion.div
                          animate="animate"
                          exit="exit"
                          initial="initial"
                          key={selectedTab}
                          transition={{
                            duration: 0.2,
                          }}
                          variants={selectVariants}
                        >
                          <TabsContent
                            aria-labelledby={`${selectedTab}-trigger`}
                            forceMount
                            id={`${selectedTab}-tab`}
                            role="tabpanel"
                            value={selectedTab}
                          >
                            {selectedTab === "customer" && (
                              <p className="mb-3 text-center font-medium text-sm text-stone-700 dark:text-stone-300">
                                Seating is first-come, first-serve.{" "}
                                <br className="tablet:hidden" /> No reservations
                                required.
                              </p>
                            )}
                            <FormField
                              control={form.control}
                              name="reason"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-stone-900 dark:text-stone-50">
                                    Reason for Reaching Out
                                  </FormLabel>
                                  <Select
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger
                                        aria-label="Select reason for contact"
                                        className={cn(
                                          "mt-2 min-h-[44px] border-transparent text-stone-900 transition-all focus:ring-2 focus:ring-offset-2 dark:text-stone-50",
                                          selectedTab === "customer"
                                            ? "bg-gradient-to-br from-yellow-300/90 to-yellow-500/90 hover:from-yellow-200/90 hover:to-yellow-400/90 focus:from-yellow-400 focus:to-yellow-600 focus:ring-yellow-400"
                                            : "bg-gradient-to-br from-sky-300/90 to-sky-500/90 hover:from-sky-200/90 hover:to-sky-400/90 focus:from-sky-400 focus:to-sky-600 focus:ring-sky-400"
                                        )}
                                      >
                                        <SelectValue placeholder="Select a reason" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent
                                      className={cn(
                                        "border-transparent text-stone-900 dark:text-stone-50",
                                        selectedTab === "customer"
                                          ? "bg-gradient-to-br from-yellow-300/95 to-yellow-500/95"
                                          : "bg-gradient-to-br from-sky-300/95 to-sky-500/95"
                                      )}
                                      position="popper"
                                      sideOffset={4}
                                    >
                                      <div className="momentum-scroll max-h-[300px] overflow-y-auto">
                                        {getSelectOptions(selectedTab)}
                                      </div>
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
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-stone-900 dark:text-stone-50">
                            Specify Location
                          </FormLabel>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger
                                aria-label="Select location"
                                className={cn(
                                  "mt-2 min-h-[44px] border-transparent text-stone-900 transition-all focus:ring-2 focus:ring-offset-2 dark:text-stone-50",
                                  selectedTab === "customer"
                                    ? "bg-gradient-to-br from-yellow-300/90 to-yellow-500/90 hover:from-yellow-200/90 hover:to-yellow-400/90 focus:from-yellow-400 focus:to-yellow-600 focus:ring-yellow-400"
                                    : "bg-gradient-to-br from-sky-300/90 to-sky-500/90 hover:from-sky-200/90 hover:to-sky-400/90 focus:from-sky-400 focus:to-sky-600 focus:ring-sky-400"
                                )}
                              >
                                <SelectValue placeholder="Select a location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              className={cn(
                                "border-transparent text-stone-900 dark:text-stone-50",
                                selectedTab === "customer"
                                  ? "bg-gradient-to-br from-yellow-300/95 to-yellow-500/95"
                                  : "bg-gradient-to-br from-sky-300/95 to-sky-500/95"
                              )}
                              position="popper"
                              sideOffset={4}
                            >
                              <div className="momentum-scroll max-h-[300px] overflow-y-auto">
                                {LOCATIONS.map((location) => (
                                  <SelectItem
                                    className="transition-all hover:bg-black/10 hover:shadow-md dark:hover:bg-white/10"
                                    key={location}
                                    value={location}
                                  >
                                    {location}
                                  </SelectItem>
                                ))}
                              </div>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedTab === "business" && (
                      <div>
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-stone-900 dark:text-stone-50">
                                Business Name
                              </FormLabel>
                              <FormControl>
                                <MotionInput
                                  {...field}
                                  autoComplete="organization"
                                  className={cn(
                                    "mt-2 bg-stone-50 font-normal text-base",
                                    "focus:border-pueb/80 focus:ring-pueb/80",
                                    "dark:bg-stone-900 dark:text-stone-100",
                                    "transition-transform duration-200 active:scale-[1.02]"
                                  )}
                                  initial="blurred"
                                  placeholder="Business Name"
                                  variants={inputVariants}
                                  whileFocus="focused"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-stone-900 dark:text-stone-50">
                                First Name{" "}
                                {!form.getValues("businessName") && "*"}
                              </FormLabel>
                              <FormControl>
                                <MotionInput
                                  {...field}
                                  autoComplete="given-name"
                                  className={cn(
                                    "mt-2 bg-stone-50 font-normal text-base",
                                    "focus:border-pueb/80 focus:ring-pueb/80",
                                    "dark:bg-stone-900 dark:text-stone-100",
                                    "transition-transform duration-200 active:scale-[1.02]"
                                  )}
                                  initial="blurred"
                                  placeholder="First Name"
                                  variants={inputVariants}
                                  whileFocus="focused"
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
                                Last Name{" "}
                                {!form.getValues("businessName") && "*"}
                              </FormLabel>
                              <FormControl>
                                <MotionInput
                                  {...field}
                                  autoComplete="family-name"
                                  className={cn(
                                    "mt-2 bg-stone-50 font-normal text-base",
                                    "focus:border-pueb/80 focus:ring-pueb/80",
                                    "dark:bg-stone-900 dark:text-stone-100",
                                    "transition-transform duration-200 active:scale-[1.02]"
                                  )}
                                  initial="blurred"
                                  placeholder="Last Name"
                                  variants={inputVariants}
                                  whileFocus="focused"
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
                                autoCapitalize="off"
                                autoComplete="off"
                                autoCorrect="off"
                                className={cn(
                                  "mt-2 bg-stone-50 font-normal text-base",
                                  "focus:border-pueb/80 focus:ring-pueb/80",
                                  "dark:bg-stone-900 dark:text-stone-100",
                                  "transition-transform duration-200 active:scale-[1.02]"
                                )}
                                initial="blurred"
                                inputMode="email"
                                placeholder="Email"
                                type="email"
                                variants={inputVariants}
                                whileFocus="focused"
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
                                autoCapitalize="off"
                                autoComplete="off"
                                autoCorrect="off"
                                className={cn(
                                  "momentum-scroll mt-2 bg-stone-50 font-normal text-base",
                                  "focus:border-pueb/80 focus:ring-pueb/80",
                                  "dark:bg-stone-900 dark:text-stone-100",
                                  "transition-transform duration-200 active:scale-[1.02]"
                                )}
                                initial="blurred"
                                placeholder="Message"
                                rows={4}
                                variants={inputVariants}
                                whileFocus="focused"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex w-full justify-center">
                      <Button
                        className={cn(
                          "mt-4 min-h-[44px] w-full select-none bg-stone-800/90 text-stone-100 transition-all hover:bg-stone-900 hover:text-yellow-400 dark:bg-stone-800 dark:hover:bg-black",
                          isPending && "cursor-not-allowed opacity-50"
                        )}
                        disabled={isPending}
                        type="submit"
                      >
                        {isPending ? (
                          <LoadingSpinner size={24} />
                        ) : (
                          <>
                            <EnvelopeIcon className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </MotionCard>
          )}

          <Dialog
            onOpenChange={(open) => {
              if (!open) {
                dispatch({ type: "close_dialog" });
              }
            }}
            open={isOpen}
          >
            <DialogContent className="bg-stone-950 text-stone-50">
              <DialogHeader>
                <DialogTitle>Gracias, mi amigo.</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-stone-50">
                We have received your message and will be in touch asap.
              </p>
              <Button
                className="hover:bg-yellow-400 focus-visible:ring-pueb"
                onClick={() => {
                  dispatch({ type: "close_dialog" });
                  router.push("/");
                }}
                variant="outline"
              >
                close
              </Button>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </LazyMotion>
  );
};

export default ContactForm;
