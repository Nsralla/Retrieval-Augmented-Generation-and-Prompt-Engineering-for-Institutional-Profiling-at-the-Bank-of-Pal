// src/components/BranchReviews/VotingSection.tsx
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import NoDataMessage from './NoDataMessage';
import { DistributionPoint } from '../../pages/reviews/BranchReviews';

interface VotingSectionProps {
  voteDistribution: DistributionPoint[];
  decodedBranch: string;
  isDarkMode: boolean;
}

const VotingSection: React.FC<VotingSectionProps> = ({
  voteDistribution,
  decodedBranch,
  isDarkMode,
}) => {
  return (
    <section
      className={`
        w-full h-screen flex flex-col
        ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}
      `}
    >
      <div className="px-8 py-6">
        <h3 className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} text-3xl font-semibold mb-6 text-center`}>
          توزيع التصويت لفرع “{decodedBranch}”
        </h3>
      </div>

      <div className="flex-1 px-8 pb-8">
        {voteDistribution.length === 0 ? (
          <NoDataMessage
            message="لا توجد بيانات تصويت لهذا الفرع."
            linkTo="/reviews"
            linkText="العودة إلى قائمة الفروع"
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={voteDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? '#4A5568' : '#E2E8F0'}
                />
                <XAxis
                  dataKey="star"
                  tickLine={false}
                  tick={{ fill: isDarkMode ? '#E2E8F0' : '#4A5568', fontSize: 14 }}
                  axisLine={{ stroke: isDarkMode ? '#4A5568' : '#CBD5E0' }}
                  label={{
                    value: 'النجوم',
                    position: 'bottom',
                    offset: 0,
                    fill: isDarkMode ? '#E2E8F0' : '#4A5568',
                    fontSize: 14,
                  }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? '#E2E8F0' : '#4A5568', fontSize: 14 }}
                  axisLine={{ stroke: isDarkMode ? '#4A5568' : '#CBD5E0' }}
                  label={{
                    value: 'عدد الأصوات',
                    angle: -90,
                    position: 'insideLeft',
                    fill: isDarkMode ? '#E2E8F0' : '#4A5568',
                    fontSize: 14,
                  }}
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
                  dataKey="count"
                  fill={isDarkMode ? '#F6E05E' : '#4299E1'}
                  radius={[8, 8, 0, 0]}
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
};

export default VotingSection;
