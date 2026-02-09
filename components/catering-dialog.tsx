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

type CateringDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CateringDialog({
  isOpen,
  onClose,
}: CateringDialogProps) {
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
      <DialogContent className="sm:-translate-y-1/2 -translate-y-0 top-4 rounded-xl border-2 border-gray-200 bg-[#E3D6C3] shadow-2xl sm:top-[50%] sm:max-w-lg [&>button]:hidden">
        <DialogHeader className="-mx-6 px-6">
          <DialogTitle className="text-center font-bold text-2xl text-gray-800">
            {currentStep === 1 ? "Catering Orders" : "Corporate Catering"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Orange Catering Info */}
          {currentStep === 1 && (
            <div className="rounded-xl border-2 border-[#F16D15] bg-[#F16D15] p-6 shadow-lg">
              <p className="mb-4 font-semibold text-base text-white">
                Ready to place your catering order? Fill out the contact form
                and we'll get back to you as soon as we can!
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-white" />
                  <p className="font-medium text-sm text-white">
                    <strong>Fresh & Made-to-Order:</strong> Every dish is
                    prepared with care, using quality ingredients, so your
                    spread arrives as flavorful as it does in our restaurant.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-white" />
                  <p className="font-medium text-sm text-white">
                    <strong>Flexible for Any Group:</strong> From small
                    gatherings to large celebrations, we can accommodate groups
                    of all sizes.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-white/20 p-3">
                <p className="font-semibold text-sm text-white">
                  <strong>Note:</strong> The "Catering" option will be
                  automatically selected for you in the contact form.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Blue Business Info */}
          {currentStep === 2 && (
            <div className="-mx-4 rounded-xl bg-[#30C2DC] p-6 shadow-sm">
              <div className="mb-4 rounded-lg bg-white/70 p-4 text-center shadow-sm">
                <p className="font-black text-[#02534E] text-base sm:text-sm">
                  ¿El Pueblito es tu restaurante favorito de todo el mundo?
                </p>
                <p className="mt-2 font-bold text-[#0B8489] text-base sm:text-sm">
                  Turn your weekly team lunch into a fiesta! 🎉
                </p>
              </div>

              <div className="rounded-lg bg-white/60 p-4 shadow-sm">
                <p className="font-medium text-[#0B8489] text-sm">
                  <strong className="font-bold text-[#02534E]">
                    🏢 For Business Customers:
                  </strong>{" "}
                  If you're ordering for your company or want to set up a
                  recurring deal, please select the "Business" tab instead.
                </p>
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
                // Update URL to include catering parameter
                const url = new URL(window.location.href);
                url.searchParams.set("catering", "true");
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
