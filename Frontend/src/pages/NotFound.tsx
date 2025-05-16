// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import Navbar from '@/components/custom/navbar';
import lostRobotUrl from '@/assets/robot-lost.svg';

const NotFound: React.FC = () => {
  const { isDarkMode } = useTheme();
  const token = localStorage.getItem('token');
  const isAuthenticated = Boolean(token);

  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-gray-100';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const buttonBg = isDarkMode ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-yellow-400 hover:bg-yellow-300';

  return (
    <>
      <Navbar />

      <div className={`flex flex-col items-center justify-center min-h-screen px-4 ${bgColor}`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-center"
        >
          Illustration
         <div className="mb-8">
          <img
            src={lostRobotUrl}
            alt="Lost robot illustration"
            className="mx-auto w-48 h-48"
          />
        </div>

          {/* Error Message */}
          <h1 className={`text-5xl font-extrabold mb-4 ${textColor}`}>
            404
          </h1>
          <p className={`mb-6 ${textColor}`}>
            Oops! We can’t find that page. Our friendly chatbot must have lost its way.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className={`
                ${buttonBg} text-blue-800 font-semibold px-6 py-3 rounded-lg
                transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300
              `}
            >
              Go Home
            </Link>
            {isAuthenticated && ( <Link
              to="/chat"
              className={`
                ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-700 hover:bg-blue-600'}
                text-white font-semibold px-6 py-3 rounded-lg transition
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400
              `}
            >
              Ask the Bot
            </Link>)}
           
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;
