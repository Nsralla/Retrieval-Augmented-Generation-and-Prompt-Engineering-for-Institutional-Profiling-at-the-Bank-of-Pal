// src/components/BranchReviews/ReviewsSection.tsx
import React from 'react';
import ReviewCard from './ReviewCard';
import NoDataMessage from './NoDataMessage';
import { Review } from '../../pages/reviews/BranchReviews';

interface ReviewsSectionProps {
  filteredReviews: Review[];
  decodedBranch: string;
  isDarkMode: boolean;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  filteredReviews,
  decodedBranch,
  isDarkMode,
}) => {
  return (
    <section
      className={`
        w-full h-screen flex flex-col
        ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
      `}
    >
      <div
        className={`
          flex justify-between items-center
          px-8 py-6 border-b
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}
      >
        <h2 className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} text-3xl font-semibold`}>
          مراجعات فرع “{decodedBranch}”
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {filteredReviews.length === 0 ? (
          <NoDataMessage
            message="لا توجد تقييمات لهذا الفرع حاليًا."
            linkTo="/reviews"
            linkText="العودة إلى قائمة الفروع"
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredReviews.map((rev, idx) =>
              rev.review ? (
                <ReviewCard key={idx} rev={rev} isDarkMode={isDarkMode} />
              ) : null
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
