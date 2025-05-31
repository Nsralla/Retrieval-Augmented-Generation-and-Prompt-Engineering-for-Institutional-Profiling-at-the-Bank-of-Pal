// src/pages/reviews/BranchReviews.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/custom/navbar';
import { useTheme } from '../../context/ThemeContext';
import reviewsDataRaw from '../../data/bank_reviews.json';
import votingDataRaw from '../../data/voting.json';
import ReviewsSection from '@/components/BranchReviews/ReviewsSection';
import VotingSection from '@/components/BranchReviews/VotingSection';

// --------------------------------------------------
// Add `export` in front of each interface you need elsewhere
// --------------------------------------------------
export interface Review {
  review: string;
  stars: number;
  reviewer: string;
  source: string;
  location: string;
}

export interface VoteEntry {
  '5': number;
  '4': number;
  '3': number;
  '2': number;
  '1': number;
  location: string;
}

export interface DistributionPoint {
  star: string;
  count: number;
}
// --------------------------------------------------

const BranchReviews: React.FC = () => {
  const { branchName } = useParams<{ branchName: string }>();
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [voteDistribution, setVoteDistribution] = useState<DistributionPoint[]>([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
  window.scrollTo(0, 0); // <-- Force scroll to top
}, []);


  useEffect(() => {
    if (!branchName) return;
    const decodedName = decodeURIComponent(branchName);

    // Filter reviews
    const reviewsMatch = (reviewsDataRaw as Review[]).filter((r) => {
      const withoutPrefix = r.location.replace(/^فرع\s+/, '');
      const namePart = withoutPrefix.split(' -')[0].trim();
      return namePart === decodedName;
    });
    setFilteredReviews(reviewsMatch);

    // Voting distribution
    const voteEntry = (votingDataRaw as VoteEntry[]).find((v) => {
      const voteName = v.location.trim();
      return voteName === decodedName;
    });
    if (voteEntry) {
      const dist: DistributionPoint[] = [
        { star: '5', count: voteEntry['5'] },
        { star: '4', count: voteEntry['4'] },
        { star: '3', count: voteEntry['3'] },
        { star: '2', count: voteEntry['2'] },
        { star: '1', count: voteEntry['1'] },
      ];
      setVoteDistribution(dist);
    } else {
      setVoteDistribution([]);
    }
  }, [branchName]);

  const decodedBranch = branchName ? decodeURIComponent(branchName) : '';

  return (
  <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Navbar />

      {/* Reviews Section */}
      <ReviewsSection
        filteredReviews={filteredReviews}
        decodedBranch={decodedBranch}
        isDarkMode={isDarkMode}
      />

      {/* Voting Distribution Section */}
      <VotingSection
        voteDistribution={voteDistribution}
        decodedBranch={decodedBranch}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default BranchReviews;
