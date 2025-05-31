// src/pages/BranchRatings.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/custom/navbar';
import { useTheme } from '../../context/ThemeContext';
import starsDataRaw from '../../data/stars.json';

interface StarEntry {
  location: string;
  star: number;
  image: string;
}

const BranchRatings: React.FC = () => {
  const [starsData, setStarsData] = useState<StarEntry[]>([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    setStarsData(starsDataRaw as StarEntry[]);
  }, []);

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'} min-h-screen flex flex-col`}>
      <Navbar />

      <section
        className={`
          w-full py-12 px-6
          ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-blue-50 text-blue-800'}
        `}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center tracking-wide">
            تقييمات الفروع
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {starsData.map((entry) => (
              <Link
                key={entry.location}
                to={`/reviews/${encodeURIComponent(entry.location)}`}
                className={`
                  relative flex flex-col items-center text-center
                  bg-white dark:bg-gray-700 rounded-2xl border border-transparent
                  hover:border-blue-400 dark:hover:border-teal-400
                  transition-all duration-300
                  transform hover:scale-[1.03]
                  shadow-md hover:shadow-xl
                  overflow-hidden
                `}
              >
                {entry.image ? (
                  <img
                    src={entry.image}
                    alt={`${entry.location} thumbnail`}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div
                    className={`
                      w-full h-40 flex items-center justify-center
                      ${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-blue-100 text-blue-600'}
                    `}
                  >
                    <span className="text-xl font-semibold px-4">
                      {entry.location}
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col items-center">
                  <p className="text-lg font-semibold mb-2">
                    {entry.location}
                  </p>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold mr-1 text-yellow-400">
                      ★
                    </span>
                    <span className="text-2xl font-bold">
                      {entry.star.toFixed(1)}
                    </span>
                  </div>
                </div>

                <span
                  className={`
                    absolute top-3 right-3 flex items-center justify-center
                    bg-blue-500 text-white dark:bg-teal-500 dark:text-gray-900
                    rounded-full w-10 h-10 text-sm font-semibold
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  `}
                >
                  {entry.star.toFixed(1)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BranchRatings;
