'use client';

import { subscribe } from '@/subscribe';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import { motion, useAnimationControls } from 'framer-motion';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { SpinnerInfinity } from 'spinners-react';

export default function Subscribe() {
  const [state, formAction] = useActionState(subscribe, {
    message: '',
    error: false,
    success: false,
  });

  const { pending } = useFormStatus();
  const controls = useAnimationControls();

  const startColorAnimation = async () => {
    await controls.start({
      color: ['#18181B', '#EAB308', '#18181B', '#EAB308'],
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
        times: [0, 0.3, 0.6, 1],
      },
    });
  };

  const stopColorAnimation = () => {
    controls.start({
      color: '#18181B',
      transition: { duration: 0.2 },
    });
  };

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

    if (state.success) {
      return (
        <div className="flex flex-col items-center space-y-2">
          <span className="font-semibold text-pueb text-sm uppercase transition-colors duration-300 ease-linear group-hover:text-[#03502D] md:text-base dark:text-zinc-50 dark:group-hover:text-pueb">
            Thank you for subscribing!
          </span>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            Welcome to La Familia Pueblito
          </span>
        </div>
      );
    }

    return (
      <>
        <div className="">
          <span className="relative font-semibold text-sm md:text-base">
            <motion.span
              animate={controls}
              className="relative inline-block"
              initial={{ color: '#18181B' }}
            >
              email
            </motion.span>
          </span>
          <span>
            <input
              className="mx-2 w-48 appearance-none rounded-lg bg-transparent px-2 py-1 text-left font-light text-[.6rem] text-zinc-900 ring-1 ring-pueb placeholder:text-center placeholder:text-pueb focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-50 dark:text-zinc-50"
              name="email"
              required
              type="email"
              placeholder=""
            />
          </span>
        </div>

        <button
          type="submit"
          className="cursor-pointer border-none bg-transparent p-0"
        >
          <ArrowRightCircleIcon className="h-8 w-8 text-pueb transition-colors duration-300 ease-linear group-hover:text-[#03502D] md:stroke-2 dark:text-zinc-50" />
        </button>

        <motion.div
          className="absolute top-0 right-0 left-0 appearance-none pt-4 font-semibold text-zinc-900 opacity-0 transition-colors duration-300 ease-linear group-hover:text-[#03502D] dark:text-zinc-50 dark:group-hover:text-pueb"
          animate={{ opacity: 1, y: -10 }}
          transition={{
            ease: 'linear',
            duration: 0.08,
            x: { duration: 0.15 },
          }}
          style={{ pointerEvents: 'none' }}
        >
          <h3 className="text-center text-sm text-zinc-900 transition-colors duration-300 ease-linear dark:text-zinc-50">
            La Familia Pueblito
          </h3>
        </motion.div>
      </>
    );
  };

  return (
    <div className="flex justify-center">
      <div className="mx-auto my-6">
        <form action={formAction} noValidate>
          <motion.div
            className="group relative mx-auto inline-flex w-auto place-content-center place-items-baseline items-center divide-pueb whitespace-nowrap rounded-xl bg-zinc-50/70 px-4 pt-10 pb-5 shadow-lg shadow-zinc-950/75 backdrop-blur-sm transition-colors duration-300 ease-linear focus-within:drop-shadow-xl hover:divide-ora dark:bg-zinc-950/90"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onHoverStart={startColorAnimation}
            onHoverEnd={stopColorAnimation}
          >
            {renderContent()}
          </motion.div>

          <div className="mx-auto mt-2 flex w-auto flex-wrap items-center justify-center text-center">
            {state.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg bg-zinc-50/70 px-3 py-1.5 backdrop-blur-sm dark:bg-zinc-950/90"
              >
                <span className="font-light text-red-500/80 text-xs">
                  {state.message}
                </span>
              </motion.div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
