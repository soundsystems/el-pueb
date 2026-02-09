"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ContactForm from "@/components/ContactForm";
import CateringDialog from "@/components/catering-dialog";
import EventDialog from "@/components/event-dialog";

const Contact = () => {
  const searchParams = useSearchParams();
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showCateringDialog, setShowCateringDialog] = useState(false);

  useEffect(() => {
    const cateringParam = searchParams.get("catering");
    const eventParam = searchParams.get("event");

    if (cateringParam === "true") {
      setShowCateringDialog(true);
      // Scroll to top when catering dialog opens - use instant scroll for better UX
      window.scrollTo({ top: 0, behavior: "instant" });
    } else if (eventParam === "true") {
      setShowEventDialog(true);
      // Scroll to top when event dialog opens - use instant scroll for better UX
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [searchParams]);

  return (
    <AnimatePresence mode="wait">
      <motion.main
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none mb-2 select-none pt-4 text-center font-black text-3xl text-stone-900 md:mb-4 md:pt-6 md:text-5xl"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          Get in Touch
        </motion.h1>
        <motion.div
          animate={{ y: 0 }}
          className="w-full"
          id="contact-form"
          initial={{ y: 20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ContactForm />
        </motion.div>

        <CateringDialog
          isOpen={showCateringDialog}
          onClose={() => setShowCateringDialog(false)}
        />

        <EventDialog
          isOpen={showEventDialog}
          onClose={() => setShowEventDialog(false)}
        />
      </motion.main>
    </AnimatePresence>
  );
};

export default Contact;
