// components/custom/Overview.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, BotIcon } from 'lucide-react';

export const Overview: React.FC = () => {
  return (
    <div className="flex-grow flex items-center justify-center">
      <motion.div
        key="overview"
        className="flex flex-col items-center justify-center max-w-3xl mx-auto"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ delay: 0.75 }}
      >
        <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl mt-16">
          <p className="flex flex-row justify-center gap-4 items-center">
            <BotIcon size={44} />
            <span>+</span>
            <MessageCircle size={44} />
          </p>
          <p>
            Welcome to <strong>BOP-chatbot</strong><br />
            Your AI-powered assistant for all your banking needs.
          </p>
        </div>
      </motion.div>
    </div>
  );
};