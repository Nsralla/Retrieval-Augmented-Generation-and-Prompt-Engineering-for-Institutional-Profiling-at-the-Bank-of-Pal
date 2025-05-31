// src/components/BranchReviews/NoDataMessage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface NoDataMessageProps {
  message: string;
  linkTo: string;
  linkText: string;
  isDarkMode: boolean;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({
  message,
  linkTo,
  linkText,
  isDarkMode,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>
        {message}
      </p>
      <Link
        to={linkTo}
        className={`
          mt-6 px-6 py-3 rounded-full
          ${isDarkMode
            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
            : 'bg-indigo-500 text-white hover:bg-indigo-600'
          }
          transition-colors
        `}
      >
        {linkText}
      </Link>
    </div>
  );
};

export default NoDataMessage;
