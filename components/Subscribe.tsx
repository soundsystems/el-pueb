"use client";

import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m as motion,
  useAnimationControls,
} from "framer-motion";
import { CircleArrowRight, CircleCheck } from "lucide-react";
import React, { useActionState } from "react";
import ReactConfetti from "react-confetti";
import { subscribe } from "@/app/actions";
import { LoadingSpinner } from "./ui/loading";

const PHONE_NUMBER_REGEX = /\D/g;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribeState {
  email?: string;
  error?: boolean | string;
  message?: string;
  step?: "email" | "details";
  success?: boolean;
}

const initialState: SubscribeState = {
  message: "",
  error: false,
  success: false,
  step: "email",
};

// Extract theme and animation logic into a custom hook
function useThemeAnimation(controls: ReturnType<typeof useAnimationControls>) {
  React.useEffect(() => {
    controls.start({
      color: "#fafaf9",
      transition: { duration: 0.3 },
    });
  }, [controls]);
}

// Extract window dimensions logic
function useWindowDimensions() {
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: Math.max(
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          window.innerHeight
        ),
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, []);

  return dimensions;
}

export default function Subscribe() {
  const [state, submitAction, isPending] = useActionState(
    async (
      prevState: SubscribeState,
      formData: FormData
    ): Promise<SubscribeState> => {
      const email = formData.get("email")?.toString();

      // Validate email first
      if (!(email && EMAIL_REGEX.test(email))) {
        return {
          error: true,
          message: "Please enter a valid email address",
          step: "email",
          success: false,
          email: undefined,
        };
      }

      // Only do optimistic update if email is valid
      if (prevState.step === "email") {
        return {
          step: "details",
          email,
          error: false,
          message: "",
          success: false,
        };
      }

      // If we're in the details step, get all fields
      if (prevState.step === "details") {
        const firstName = formData.get("firstName")?.toString();
        const lastName = formData.get("lastName")?.toString();
        const phone = formData.get("phone")?.toString();

        // Check if all required fields are present
        if (!(firstName && lastName && phone)) {
          return {
            error: true,
            message: "Please fill in all fields",
            step: "details",
            success: false,
            email: undefined,
          };
        }

        return await subscribe(prevState, {
          email,
          firstName,
          lastName,
          phone,
        });
      }

      return await subscribe(prevState, { email });
    },
    initialState
  );

  const controls = useAnimationControls();
  const dimensions = useWindowDimensions();
  useThemeAnimation(controls);

  const formRef = React.useRef<HTMLFormElement>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [confettiSource, setConfettiSource] = React.useState({ x: 0, y: 0 });

  // Reset form when step changes
  React.useEffect(() => {
    if (state.step === "details" && formRef.current) {
      formRef.current.reset();
    }
  }, [state.step]);

  // Show confetti when subscription is successful
  React.useEffect(() => {
    if (
      state.success &&
      state.step === "details" &&
      state.message === "Successfully subscribed!"
    ) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Update confetti source position when window changes
  React.useEffect(() => {
    const updateConfettiSource = () => {
      setConfettiSource({
        y: window.innerHeight + window.scrollY,
        x: window.innerWidth,
      });
    };

    // Initial position
    updateConfettiSource();

    // Update on scroll and resize
    window.addEventListener("scroll", updateConfettiSource, { passive: true });
    window.addEventListener("resize", updateConfettiSource);

    return () => {
      window.removeEventListener("scroll", updateConfettiSource);
      window.removeEventListener("resize", updateConfettiSource);
    };
  }, []);

  const startColorAnimation = async () => {
    await controls.start({
      color: ["#fafaf9", "#EAB308", "#30C2DC", "#22c55e", "#fafaf9"],
      transition: {
        duration: 1.2,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1],
      },
    });
  };

  const stopColorAnimation = () => {
    controls.start({
      color: "#fafaf9",
      transition: { duration: 0.2 },
    });
  };

  // Add focus handlers for mobile
  const handleFocusAnimation = () => {
    startColorAnimation(); // Reuse the same flicker animation with all colors
  };

  const handleBlurAnimation = () => {
    controls.start({
      color: "#fafaf9",
      transition: { duration: 0.2 },
    });
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(PHONE_NUMBER_REGEX, "");

    // Return empty if no input
    if (!phoneNumber.length) {
      return "";
    }

    // Format based on length of input
    if (phoneNumber.length < 4) {
      return `(${phoneNumber}`;
    }
    if (phoneNumber.length < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    e.target.value = formatted;
  };

  const renderEmailStep = () => (
    <div className="pt-4">
      <motion.div
        animate={{ opacity: 1, y: -10 }}
        className="absolute top-4 right-0 left-0 appearance-none font-semibold text-stone-50 opacity-0 transition-colors duration-300 ease-linear group-focus-within:text-green-600 group-hover:text-green-600"
        style={{ pointerEvents: "none" }}
        transition={{
          ease: "linear",
          duration: 0.08,
          x: { duration: 0.15 },
        }}
      >
        <h3 className="text-center font-bold text-sm text-stone-50 transition-colors duration-300 ease-linear md:text-base">
          La Familia Pueblito
        </h3>
      </motion.div>
      <span className="relative font-semibold text-sm md:text-base">
        <motion.span
          animate={controls}
          className="relative inline-block text-stone-50"
        >
          email
        </motion.span>
      </span>
      <span>
        <input
          aria-label="Email address"
          autoCapitalize="none"
          autoCorrect="off"
          className="mx-2 min-h-[44px] w-48 select-none appearance-none rounded-lg bg-transparent px-2 text-left font-medium text-base text-stone-50 placeholder-stone-50/80 outline-[#F15670] transition-transform duration-200 placeholder:text-center placeholder:font-light placeholder:text-sm hover:outline hover:outline-1 focus:border-transparent focus:outline-2"
          defaultValue={state.email}
          inputMode="email"
          key="email-input"
          name="email"
          onBlur={handleBlurAnimation}
          onFocus={handleFocusAnimation}
          placeholder="your@email.com"
          required
          suppressHydrationWarning
          type="email"
        />
      </span>
    </div>
  );

  const renderDetailsStep = () => (
    <motion.div
      animate={{ height: "auto", opacity: 1 }}
      className="flex flex-col space-y-3"
      initial={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ opacity: 1 }}
        className="mb-2 text-center"
        initial={{ opacity: 0 }}
      >
        <h3 className="font-medium text-sm text-yellow-500">
          ¡Hola! Uno mas step, jefe!
        </h3>
      </motion.div>
      <input name="email" type="hidden" value={state.email} />
      <div className="flex space-x-2">
        <input
          aria-label="First name"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="min-h-[44px] w-24 select-none appearance-none rounded-lg bg-transparent px-2 text-left font-medium text-base text-stone-50 outline outline-1 outline-[#F15670] transition-transform duration-200 placeholder:text-center placeholder:font-light placeholder:text-stone-200 focus:scale-[1.02] focus:border-transparent focus:outline-2 active:scale-[1.02]"
          name="firstName"
          placeholder="First Name"
          required
          type="text"
        />
        <input
          aria-label="Last name"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="min-h-[44px] w-24 select-none appearance-none rounded-lg bg-transparent px-2 text-left font-medium text-base text-stone-50 outline outline-1 outline-[#F15670] transition-transform duration-200 placeholder:text-center placeholder:font-light placeholder:text-stone-200 focus:scale-[1.02] focus:border-transparent focus:outline-2 active:scale-[1.02]"
          name="lastName"
          placeholder="Last Name"
          required
          type="text"
        />
      </div>
      <input
        aria-label="Phone number"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        className="min-h-[44px] w-full select-none appearance-none rounded-lg bg-transparent px-2 text-left font-medium text-base text-stone-50 outline outline-1 outline-[#F15670] transition-transform duration-200 placeholder:text-center placeholder:font-light placeholder:text-stone-200 focus:scale-[1.02] focus:border-transparent focus:outline-2 active:scale-[1.02]"
        inputMode="tel"
        maxLength={14}
        name="phone"
        onChange={handlePhoneChange}
        placeholder="(123) 456-7890"
        required
        type="tel"
      />
    </motion.div>
  );

  const renderContent = () => {
    if (isPending) {
      return (
        <div className="flex h-[88px] w-full items-center justify-center">
          <LoadingSpinner size={50} />
        </div>
      );
    }

    // Show success screen only after details are submitted
    if (
      state.success &&
      state.step === "details" &&
      state.message === "Successfully subscribed!"
    ) {
      return (
        <div className="flex w-full flex-col items-center justify-center py-2">
          <span className="font-semibold text-sm text-yellow-500 uppercase transition-colors duration-300 ease-linear md:text-base">
            THANK YOU FOR SUBSCRIBING!
          </span>
          <span className="text-center font-bold text-sm text-stone-950 dark:text-stone-50">
            Welcome to La Familia Pueblito!
          </span>
        </div>
      );
    }

    // Show details step after email is validated
    if (state.step === "details") {
      return renderDetailsStep();
    }

    // Show email step by default
    return renderEmailStep();
  };

  const confettiProps = {
    width: dimensions.width,
    height: dimensions.height,
    colors: [
      "#F8C839",
      "#016945",
      "#CF0822",
      "#FFFFFF",
      "#EF6A4B",
      "#9DA26A",
      "#088589",
      "#91441A",
      "#717732",
      "#F690A1",
      "#30C2DC",
      "#0972A7",
      "#202020",
      "#CD202B",
      "#006847",
      "#FCF3D8",
    ],
    recycle: false,
    numberOfPieces: dimensions.width < 768 ? 222 : 444,
    gravity: 0.2,
    initialVelocityY: 20,
    tweenDuration: 999,
    onConfettiComplete: () => {
      setShowConfetti(false);
    },
  };

  // Create two confetti sources for mobile
  const mobileConfettiProps = {
    ...confettiProps,
    numberOfPieces: 111,
    confettiSource: {
      x: 0,
      y: confettiSource.y,
      w: 10,
      h: 0,
    },
    angle: 60,
    spread: 50,
  };

  const mobileConfettiProps2 = {
    ...confettiProps,
    numberOfPieces: 111,
    confettiSource: {
      x: confettiSource.x - 10,
      y: confettiSource.y,
      w: 10,
      h: 0,
    },
    angle: 120,
    spread: 50,
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex justify-center">
        {process.env.NODE_ENV === "development" && (
          <button
            className="fixed right-4 bottom-20 z-[9999] rounded-full bg-stone-950/90 p-3 text-sm text-stone-50 shadow-lg"
            onClick={() => setShowConfetti(true)}
            type="button"
          >
            Test Confetti 🎉
          </button>
        )}
        <div className="mx-auto my-6">
          <form action={submitAction} noValidate ref={formRef}>
            <motion.div
              className="group relative mx-auto inline-flex w-auto min-w-[300px] flex-col place-content-center place-items-baseline items-center divide-pueb whitespace-nowrap rounded-xl bg-stone-950/90 p-4 shadow-lg shadow-stone-950/75 backdrop-blur-sm transition-colors duration-300 ease-linear focus-within:drop-shadow-xl hover:divide-ora"
              onHoverEnd={stopColorAnimation}
              onHoverStart={startColorAnimation}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex w-full items-center justify-between">
                {state.success &&
                state.step === "details" &&
                state.message === "Successfully subscribed!" ? (
                  <motion.div
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex w-full flex-col items-center justify-center"
                    initial={{ scale: 0.5, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                      duration: 0.2,
                    }}
                  >
                    <span className="font-semibold text-sm text-yellow-500 uppercase transition-colors duration-300 ease-linear md:text-base">
                      THANK YOU FOR SUBSCRIBING!
                    </span>
                    <span className="pb-2 text-center text-sm text-stone-50">
                      Welcome to La Familia Pueblito
                    </span>
                  </motion.div>
                ) : (
                  <>
                    {renderContent()}
                    <button
                      aria-label="Subscribe"
                      className="ml-2 cursor-pointer border-none bg-transparent p-0"
                      disabled={isPending}
                      type="submit"
                    >
                      {state.step === "details" ? (
                        <CircleCheck className="mt-4 -ml-10 h-8 w-8 text-stone-50 transition-colors duration-300 ease-linear group-hover:text-green-600 md:stroke-2" />
                      ) : (
                        <CircleArrowRight className="mt-4 -ml-1 h-6 w-6 text-stone-50 transition-colors duration-300 ease-linear group-hover:text-[#30C2DC] md:stroke-2" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </form>

          {/* Separate AnimatePresence for error message */}
          <AnimatePresence>
            {state.error && state.message && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-2 flex w-auto flex-wrap items-center justify-center text-center"
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: -10 }}
                key={state.message}
                role="alert"
                transition={{
                  duration: 0.15,
                  ease: "easeOut",
                }}
              >
                <div className="rounded-lg bg-stone-950/90 px-3 py-1.5 backdrop-blur-sm">
                  <span className="font-light text-red-500/80 text-sm">
                    {state.message}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Separate AnimatePresence for confetti */}
          <AnimatePresence>
            {showConfetti && (
              <motion.div
                animate={{ opacity: 1 }}
                className="fixed top-0 right-0 bottom-0 left-0 z-[9999]"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                style={{
                  pointerEvents: "none",
                  position: "fixed",
                  overflow: "visible",
                  height: "100vh",
                  width: "100vw",
                }}
              >
                {dimensions.width < 768 ? (
                  <>
                    <ReactConfetti {...mobileConfettiProps} />
                    <ReactConfetti {...mobileConfettiProps2} />
                  </>
                ) : (
                  <ReactConfetti {...confettiProps} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </LazyMotion>
  );
}
