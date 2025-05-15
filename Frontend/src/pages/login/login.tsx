// pages/auth/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '@/components/custom/navbar';
const Login: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with real authentication API
    if (email === 'user@bankofpalestine.com' && password === 'Password123') {
      navigate('/chat');
    } else {
      setError('Your email or password is incorrect.');
    }
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
        {/* Info Panel: fills left space */}
        <motion.div
          className="w-full lg:w-1/2 p-8"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className={`text-3xl font-bold mb-4 ${textColor}`}>Welcome to Bank of Palestine Chatbot</h3>
          <p className={`mb-6 ${textColor}`}>Your 24/7 virtual assistant for all banking needs. Get instant support on:</p>
          <ul className={`list-disc pl-5 space-y-2 ${textColor}`}>
            <li>Account balances and recent transactions</li>
            <li>Branch and ATM locations</li>
            <li>Loan and service inquiries</li>
          </ul>
        </motion.div>

        {/* Login Form Panel */}
        <motion.form
          onSubmit={handleSubmit}
          className={`w-full lg:w-1/3 ${cardBg} rounded-lg shadow-lg p-8 m-4`}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className={`text-2xl font-bold text-center mb-6 ${textColor}`}>
            Login to Your Account
          </h2>

          {error && <p className="mb-4 text-center text-red-600">{error}</p>}

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

          <div className="mb-6">
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

          <button
            type="submit"
            className="w-full py-2 mb-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
          >
            Log In
          </button>

          <p className={`text-center text-sm ${textColor}`}>
            Don't have an account?{' '}
            <Link to="/signup" className="text-red-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </motion.form>
      </motion.div>
    </>
  );
};

export default Login;
