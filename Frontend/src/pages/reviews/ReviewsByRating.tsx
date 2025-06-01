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
  // URL-based filter for stars (rating)
  const { star } = useParams<{ star: string }>();
  const initialRating = parseInt(star || '0', 10);

  // Local state for all filters
  const [filterStars, setFilterStars] = useState<number>(isNaN(initialRating) ? 0 : initialRating);
  const [filterReviewer, setFilterReviewer] = useState<string>('All');
  const [filterLocation, setFilterLocation] = useState<string>('All');
  const [filterSource, setFilterSource] = useState<string>('All');

  // State to hold filtered reviews
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);

  const { isDarkMode } = useTheme();

  // Extract unique values for dropdown options
  const allReviews = reviewsDataRaw as Review[];
  const uniqueStars = Array.from(new Set(allReviews.map((r) => r.stars))).sort((a, b) => a - b);
  const uniqueReviewers = Array.from(new Set(allReviews.map((r) => r.reviewer))).sort();
  const uniqueLocations = Array.from(new Set(allReviews.map((r) => r.location))).sort();
  const uniqueSources = Array.from(new Set(allReviews.map((r) => r.source))).sort();

  // Whenever any filter changes, recompute filteredReviews
  useEffect(() => {
    let matches = allReviews;

    if (filterStars > 0) {
      matches = matches.filter((r) => r.stars === filterStars);
    }
    if (filterReviewer !== 'All') {
      matches = matches.filter((r) => r.reviewer === filterReviewer);
    }
    if (filterLocation !== 'All') {
      matches = matches.filter((r) => r.location === filterLocation);
    }
    if (filterSource !== 'All') {
      matches = matches.filter((r) => r.source === filterSource);
    }

    setFilteredReviews(matches);
  }, [filterStars, filterReviewer, filterLocation, filterSource, allReviews]);

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} min-h-screen flex flex-col font-sans`}>
      {/* Navbar */}
      <Navbar />

      {/* Header Section */}
      <header className={`${isDarkMode ? 'bg-[#1a3350] text-white' : 'bg-[#1a3e72] text-white'} w-full py-6 shadow`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6">
          <h2 className="flex items-center space-x-3">
            <span className="text-3xl font-semibold">{filterStars > 0 ? filterStars : '-'}</span>
            <svg
              className="w-7 h-7 text-blue-300"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.959c.3.921-.755 1.688-1.54 1.118l-3.356-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.785.57-1.84-.197-1.54-1.118l1.286-3.959a1 1 0 00-.364-1.118L2.075 9.387c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.96z" />
            </svg>
            <span className="text-xl font-medium">التصفية حسب التقييم</span>
          </h2>

          <Link
            to="/reviews"
            className={`
              px-4 py-2 rounded-md font-medium transition
              ${isDarkMode
                ? 'bg-[#2e4a75] hover:bg-[#273e64] text-gray-100'
                : 'bg-[#234b8a] hover:bg-[#1d3d75] text-white'}
            `}
          >
            العودة لرئيسيّة المراجعات
          </Link>
        </div>
      </header>

      {/* Filter Controls */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-6">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-4 px-6">
          {/* Stars Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">التقييم</label>
            <select
              value={filterStars}
              onChange={(e) => setFilterStars(Number(e.target.value))}
              className={`
                px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100
              `}
            >
              <option value={0}>الكل</option>
              {uniqueStars.map((s) => (
                <option key={s} value={s}>{s} نجوم</option>
              ))}
            </select>
          </div>

          {/* Reviewer Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">المراجع</label>
            <select
              value={filterReviewer}
              onChange={(e) => setFilterReviewer(e.target.value)}
              className={`
                px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100
              `}
            >
              <option value="All">الكل</option>
              {uniqueReviewers.map((rev) => (
                <option key={rev} value={rev}>{rev}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">الموقع</label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className={`
                px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100
              `}
            >
              <option value="All">الكل</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">المصدر</label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className={`
                px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100
              `}
            >
              <option value="All">الكل</option>
              {uniqueSources.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <main className="flex-1 overflow-y-auto py-10 px-6">
        <div className="max-w-5xl mx-auto">
          {filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>
                لا توجد مراجعات تطابق المعايير المحددة.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredReviews.map((rev, idx) => (
                rev.review && (
                  <motion.article
                    key={idx}
                    initial={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className={`
                      relative flex flex-col justify-between p-6 rounded-lg shadow-sm
                      ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
                      hover:shadow-md transition-shadow duration-200
                    `}
                  >
                    {/* Star and Rating */}
                    <div className="flex items-center mb-4">
                      <svg
                        className="w-6 h-6 text-blue-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.959c.3.921-.755 1.688-1.54 1.118l-3.356-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.785.57-1.84-.197-1.54-1.118l1.286-3.959a1 1 0 00-.364-1.118L2.075 9.387c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.96z" />
                      </svg>
                      <span className="text-2xl font-semibold">{rev.stars}</span>
                    </div>

                    {/* Review Text */}
                    <p className="mb-6 leading-relaxed text-base">
                      {rev.review}
                    </p>

                    {/* Reviewer & Location */}
                    <footer className="flex flex-col space-y-1 text-sm text-gray-500">
                      <span>المراجع: {rev.reviewer}</span>
                      <span>الموقع: {rev.location}</span>
                      <span>المصدر: {rev.source}</span>
                    </footer>

                    {/* Overlay Rating Badge */}
                    <div
                      className={`
                        absolute top-4 right-4 flex items-center justify-center
                        ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}
                        w-9 h-9 rounded-full text-sm font-semibold
                      `}
                      aria-label={`تقييم ${rev.stars}`}
                    >
                      {rev.stars}
                    </div>
                  </motion.article>
                )
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReviewsByRating;
