'use client';

import ContactForm from '@/components/ContactForm';
import { AnimatePresence, motion } from 'motion/react';

const Contact = () => {
  return (
    <AnimatePresence mode="wait">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          id="contact-form"
          className="w-full"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ContactForm />
        </motion.div>
      </motion.main>
    </AnimatePresence>
  );
};

export default Contact;
