// pages/auth/Login.tsx
import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '@/components/custom/navbar';
import { BASE_URL,CONTENT_TYPE } from '@/api';
import axios from 'axios';
import { XCircleIcon } from 'lucide-react';

const Login: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate fields
    const newFieldErrors: typeof fieldErrors = {};
    if (!email.trim()) newFieldErrors.email = 'Email is required';
    else if (!email.includes('@')) newFieldErrors.email = 'Must be a valid email address';
    if (!password.trim()) newFieldErrors.password = 'Password is required';
    else if (password.length < 3) newFieldErrors.password = 'Password must be at least 3 characters';

    if (Object.keys(newFieldErrors).length) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await axios.post(`${BASE_URL}/login`, params, {
        headers: { 'Content-Type': CONTENT_TYPE },
      });

      if (response.status === 200) {
        const token = response.data.access_token;
        localStorage.setItem('token', token);
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.detail || 'Invalid email or password');
      } else {
        setError('Network error; please try again later.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate]);

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
          noValidate
        >
          <h2 className={`text-2xl font-bold text-center mb-6 ${textColor}`}>Login to Your Account</h2>

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
                type="button"
              >
                ✕
              </button>
            </div>
          )}

          {/* Email field */}
          <div className="mb-4">
            <label htmlFor="email" className={`block mb-1 ${textColor}`}>Email Address</label>
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

          {/* Password field */}
          <div className="mb-6">
            <label htmlFor="password" className={`block mb-1 ${textColor}`}>Password</label>
            <input
              type="password"
              id="password"
              autoComplete="current-password"
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-2 mb-4 font-semibold rounded-lg transition
              ${loading
                ? 'bg-red-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'}
            `}
          >
            {loading ? 'Logging in…' : 'Log In'}
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