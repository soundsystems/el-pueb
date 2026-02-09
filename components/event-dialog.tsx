"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EventDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function EventDialog({ isOpen, onClose }: EventDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Reset to step 1 when dialog opens
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  if (!mounted) {
    return null;
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        // Triggers for overlay click, ESC, and close button via Radix
        if (!open) {
          onClose();
        }
      }}
      open={isOpen}
    >
      <DialogContent className="fixed top-4 right-4 left-4 z-50 grid w-auto max-w-lg translate-x-0 translate-y-0 gap-4 border-2 border-gray-200 bg-[#E3D6C3] p-4 shadow-2xl sm:top-[50%] sm:right-auto sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-xl sm:p-6 [&>button]:hidden">
        <DialogHeader className="-mx-4 sm:-mx-6 px-4 sm:px-6">
          <DialogTitle className="text-center font-bold text-2xl text-gray-800">
            {currentStep === 1 ? "Event Bookings" : "Event Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Step 1: Main Event Info */}
          {currentStep === 1 && (
            <div className="rounded-xl border-2 border-[#F16D15] bg-[#F16D15] p-4 shadow-lg sm:p-6">
              <div className="mb-4 rounded-lg bg-orange-200/30 px-2 py-3 text-center shadow-sm">
                <h2 className="font-bold text-lg text-zinc-50">
                  Bringing the whole barrio? No problemo!
                </h2>
              </div>
              <p className="mb-2 font-semibold text-base text-white">
                Just fill out the contact form and we'll be in touch shortly!
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-white" />
                  <p className="font-medium text-sm text-white">
                    <strong>Event Planning:</strong> From intimate gatherings to
                    large celebrations, we can help make your special occasion
                    memorable.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-white" />
                  <p className="font-medium text-sm text-white">
                    <strong>Large Groups:</strong> For parties of 10+ people, we
                    can help coordinate your event needs and ensure a great
                    experience.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-white/20 p-3">
                <p className="font-semibold text-sm text-white">
                  <strong>Note:</strong> The "Event Booking Inquiry" option will
                  be automatically selected for you in the contact form.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: What to Include Section */}
          {currentStep === 2 && (
            <div className="rounded-xl border-2 border-[#30C2DC] bg-[#30C2DC] px-2 py-3 shadow-lg sm:py-4">
              <div className="mb-4 rounded-lg bg-white/70 p-3 text-center shadow-sm">
                <h3 className="font-bold text-base text-zinc-950">
                  What to include in your message:
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-white" />
                  <p className="font-medium text-sm text-white">
                    <strong>Event Details:</strong> Date, time, and type of
                    event
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-white" />
                  <p className="font-medium text-sm text-white">
                    <strong>Guest Count:</strong> Number of people attending
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-white" />
                  <p className="font-medium text-sm text-white">
                    <strong>Special Requests:</strong> Any dietary restrictions
                    or special accommodations needed
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-center pt-4">
          <motion.div
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              className="rounded-full px-10 py-3 font-semibold text-lg text-white shadow-lg transition-all duration-300 hover:bg-[#FD2821] hover:shadow-xl"
              onClick={() => {
                // Both mobile and desktop: Step through the dialog flow
                if (currentStep === 1) {
                  setCurrentStep(2);
                  return;
                }

                // Final step: proceed to contact form
                // Update URL to include event parameter
                const url = new URL(window.location.href);
                url.searchParams.set("event", "true");
                window.history.replaceState({}, "", url.toString());

                const contactForm = document.getElementById("contact-form");
                if (contactForm) {
                  contactForm.scrollIntoView({ behavior: "smooth" });
                }
                onClose();
              }}
              style={{
                backgroundColor: currentStep === 2 ? "#30C2DC" : "#F16D15",
              }}
            >
              {currentStep === 1 ? "Continue" : "Get Started"}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
