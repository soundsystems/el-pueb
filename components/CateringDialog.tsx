"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <DialogContent
        className="relative border-2 border-gray-200 bg-[#E3D6C3] shadow-xl sm:max-w-md"
        onEscapeKeyDown={() => onClose()} // explicit ESC close
      >
        {/* Close button (shadcn) */}
        <DialogClose
          aria-label="Close"
          className="absolute top-4 right-4 rounded-md p-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </DialogClose>

        <DialogHeader>
          <DialogTitle className="font-bold text-2xl text-gray-800">
            Catering Orders
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border-2 border-[#0B8489] bg-[#0B8489] p-4">
            <p className="text-sm text-zinc-50">
              <strong>Note:</strong> The "Catering" option will be automatically
              selected for you in the contact form.
            </p>
            <p className="mt-2 text-sm text-zinc-50">
              Ready to place your catering order? Fill out the contact form         below below and we'll get back to you soon!
            </p>
          </div>

          <div className="rounded-lg bg-zinc-950 p-4">
            <p className="font-bold text-base text-yellow-400">
              ¿El Pueblito es tu restaurante favorito de todo el mundo?
            </p>
            <p className="font-medium text-base text-yellow-400">
              ¡Turn your weekly team lunch into a fiesta!
            </p>
            <p className="mt-2 text-sm text-zinc-50">
              <strong>For Business Customers:</strong> If you're ordering for
              your company or want to set up a recurring deal, please select the
              "Business" tab instead.
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-center">
          <Button
            className="bg-[#0B8489] px-8 py-2 text-white hover:bg-[#02534E]"
            onClick={() => {
              const contactForm = document.getElementById("contact-form");
              if (contactForm) {
                contactForm.scrollIntoView({ behavior: "smooth" });
              }
              onClose();
            }}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
