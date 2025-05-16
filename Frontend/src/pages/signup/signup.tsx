// src/pages/auth/Signup.tsx

import React, { useState, useCallback, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { XCircleIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '@/components/custom/navbar';
import { BASE_URL } from '@/api';

interface SignupResponse {
  token: string;
}

const Signup: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setFieldErrors({});

      // client-side validation
      const errors: typeof fieldErrors = {};

      if (!fullName.trim()) {
        errors.fullName = 'Full name is required';
      }

      if (!email.trim()) {
        errors.email = 'Email is required';
      } else if (!email.includes('@')) {
        errors.email = 'Must be a valid email address';
      }

      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }

      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (confirmPassword !== password) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(errors).length) {
        setFieldErrors(errors);
        return;
      }

      // submit
      setLoading(true);
      try {
        const response = await axios.post<SignupResponse>(
          `${BASE_URL}/signup`,
          {
            name: fullName,
            email,
            password,
            is_admin: false,
          }
        );
        // assume token in response.token if needed
        // localStorage.setItem('token', response.data.token);
        navigate('/');
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          const data = err.response.data as { detail?: string };
          setError(data.detail ?? 'Sign up failed; please try again.');
        } else {
          setError('Network error; please try again later.');
        }
      } finally {
        setLoading(false);
      }
    },
    [fullName, email, password, confirmPassword, navigate]
  );

  // theme-based classes
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
          <p className={`mb-6 ${textColor}`}>
            Create your secure account and enjoy:
          </p>
          <ul className={`list-disc pl-5 space-y-2 ${textColor}`}>
            <li>Fast, 24/7 chatbot support</li>
            <li>Secure access to balances and transactions</li>
            <li>Exclusive online services and offers</li>
          </ul>
        </motion.div>

        {/* Signup Form Panel */}
        <motion.form
          onSubmit={handleSubmit}
          noValidate
          className={`w-full lg:w-1/3 ${cardBg} rounded-lg shadow-lg p-8 m-4`}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className={`text-2xl font-bold text-center mb-6 ${textColor}`}>
            Create Account
          </h2>

          {/* Global error alert */}
          {error && (
            <div
              className="flex items-start bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              role="alert"
              aria-live="polite"
            >
              <XCircleIcon className="w-6 h-6 mr-2 shrink-0" />
              <p className="flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          {/* Full Name */}
          <div className="mb-4">
            <label htmlFor="fullName" className={`block mb-1 ${textColor}`}>
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className={`
                w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                ${fieldErrors.fullName ? 'border-red-500 focus:ring-red-300' : inputBorder}
                ${inputBg} ${textColor}
              `}
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className={`block mb-1 ${textColor}`}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`
                w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                ${fieldErrors.email ? 'border-red-500 focus:ring-red-300' : inputBorder}
                ${inputBg} ${textColor}
              `}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className={`block mb-1 ${textColor}`}>
              Password
            </label>
            <input
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`
                w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                ${fieldErrors.password ? 'border-red-500 focus:ring-red-300' : inputBorder}
                ${inputBg} ${textColor}
              `}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className={`block mb-1 ${textColor}`}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`
                w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-300' : inputBorder}
                ${inputBg} ${textColor}
              `}
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-2 mb-4 font-semibold rounded-lg transition
              ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'}
            `}
          >
            {loading ? 'Signing Up…' : 'Sign Up'}
          </button>

          <p className={`text-center text-sm ${textColor}`}>
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 hover:underline">
              Log In
            </Link>
          </p>
        </motion.form>
      </motion.div>
    </>
  );
};

export default Signup;
