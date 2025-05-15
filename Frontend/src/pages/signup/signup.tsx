// pages/auth/Signup.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '@/components/custom/navbar';
const Signup: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // TODO: Replace with real signup API integration
    // On success:
    navigate('/chat');
  };

  // Theme-based classes
  const containerBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-100';
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const inputBg = isDarkMode ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDarkMode ? 'border-gray-600' : 'border-gray-300';

  return (
    <>
      <Navbar />

      <motion.div
        className={`flex flex-col lg:flex-row items-center justify-center min-h-screen ${containerBg}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Info Panel */}
        <motion.div
          className="w-full lg:w-1/2 p-8"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className={`text-3xl font-bold mb-4 ${textColor}`}>Join Bank of Palestine</h3>
          <p className={`mb-6 ${textColor}`}>Create your secure account and enjoy:</p>
          <ul className={`list-disc pl-5 space-y-2 ${textColor}`}>
            <li>Fast, 24/7 chatbot support</li>
            <li>Secure access to balances and transactions</li>
            <li>Exclusive online services and offers</li>
          </ul>
        </motion.div>

        {/* Signup Form Panel */}
        <motion.form
          onSubmit={handleSubmit}
          className={`w-full lg:w-1/3 ${cardBg} rounded-lg shadow-lg p-8 m-4`}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className={`text-2xl font-bold text-center mb-6 ${textColor}`}>Create Account</h2>

          {error && <p className="mb-4 text-center text-red-600">{error}</p>}

          <div className="mb-4">
            <label htmlFor="fullName" className={`block mb-1 ${textColor}`}>Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              placeholder="Your Name"
              className={`w-full px-4 py-2 border ${inputBorder} rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 ${inputBg} ${textColor}`}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className={`block mb-1 ${textColor}`}>Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@bankofpalestine.com"
              className={`w-full px-4 py-2 border ${inputBorder} rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 ${inputBg} ${textColor}`}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className={`block mb-1 ${textColor}`}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={`w-full px-4 py-2 border ${inputBorder} rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 ${inputBg} ${textColor}`}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className={`block mb-1 ${textColor}`}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={`w-full px-4 py-2 border ${inputBorder} rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 ${inputBg} ${textColor}`}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mb-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
          >
            Sign Up
          </button>

          <p className={`text-center text-sm ${textColor}`}>
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 hover:underline">Log In</Link>
          </p>
        </motion.form>
      </motion.div>
    </>
  );
};

export default Signup;
