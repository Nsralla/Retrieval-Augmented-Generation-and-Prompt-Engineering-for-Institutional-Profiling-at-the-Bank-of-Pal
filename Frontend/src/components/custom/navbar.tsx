// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '@/context/ThemeContext';
import { BASE_URL } from '@/api';
import { isTokenExpired } from '@/utils/auth';
const Navbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAuthenticated = Boolean(token);

  const [creating, setCreating] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleStartChat = async () => {
    if (!isAuthenticated || isTokenExpired(token)) {
      navigate('/login');
      return;
    }

    setCreating(true);
    try {
      const resp = await axios.post<{ id: string }>(
        `${BASE_URL}/chats/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/chat/${resp.data.id}`);
    } catch (err) {
      console.error('Failed to start chat', err);
      // optionally show a toast or set an error state here
    } finally {
      setCreating(false);
    }
  };

  const logoStyle = isDarkMode
    ? { filter: 'brightness(0) invert(1)' }
    : undefined;

  return (
    <nav className="sticky top-0 z-50 w-full px-8 py-4 flex items-center justify-between shadow-lg bg-blue-200 dark:bg-gray-800">
      {/* Logo */}
      <div className="header-logo flex-shrink-0">
        <Link to="/" className="inline-block" rel="noopener noreferrer">
          <img
            alt="BOP LOGO"
            width={200}
            height={48}
            src="https://bopwebsitestorage.blob.core.windows.net/assets/img/logo-light.png"
            style={logoStyle}
          />
        </Link>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="px-4 py-2 text-white hover:text-gray-200">
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-white text-blue-800 rounded-lg hover:bg-gray-100 transition"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <Link to="/profile" className="px-4 py-2 text-white hover:text-gray-200">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-blue-700 text-white transition"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Start Chatting */}
        {isAuthenticated && (
            <button
                      onClick={handleStartChat}
                      disabled={creating}
                      className={`
                        px-4 py-2 font-semibold rounded-lg transition 
                        ${creating
                          ? 'bg-yellow-200 cursor-not-allowed text-gray-500'
                          : 'bg-yellow-400 hover:bg-yellow-300 text-blue-800'}
                      `}
                    >
                      {creating ? 'Starting…' : 'Start Chatting'}
                    </button>
        )}
        
      </div>
    </nav>
  );
};

export default Navbar;
