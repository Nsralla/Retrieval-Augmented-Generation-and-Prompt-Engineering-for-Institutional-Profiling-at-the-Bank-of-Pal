import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

const Navbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // determine auth state from token
  const token = localStorage.getItem('token');
  const isAuthenticated = Boolean(token);

  // invert logo colors on dark background
  const logoStyle = isDarkMode ? { filter: 'brightness(0) invert(1)' } : undefined;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

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
        {!isAuthenticated && (
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
        )}

        {isAuthenticated && (
          <>
            <Link
              to="/profile"
              className="px-4 py-2 text-white hover:text-gray-200"
            >
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

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-blue-700 text-white transition"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        <Link
          to="/chat"
          className="px-4 py-2 bg-yellow-400 text-blue-800 font-semibold rounded-lg hover:bg-yellow-300 transition"
        >
          Start Chatting
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
