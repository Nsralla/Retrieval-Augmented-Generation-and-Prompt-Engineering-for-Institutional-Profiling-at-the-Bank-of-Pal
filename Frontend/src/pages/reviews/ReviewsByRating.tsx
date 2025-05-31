// src/pages/ReviewsByRating.tsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/custom/navbar';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import reviewsDataRaw from '../../data/bank_reviews.json';

interface Review {
  review: string;
  stars: number;
  reviewer: string;
  source: string;
  location: string;
}

const ReviewsByRating: React.FC = () => {
  const { star } = useParams<{ star: string }>();
  const rating = parseInt(star || '0', 10);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!isNaN(rating)) {
      const matches = (reviewsDataRaw as Review[]).filter((r) => r.stars === rating);
      setFilteredReviews(matches);
    }
  }, [rating]);

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} min-h-screen flex flex-col`}>
      <Navbar />

      {/* Header Section */}
      <section className={`w-full`}>
        <div
          className={`
            w-full py-8 px-6 
            bg-gradient-to-br 
            ${isDarkMode ? 'from-indigo-800 to-purple-800 text-white' : 'from-indigo-500 to-purple-500 text-white'}
          `}
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <h2 className="text-4xl font-bold flex items-center space-x-2">
              <span>{rating}</span>
              <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.959c.3.921-.755 1.688-1.54 1.118l-3.356-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.785.57-1.84-.197-1.54-1.118l1.286-3.959a1 1 0 00-.364-1.118L2.075 9.387c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.96z" />
              </svg>
              <span className="text-xl">التقييم</span>
            </h2>
            <Link
              to="/reviews"
              className={`
                px-5 py-2 rounded-full font-medium transition 
                ${isDarkMode 
                  ? 'bg-teal-500 hover:bg-teal-400 text-gray-900' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }
              `}
            >
              العودة لرئيسيّة المراجعات
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="flex-1 overflow-y-auto py-10 px-6">
        <div className="max-w-5xl mx-auto">
          {filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>
                لا توجد مراجعات بهذا التقييم حاليًا.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredReviews.map((rev, idx) => (
                rev.review && (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className={`
                      relative flex flex-col justify-between p-6 rounded-2xl shadow-lg 
                      ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-800'}
                      border-l-4 ${isDarkMode ? 'border-yellow-500' : 'border-yellow-400'}
                      hover:shadow-2xl hover:scale-105 transition-transform duration-300
                    `}
                  >
                    <div className="flex items-center mb-4">
                      <span className="text-3xl font-bold mr-2 text-yellow-400">
                        ★
                      </span>
                      <span className="text-3xl font-semibold">{rev.stars}</span>
                    </div>
                    <p className="mb-6 leading-relaxed flex-1">{rev.review}</p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>المراجع: {rev.reviewer}</span>
                      <span>{rev.location}</span>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center justify-center 
                                    bg-yellow-400 text-gray-900 w-10 h-10 rounded-full">
                      {rev.stars}
                    </div>
                  </motion.div>
                )
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ReviewsByRating;
