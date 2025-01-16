'use client';

import { subscribe } from '@/app/actions';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import { motion, useAnimationControls } from 'framer-motion';
import React, { useActionState } from 'react';
import ReactConfetti from 'react-confetti';
import { useFormStatus } from 'react-dom';
import { SpinnerInfinity } from 'spinners-react';

type SubscribeState = {
  message?: string;
  error?: boolean | string;
  success?: boolean;
  step?: 'email' | 'details';
  email?: string;
};

const initialState: SubscribeState = {
  message: '',
  error: false,
  success: false,
  step: 'email',
};

// Create a wrapper function that converts FormData to the expected format
async function subscribeFormAction(
  prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  // Get email and ensure it exists
  const email = formData.get('email');
  if (!email) {
    return {
      error: true,
      message: 'Please enter your email',
      step: 'email' as const,
      success: false,
    };
  }

  // If we're in the details step, get all fields
  if (prevState.step === 'details') {
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const phone = formData.get('phone');

    // Check if all required fields are present
    if (!firstName || !lastName || !phone) {
      return {
        error: true,
        message: 'Please fill in all fields',
        step: 'details',
        success: false,
      };
    }

    return subscribe(prevState, {
      email: email.toString(),
      firstName: firstName.toString(),
      lastName: lastName.toString(),
      phone: phone.toString(),
    });
  }

  // Otherwise just send email for first step
  return subscribe(prevState, { email: email.toString() });
}

