// src/components/BranchReviews/ReviewCard.tsx
import React from 'react';
import { Review } from '../../pages/reviews/BranchReviews.tsx';

interface ReviewCardProps {
  rev: Review;
  isDarkMode: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ rev, isDarkMode }) => {
  return (
    <div
      className={`
        p-6 rounded-xl shadow-lg
        ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-800'}
      `}
    >
      <div className="flex items-center mb-3">
        <span className="text-2xl font-bold mr-2">
          {rev.stars} <span className="text-yellow-400">★</span>
        </span>
        <span className="text-sm text-gray-400">— {rev.source}</span>
      </div>
      <p className="mb-4 leading-relaxed">{rev.review}</p>
      <div className="flex justify-between text-sm text-gray-400">
        <span>المراجع: {rev.reviewer}</span>
        <span>{rev.location}</span>
      </div>
    </div>
  );
};

export default ReviewCard;
