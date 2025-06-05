// src/pages/ReviewsByRating.tsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/custom/navbar';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import axios from 'axios';

interface Review {
  id: number;
  review: string;
  stars: number;
  reviewer: string;
  source: string;   // Displayed as a Google Maps link
  location: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

const ReviewsByRating: React.FC = () => {
  // 1. URL‐based filter for stars (rating)
  const { star } = useParams<{ star: string }>();
  const initialStars = parseInt(star || '0', 10);

  // 2. Local state for filters (stars + sentiment + location)
  const [filterStars, setFilterStars] = useState<number>(
    isNaN(initialStars) ? 0 : initialStars
  );
  const [filterSentiment, setFilterSentiment] = useState<string>('All');
  const [filterLocation, setFilterLocation] = useState<string>('All');

  // 3. State to hold filtered reviews
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);

  // 4. State to hold all unique locations (populated on mount)
  const [allLocations, setAllLocations] = useState<string[]>([]);

  const { isDarkMode } = useTheme();

  // 5. On component mount: fetch *all* reviews, extract unique locations
  useEffect(() => {
    axios
      .get<Review[]>('http://localhost:8000/reviews')
      .then((resp) => {
        const reviews = resp.data;
        // Extract, trim, dedupe, and sort locations
        const uniqueLocs = Array.from(
          new Set(reviews.map((r) => r.location.trim()))
        ).sort((a, b) => a.localeCompare(b));
        setAllLocations(uniqueLocs);
      })
      .catch((err) => {
        console.error('Failed to fetch all reviews for locations list:', err);
      });
  }, []);

  // 6. Utility to build the query string, including location
  const buildQuery = () => {
    const params: string[] = [];
    if (filterStars > 0) {
      params.push(`stars=${filterStars}`);
    }
    if (filterSentiment !== 'All') {
      params.push(`sentiment=${filterSentiment}`);
    }
    if (filterLocation !== 'All') {
      params.push(`location=${encodeURIComponent(filterLocation)}`);
    }
    const q = params.join('&');
    return q ? `?${q}` : '';
  };

  // 7. Whenever any filter (stars, sentiment, location) changes, re‐fetch filtered reviews
  useEffect(() => {
    const query = buildQuery();
    axios
      .get<Review[]>(`http://localhost:8000/reviews${query}`)
      .then((resp) => {
        setFilteredReviews(resp.data);
      })
      .catch((err) => {
        console.error('Failed to fetch filtered reviews:', err);
      });
  }, [filterStars, filterSentiment, filterLocation]);

  return (
    <div
      className={`${
        isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      } min-h-screen flex flex-col font-sans`}
    >
      {/* Navbar */}
      <Navbar />

      {/* Header Section */}
      <header
        className={`${
          isDarkMode ? 'bg-[#1a3350] text-white' : 'bg-[#1a3e72] text-white'
        } w-full py-6 shadow`}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6">
          <h2 className="flex items-center space-x-3">
            <span className="text-3xl font-semibold">
              {filterStars > 0 ? filterStars : '-'}
            </span>
            <svg
              className="w-7 h-7 text-blue-300"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.959c.3.921-.755 1.688-1.54 1.118l-3.356-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.785.57-1.84-.197-1.54-1.118l1.286-3.959a1 1 0 00-.364-1.118L2.075 9.387c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.96z" />
            </svg>
            <span className="text-xl font-medium">التصفية حسب التقييم والسمات والموقع</span>
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
            العودة لرئيسية المراجعات
          </Link>
        </div>
      </header>

      {/* Filters: Stars + Sentiment + Location */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-6">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-4 px-6">
          {/* Stars Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              التقييم
            </label>
            <select
              value={filterStars}
              onChange={(e) => setFilterStars(Number(e.target.value))}
              className={`
                px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100
              `}
            >
              <option value={0}>الكل</option>
              {[1, 2, 3, 4, 5].map((s) => (
                <option key={s} value={s}>
                  {s} نجوم
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              الاتجاه (Sentiment)
            </label>
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className={`
                px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100
              `}
            >
              <option value="All">الكل</option>
              <option value="Positive">إيجابي</option>
              <option value="Neutral">محايد</option>
              <option value="Negative">سلبي</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              الموقع
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className={`
                px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100
              `}
            >
              <option value="All">الكل</option>
              {allLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
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
                    <div className="flex items-center mb-3">
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
                    <p className="mb-4 leading-relaxed text-base">
                      {rev.review}
                    </p>

                    {/* Reviewer, Location, and Source (Google Maps) */}
                    <div className="flex flex-col space-y-1 text-sm text-gray-500">
                      <span>المراجع: {rev.reviewer}</span>
                      <span>الموقع: {rev.location}</span>
                      <span>
                        المصدر:{' '}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rev.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          عرض على خرائط جوجل
                        </a>
                      </span>
                    </div>

                    {/* Sentiment Badge */}
                    <div className="absolute top-4 left-4 flex items-center space-x-1">
                      {rev.sentiment === 'Positive' && (
                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full" aria-hidden="true" />
                      )}
                      {rev.sentiment === 'Neutral' && (
                        <span className="inline-block w-3 h-3 bg-gray-400 rounded-full" aria-hidden="true" />
                      )}
                      {rev.sentiment === 'Negative' && (
                        <span className="inline-block w-3 h-3 bg-red-500 rounded-full" aria-hidden="true" />
                      )}
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {rev.sentiment}
                      </span>
                    </div>

                    {/* Overlay Rating Badge */}
                    <div
                      className={`
                        absolute top-4 right-4 flex items-center justify-center
                        ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}
                        w-8 h-8 rounded-full text-sm font-semibold
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
