// src/pages/ReviewsSummary.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/custom/navbar';
import { useTheme } from '../../context/ThemeContext';
import starsDataRaw from '../../data/stars.json';
import reviewsDataRaw from '../../data/bank_reviews.json';
import hero_image from '../../assets/hero.jpeg';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

// Define the new shape of each entry in stars.json
interface StarEntry {
  location: string;
  star: number;
  image: string;
}

interface Review {
  review: string;
  stars: number;
  reviewer: string;
  source: string;
  location: string;
}

interface ChartDataPoint {
  branch: string;
  rating: number;
}

const ReviewsSummary: React.FC = () => {
  // starsData is now an array of StarEntry objects
  const [starsData, setStarsData] = useState<StarEntry[]>([]);
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Cast the imported JSON to StarEntry[]
    setStarsData(starsDataRaw as StarEntry[]);
    setReviewsData(reviewsDataRaw as Review[]);
  }, []);

  // Summary metrics
  const totalReviews = reviewsData.length;
  const averageRating =
    totalReviews > 0
      ? reviewsData.reduce((sum, r) => sum + r.stars, 0) / totalReviews
      : 0;

  // Unique branch names (stripping any "فرع " prefix)
  const branchNamesSet = new Set<string>();
  reviewsData.forEach((r) => {
    const withoutPrefix = r.location.replace(/^فرع\s+/, '');
    const branchName = withoutPrefix.split(' -')[0].trim();
    if (branchName) branchNamesSet.add(branchName);
  });
  const numberOfBranchesReviewed = branchNamesSet.size;

  // Rating distribution (1–5)
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviewsData.forEach((r) => {
    const s = r.stars;
    if (distribution[s] !== undefined) {
      distribution[s]++;
    }
  });

  // Chart data from starsData array
  const chartData: ChartDataPoint[] = starsData.map((entry) => ({
    branch: entry.location,
    rating: entry.star,
  }));

  return (
    <div
      className={`flex flex-col min-h-screen ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}
    >
      {/* Navbar */}
      <Navbar />

      {/* Hero image with overlay */}
      <section className="relative w-full h-screen">
        <img
          src={hero_image}
          alt="Bank of Palestine Headquarters"
          className="object-cover w-full h-full"
        />

        <div
          className={`
            absolute inset-0 
            flex flex-col items-center justify-center 
            backdrop-brightness-50
          `}
        >
          <h1
            className={`
              text-4xl sm:text-5xl font-bold mb-4 
              ${isDarkMode ? 'text-white' : 'text-gray-100'}
            `}
          >
            Bank of Palestine Reviews
          </h1>
          <p
            className={`
              text-lg sm:text-xl 
              ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}
            `}
          >
            Discover Our Branch Ratings
          </p>
        </div>
      </section>

      {/* Full‐height, full‐width Summary Section */}
      <section
        className={`
          w-full h-screen flex flex-col items-center justify-center 
          ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}
        `}
      >
        <h2 className="text-3xl font-semibold mb-8">Reviews Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-3/4">
          {/* Average Rating */}
          <div className="flex flex-col items-center">
            <span className="text-xl font-medium">Average Rating</span>
            <span className="mt-2 text-4xl font-bold">
              {averageRating.toFixed(1)} / 5{' '}
              <span className="text-yellow-400">★</span>
            </span>
          </div>

          {/* Total Reviews */}
          <div className="flex flex-col items-center">
            <span className="text-xl font-medium">Total Reviews</span>
            <span className="mt-2 text-4xl font-bold">{totalReviews}</span>
          </div>

          {/* Number of Branches Reviewed */}
          <div className="flex flex-col items-center">
            <span className="text-xl font-medium">Branches Reviewed</span>
            <span className="mt-2 text-4xl font-bold">
              {numberOfBranchesReviewed}
            </span>
          </div>

          {/* Placeholder */}
          <div className="hidden sm:block"></div>
        </div>

        {/* Rating Distribution */}
        <div className="mt-12 w-3/4">
          <span className="text-xl font-medium">Rating Distribution</span>
          <ul className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <li key={star} className="flex items-center">
                <span className="w-16">
                  {star}
                  <span className="text-yellow-400">★</span>
                </span>
                <div
                  className={`
                    flex-1 h-5 rounded-full overflow-hidden 
                    ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
                  `}
                >
                  <div
                    className={`
                      h-full rounded-full 
                      ${isDarkMode ? 'bg-yellow-500' : 'bg-yellow-400'}
                    `}
                    style={{
                      width: `${
                        totalReviews > 0
                          ? (distribution[star] / totalReviews) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="ml-3 w-8 text-right">{distribution[star]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bar Chart Section: Avg rating per branch (Full viewport) */}
      <section className={`w-full h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center py-6 px-8">
            <h2
              className={`text-2xl font-semibold ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}
            >
              Average Rating by Branch
            </h2>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="branch"
                  tickLine={false}
                  tick={{ fill: isDarkMode ? '#E2E8F0' : '#4A5568', fontSize: 12 }}
                  axisLine={{ stroke: isDarkMode ? '#4A5568' : '#CBD5E0' }}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  domain={[0, 5]}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? '#E2E8F0' : '#4A5568' }}
                  axisLine={{ stroke: isDarkMode ? '#4A5568' : '#CBD5E0' }}
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF',
                    borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
                    color: isDarkMode ? '#E2E8F0' : '#1A202C',
                  }}
                  itemStyle={{ color: isDarkMode ? '#E2E8F0' : '#1A202C' }}
                />
                <Bar
                  dataKey="rating"
                  fill={isDarkMode ? '#F6E05E' : '#4299E1'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Branch Ratings Grid */}
      <section className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex-grow py-12 px-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} text-2xl font-semibold`}>
            Branch Ratings
          </h2>
        </div>

     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {starsData.map((entry) => (
            <Link
            key={entry.location}
            to={`/reviews/${encodeURIComponent(entry.location)}`}
            className={`
                group relative rounded-lg p-4 transition-shadow block
                ${isDarkMode
                ? 'bg-gray-700 shadow-md hover:shadow-lg'
                : 'bg-white shadow-md hover:shadow-lg'
                }
            `}
            >
            {entry.image ? (
                <img
                src={entry.image}
                alt={`${entry.location} thumbnail`}
                className="w-full h-32 object-cover mb-2 rounded"
                />
            ) : (
                <div
                className={`
                    w-full h-32 mb-2 rounded flex items-center justify-center text-center
                    ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'}
                `}
                >
                <span className="text-lg font-bold px-2">{entry.location}</span>
                </div>
            )}

            <p className={`${isDarkMode ? 'text-gray-100' : 'text-gray-700'} text-lg font-medium`}>
                {entry.location}
            </p>
            <span className="mt-1 text-yellow-400">
                ★ {entry.star.toFixed(1)}
            </span>
            <span
                className="
                absolute 
                bottom-full 
                left-1/2 
                transform -translate-x-1/2 
                mb-2 
                bg-black bg-opacity-75 
                text-white 
                text-sm 
                px-2 
                py-1 
                rounded 
                opacity-0 
                group-hover:opacity-100 
                transition-opacity 
                whitespace-nowrap
                "
            >
                ★ {entry.star.toFixed(1)}
            </span>
            </Link>
        ))}
        </div>

      </section>
    </div>
  );
};

export default ReviewsSummary;