export default function Subscribe() {
  const [state, formAction] = useActionState(subscribeFormAction, initialState);
  const { pending } = useFormStatus();
  const controls = useAnimationControls();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);

  // DEV: Add button to trigger confetti
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const startColorAnimation = async () => {
    await controls.start({
      color: ['#FFFFFF', '#EAB308', '#FFFFFF', '#EAB308'],
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
        times: [0, 0.3, 0.6, 1],
      },
    });
  };

  const stopColorAnimation = () => {
    controls.start({
      color: '#FFFFFF',
      transition: { duration: 0.2 },
    });
  };

  // Reset form when step changes
  React.useEffect(() => {
    if (state.step === 'details' && formRef.current) {
      formRef.current.reset();
    }
  }, [state.step]);

  // Show confetti when subscription is successful
  React.useEffect(() => {
    if (
      state.success &&
      state.step === 'details' &&
      state.message === 'Successfully subscribed!'
    ) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const renderEmailStep = () => (
    <div className="pt-4">
      <motion.div
        className="absolute top-4 right-0 left-0 appearance-none font-semibold text-stone-900 opacity-0 transition-colors duration-300 ease-linear group-hover:text-green-600 dark:text-stone-50 dark:group-hover:text-pueb"
        animate={{ opacity: 1, y: -10 }}
        transition={{
          ease: 'linear',
          duration: 0.08,
          x: { duration: 0.15 },
        }}
        style={{ pointerEvents: 'none' }}
      >
        <h3 className="text-center text-sm text-stone-900 transition-colors duration-300 ease-linear dark:text-stone-50">
          La Familia Pueblito
        </h3>
      </motion.div>
      <span className="relative font-semibold text-sm md:text-base">
        <motion.span
          animate={controls}
          className="relative inline-block text-stone-50"
          initial={{ color: '#FFFFFF' }}
        >
          email
        </motion.span>
      </span>
      <span>
        <input
          className="mx-2 w-48 appearance-none rounded-lg bg-transparent px-2 py-1 text-left font-light text-[.6rem] text-stone-900 ring-1 ring-pueb placeholder:text-center placeholder:text-pueb focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-50 dark:text-stone-50"
          name="email"
          required
          type="email"
          defaultValue={state.email}
          placeholder="your@email.com"
          aria-label="Email address"
          key="email-input"
        />
      </span>
    </div>
  );

  const renderDetailsStep = () => (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col space-y-3"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-2 text-center"
      >
        <h3 className="font-medium text-sm text-yellow-500">
          ¡Hola! Uno mas step, amigo!
        </h3>
      </motion.div>
      <input type="hidden" name="email" value={state.email} />
      <div className="flex space-x-2">
        <input
          className="w-24 appearance-none rounded-lg bg-transparent px-2 py-1 text-left font-light text-[.6rem] text-stone-900 ring-1 ring-pueb placeholder:text-center placeholder:text-pueb focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-50 dark:text-stone-50"
          name="firstName"
          required
          type="text"
          placeholder="First Name"
          aria-label="First name"
        />
        <input
          className="w-24 appearance-none rounded-lg bg-transparent px-2 py-1 text-left font-light text-[.6rem] text-stone-900 ring-1 ring-pueb placeholder:text-center placeholder:text-pueb focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-50 dark:text-stone-50"
          name="lastName"
          required
          type="text"
          placeholder="Last Name"
          aria-label="Last name"
        />
      </div>
      <input
        className="w-full appearance-none rounded-lg bg-transparent px-2 py-1 text-left font-light text-[.6rem] text-stone-900 ring-1 ring-pueb placeholder:text-center placeholder:text-pueb focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-50 dark:text-stone-50"
        name="phone"
        required
        type="tel"
        placeholder="(123) 456-7890"
        aria-label="Phone number"
      />
    </motion.div>
  );

  const renderContent = () => {
    if (pending) {
      return (
        <div className="flex items-center justify-center py-2">
          <SpinnerInfinity
            size={50}
            thickness={148}
            speed={140}
            color="pueb"
            secondaryColor="#03502D"
          />
        </div>
      );
    }

    // Show success screen only after details are submitted
    if (
      state.success &&
      state.step === 'details' &&
      state.message === 'Successfully subscribed!'
    ) {
      return (
        <div className="flex w-full flex-col items-center justify-center py-2">
          <span className="font-semibold text-sm text-yellow-500 uppercase transition-colors duration-300 ease-linear md:text-base">
            THANK YOU FOR SUBSCRIBING!
          </span>
          <span className="text-center text-stone-50 text-xs">
            Welcome to La Familia Pueblito
          </span>
        </div>
      );
    }

    // Show details step after email is validated
    if (state.step === 'details') {
      return renderDetailsStep();
    }

    // Show email step by default
    return renderEmailStep();
  };

  return (
    <div className="flex justify-center">
      {showConfetti && (
        <div className="fixed inset-0 z-50" style={{ pointerEvents: 'none' }}>
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            colors={[
              '#F8C839',
              '#016945',
              '#CF0822',
              '#FFFFFF',
              '#EF6A4B',
              '#9DA26A',
              '#088589',
              '#91441A',
              '#717732',
              '#F690A1',
              '#30C2DC',
              '#0972A7',
              '#202020',
              '#CD202B',
              '#006847',
              '#FCF3D8',
            ]}
            recycle={false}
            numberOfPieces={444}
            gravity={0.07}
            initialVelocityY={4}
            tweenDuration={999}
          />
        </div>
      )}
      <div className="mx-auto my-6">
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={triggerConfetti}
            className="absolute top-4 right-4 rounded-lg bg-stone-800 px-3 py-1 text-white text-xs hover:bg-stone-700"
            type="button"
          >
            Test Confetti
          </button>
        )}
        <form ref={formRef} action={formAction} noValidate>
          <motion.div
            className="group relative mx-auto inline-flex w-auto min-w-[300px] flex-col place-content-center place-items-baseline items-center divide-pueb whitespace-nowrap rounded-xl bg-stone-50/70 p-4 shadow-lg shadow-stone-950/75 backdrop-blur-sm transition-colors duration-300 ease-linear focus-within:drop-shadow-xl hover:divide-ora dark:bg-stone-950/90"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={startColorAnimation}
            onHoverEnd={stopColorAnimation}
          >
            <div className="flex w-full items-center justify-between">
              {state.success &&
              state.step === 'details' &&
              state.message === 'Successfully subscribed!' ? (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 15,
                    duration: 0.2,
                  }}
                  className="flex w-full flex-col items-center justify-center"
                >
                  <span className="font-semibold text-sm text-yellow-500 uppercase transition-colors duration-300 ease-linear md:text-base">
                    THANK YOU FOR SUBSCRIBING!
                  </span>
                  <span className="pb-2 text-center text-stone-50 text-xs">
                    Welcome to La Familia Pueblito
                  </span>
                </motion.div>
              ) : (
                <>
                  {renderContent()}
                  <button
                    type="submit"
                    className="ml-2 cursor-pointer border-none bg-transparent p-0"
                    aria-label="Subscribe"
                    disabled={pending}
                  >
                    <ArrowRightCircleIcon className="h-8 w-8 text-stone-50 transition-colors duration-300 ease-linear group-hover:text-green-600 md:stroke-2 dark:text-stone-50" />
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto mt-2 flex w-auto flex-wrap items-center justify-center text-center"
              role="alert"
            >
              <div className="rounded-lg bg-stone-50/70 px-3 py-1.5 backdrop-blur-sm dark:bg-stone-950/90">
                <span className="font-light text-red-500/80 text-xs">
                  {state.message}
                </span>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
}
