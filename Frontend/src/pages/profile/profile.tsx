import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaBuilding, FaUsers, FaMapMarkedAlt, FaStar, FaCheckCircle, FaExclamationTriangle, FaClipboardList, FaInfoCircle } from 'react-icons/fa';
import Navbar from '../../components/custom/navbar.tsx';
import ReactMarkdown from 'react-markdown';
import { BeatLoader } from 'react-spinners';
import { BASE_URL } from '@/api';

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'parsed' | 'raw'>('parsed');

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/institution-profile`);
                // Store the raw profile text in state
                setProfile(response.data.profile);
                setError(null);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load institution profile. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Process profile content with useMemo to prevent recalculation on rerenders
    const sections = useMemo(() => {
        if (!profile) return {};

        // More robust section extraction
        const sectionRegex = /(?:##\s*(.*?):|(?:\*\*|\b)(General Description|Public Perception|List of branches|Branches|Branch Ratings|Strengths|Weaknesses|Services|Recent Updates)(?:\*\*|\b):?)([\s\S]*?)(?=(?:##\s*.*?:|(?:\*\*|\b)(?:General Description|Public Perception|List of branches|Branches|Branch Ratings|Strengths|Weaknesses|Services|Recent Updates)(?:\*\*|\b):?)|\s*$)/gi;
        
        const arabicSectionRegex = /(?:##\s*(.*?):|(?:\*\*|\b)(نظرة عامة|تصور عام|فروع|تقييمات الفروع|نقاط القوة|نقاط الضعف|الخدمات|تحديثات)(?:\*\*|\b):?)([\s\S]*?)(?=(?:##\s*.*?:|(?:\*\*|\b)(?:نظرة عامة|تصور عام|فروع|تقييمات الفروع|نقاط القوة|نقاط الضعف|الخدمات|تحديثات)(?:\*\*|\b):?)|\s*$)/gi;

        const allSections: Record<string, string> = {};
        let match;
        
        // Process English sections
        while ((match = sectionRegex.exec(profile)) !== null) {
            const sectionTitle = match[1] || match[2];
            const sectionContent = match[3].trim();
            
            if (sectionTitle && sectionContent) {
                const normalizedTitle = sectionTitle.toLowerCase();
                
                // Map section names to our expected keys
                let key = '';
                if (normalizedTitle.includes('description')) key = 'description';
                else if (normalizedTitle.includes('perception')) key = 'perception';
                else if (normalizedTitle.includes('branch') && !normalizedTitle.includes('rating')) key = 'branches';
                else if (normalizedTitle.includes('rating')) key = 'ratings';
                else if (normalizedTitle.includes('strength')) key = 'strengths';
                else if (normalizedTitle.includes('weakness')) key = 'weaknesses';
                else if (normalizedTitle.includes('service')) key = 'services';
                else if (normalizedTitle.includes('update')) key = 'updates';
                else key = normalizedTitle.replace(/\s+/g, '_');
                
                allSections[key] = sectionContent;
            }
        }
        
        // Process Arabic sections
        while ((match = arabicSectionRegex.exec(profile)) !== null) {
            const sectionTitle = match[1] || match[2];
            const sectionContent = match[3].trim();
            
            if (sectionTitle && sectionContent) {
                // Map Arabic section names to our expected keys
                let key = '';
                if (sectionTitle === 'نظرة عامة') key = 'description';
                else if (sectionTitle === 'تصور عام') key = 'perception';
                else if (sectionTitle === 'فروع') key = 'branches';
                else if (sectionTitle === 'تقييمات الفروع') key = 'ratings';
                else if (sectionTitle === 'نقاط القوة') key = 'strengths';
                else if (sectionTitle === 'نقاط الضعف') key = 'weaknesses';
                else if (sectionTitle === 'الخدمات') key = 'services';
                else if (sectionTitle === 'تحديثات') key = 'updates';
                else key = sectionTitle;
                
                allSections[key] = sectionContent;
            }
        }
        
        // Fallback: If no sections were found, create a default structure
        if (Object.keys(allSections).length === 0 && profile.length > 0) {
            // Simple heuristic: Try to split by double newlines
            const paragraphs = profile.split(/\n\n+/);
            
            if (paragraphs.length > 1) {
                allSections['description'] = paragraphs[0];
                
                // Look for specific keywords in other paragraphs
                for (let i = 1; i < paragraphs.length; i++) {
                    const p = paragraphs[i].toLowerCase();
                    if (p.includes('perception') || p.includes('public') || p.includes('reviews')) {
                        allSections['perception'] = paragraphs[i];
                    } else if (p.includes('branch') && !p.includes('rating')) {
                        allSections['branches'] = paragraphs[i];
                    } else if (p.includes('rating') || p.includes('stars')) {
                        allSections['ratings'] = paragraphs[i];
                    } else if (p.includes('strength') || p.includes('advantage')) {
                        allSections['strengths'] = paragraphs[i];
                    } else if (p.includes('weakness') || p.includes('disadvantage')) {
                        allSections['weaknesses'] = paragraphs[i];
                    } else if (p.includes('service') || p.includes('offer')) {
                        allSections['services'] = paragraphs[i];
                    } else if (p.includes('update') || p.includes('recent') || p.includes('news')) {
                        allSections['updates'] = paragraphs[i];
                    }
                }
            } else if (profile.length > 0) {
                // If we can't split by paragraphs, use the whole text as description
                allSections['description'] = profile;
            }
        }

        return allSections;
    }, [profile]);

    // Debug: log the sections to see what was extracted
    useEffect(() => {
        console.log("Extracted sections:", sections);
    }, [sections]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-5xl mx-auto"
                >
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                            Bank of Palestine
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                            Comprehensive Institution Profile
                        </p>
                        
                        {/* Toggle button for view mode */}
                        {!loading && !error && (
                            <button
                                onClick={() => setViewMode(viewMode === 'parsed' ? 'raw' : 'parsed')}
                                className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                            >
                                {viewMode === 'parsed' ? 'View Raw Profile' : 'View Formatted Profile'}
                            </button>
                        )}
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <BeatLoader color="#3B82F6" />
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading institution profile...</p>
                        </div>
                    ) : error ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center"
                        >
                            <FaExclamationTriangle className="mx-auto mb-4 text-red-500 text-4xl" />
                            <h3 className="text-lg font-medium text-red-800 dark:text-red-300">{error}</h3>
                            <button 
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </button>
                        </motion.div>
                    ) : viewMode === 'raw' ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden"
                        >
                            <div className="p-6 md:p-8">
                                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                    {profile}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden"
                        >
                            {/* Profile content sections */}
                            <div className="p-6 md:p-8">
                                {Object.keys(sections).length > 0 ? (
                                    <>
                                        {/* General Description */}
                                        {sections.description && (
                                            <ProfileSection
                                                key="description"
                                                icon={<FaBuilding />}
                                                title="General Description"
                                                content={sections.description}
                                            />
                                        )}

                                        {/* Public Perception */}
                                        {sections.perception && (
                                            <ProfileSection
                                                key="perception"
                                                icon={<FaUsers />}
                                                title="Public Perception"
                                                content={sections.perception}
                                            />
                                        )}

                                        {/* Branches */}
                                        {sections.branches && (
                                            <ProfileSection
                                                key="branches"
                                                icon={<FaMapMarkedAlt />}
                                                title="Branches"
                                                content={sections.branches}
                                            />
                                        )}

                                        {/* Branch Ratings */}
                                        {sections.ratings && (
                                            <ProfileSection
                                                key="ratings"
                                                icon={<FaStar />}
                                                title="Branch Ratings"
                                                content={sections.ratings}
                                            />
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                            {/* Strengths */}
                                            {sections.strengths && (
                                                <ProfileSection
                                                    key="strengths"
                                                    icon={<FaCheckCircle />}
                                                    title="Strengths"
                                                    content={sections.strengths}
                                                />
                                            )}

                                            {/* Weaknesses */}
                                            {sections.weaknesses && (
                                                <ProfileSection
                                                    key="weaknesses"
                                                    icon={<FaExclamationTriangle />}
                                                    title="Weaknesses"
                                                    content={sections.weaknesses}
                                                />
                                            )}
                                        </div>

                                        {/* Services */}
                                        {sections.services && (
                                            <ProfileSection
                                                key="services"
                                                icon={<FaClipboardList />}
                                                title="Services"
                                                content={sections.services}
                                            />
                                        )}

                                        {/* Updates */}
                                        {sections.updates && (
                                            <ProfileSection
                                                key="updates"
                                                icon={<FaClipboardList />}
                                                title="Recent Updates"
                                                content={sections.updates}
                                            />
                                        )}

                                        {/* Other sections that didn't match our predefined categories */}
                                        {Object.entries(sections).map(([key, content]) => {
                                            if (!['description', 'perception', 'branches', 'ratings', 'strengths', 'weaknesses', 'services', 'updates'].includes(key)) {
                                                return (
                                                    <ProfileSection
                                                        key={key}
                                                        icon={<FaInfoCircle />}
                                                        title={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                                        content={content}
                                                    />
                                                );
                                            }
                                            return null;
                                        })}
                                    </>
                                ) : (
                                    <div className="prose dark:prose-invert max-w-none">
                                        <ReactMarkdown>{profile}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

// Memoize the ProfileSection component to prevent unnecessary re-renders
const ProfileSection: React.FC<ProfileSectionProps> = React.memo(({ icon, title, content }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center mb-4">
                <div className="text-blue-600 dark:text-blue-400 text-2xl mr-3">
                    {icon}
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    {title}
                </h2>
            </div>
            <div className="prose dark:prose-invert max-w-none pl-2 border-l-4 border-blue-100 dark:border-blue-900">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        </div>
    );
});

interface ProfileSectionProps {
    icon: React.ReactNode;
    title: string;
    content: string;
}

export default Profile;