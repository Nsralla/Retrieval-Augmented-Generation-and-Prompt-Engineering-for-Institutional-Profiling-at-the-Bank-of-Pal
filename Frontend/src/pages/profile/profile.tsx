import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
    FaBuilding, FaUsers, FaMapMarkedAlt, FaStar, FaCheckCircle, 
    FaExclamationTriangle, FaClipboardList, FaInfoCircle, 
    FaMoneyBillWave, FaPercent, FaMobileAlt, FaCreditCard,
    FaPhone, FaUniversity, FaHandshake, FaHistory, FaTrophy,
    FaChevronDown, FaChevronUp, FaSearch
} from 'react-icons/fa';
import Navbar from '../../components/custom/navbar.tsx';
import ReactMarkdown from 'react-markdown';
import { BeatLoader } from 'react-spinners';
import { BASE_URL } from '@/api';

interface BankProfileData {
    founders: string[];
    key_personnel: string[];
    branch_locations: string[];
    accounts: string[];
    loans: string[];
    cards: string[];
    digital_services: string[];
    transfer_services: string[];
    investment_services: string[];
    fees: string[];
    interest_rates: string[];
    csr_programs: string[];
    awards: string[];
    partners: string[];
    contact_info: string[];
}

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<string>('');
    const [bankData, setBankData] = useState<BankProfileData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'parsed' | 'raw' | 'enhanced'>('enhanced');
    
    // UI state for expandable sections
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        branches: false,
        digitalServices: false,
        loans: false,
        cards: false,
        fees: false,
        interestRates: false
    });
    
    // Filter states for searchable lists
    const [branchFilter, setBranchFilter] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');
    const [loanFilter, setLoanFilter] = useState('');
    
    // Toggle section expansion
    const toggleSection = (section: string) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section]
        });
    };

    // Fetch both profile data and structured bank data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch profile text from API
                const profileResponse = await axios.get(`${BASE_URL}/institution-profile`);
                setProfile(profileResponse.data.profile);
                
                // Fetch structured bank data
                const bankDataResponse = await axios.get(`${BASE_URL}/data/bank_profile_data.json`);
                setBankData(bankDataResponse.data);
                
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load institution profile data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

    // Filter branches based on search
    const filteredBranches = useMemo(() => {
        if (!bankData?.branch_locations) return [];
        if (!branchFilter) return bankData.branch_locations;
        
        return bankData.branch_locations.filter(branch => 
            branch.toLowerCase().includes(branchFilter.toLowerCase())
        );
    }, [bankData?.branch_locations, branchFilter]);

    // Filter digital services based on search
    const filteredServices = useMemo(() => {
        if (!bankData?.digital_services) return [];
        if (!serviceFilter) return bankData.digital_services;
        
        return bankData.digital_services.filter(service => 
            service.toLowerCase().includes(serviceFilter.toLowerCase())
        );
    }, [bankData?.digital_services, serviceFilter]);

    // Filter loans based on search
    const filteredLoans = useMemo(() => {
        if (!bankData?.loans) return [];
        if (!loanFilter) return bankData.loans;
        
        return bankData.loans.filter(loan => 
            loan.toLowerCase().includes(loanFilter.toLowerCase())
        );
    }, [bankData?.loans, loanFilter]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-6xl mx-auto"
                >
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                            Bank of Palestine
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                            Comprehensive Institution Profile
                        </p>
                        
                        {/* Toggle buttons for view mode */}
                        {!loading && !error && (
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => setViewMode('enhanced')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === 'enhanced'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                                    }`}
                                >
                                    Enhanced View
                                </button>
                                <button
                                    onClick={() => setViewMode('parsed')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === 'parsed'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                                    }`}
                                >
                                    Parsed View
                                </button>
                                <button
                                    onClick={() => setViewMode('raw')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === 'raw'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                                    }`}
                                >
                                    Raw Text
                                </button>
                            </div>
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
                    ) : viewMode === 'parsed' ? (
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
                    ) : (
                        // Enhanced view combining API profile with structured data
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden"
                        >
                            <div className="p-6 md:p-8">
                                {/* General Description */}
                                {sections.description && (
                                    <ProfileSection
                                        key="description"
                                        icon={<FaBuilding />}
                                        title="General Description"
                                        content={sections.description}
                                    />
                                )}

                                {/* Bank Founders and Key Personnel */}
                                <div className="mt-10">
                                    <h2 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                                        <FaHistory className="text-blue-600 dark:text-blue-400 text-2xl mr-3" />
                                        Bank History & Leadership
                                    </h2>
                                    
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                                        <h3 className="font-medium text-gray-800 dark:text-white mb-2">Bank Founders</h3>
                                        <div className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                            {bankData?.founders && bankData.founders[0] ? (
                                                <p>{bankData.founders[0]}</p>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 italic">
                                                    Founder information not available
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {bankData?.key_personnel && bankData.key_personnel.length > 0 && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Key Personnel</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                {bankData.key_personnel.map((person, index) => (
                                                    <div 
                                                        key={index}
                                                        className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border-l-4 border-blue-500"
                                                    >
                                                        {person}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                                    {/* Branch Network Section */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white">
                                                <FaMapMarkedAlt className="text-blue-600 dark:text-blue-400 text-2xl mr-3" />
                                                Branch Network
                                            </h2>
                                            <button 
                                                onClick={() => toggleSection('branches')}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                aria-label="Toggle branch list"
                                            >
                                                {expandedSections.branches ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>
                                        </div>
                                        
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                            {bankData?.branch_locations && bankData.branch_locations.length > 0 ? (
                                                <>
                                                    <div className="mb-3">
                                                        <div className="relative">
                                                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search branches..."
                                                                value={branchFilter}
                                                                onChange={(e) => setBranchFilter(e.target.value)}
                                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {(expandedSections.branches ? filteredBranches : filteredBranches.slice(0, 8)).map((branch, index) => (
                                                            <div 
                                                                key={index}
                                                                className="flex items-center p-2 border-b border-gray-200 dark:border-gray-700"
                                                                dir={branch.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr'}
                                                            >
                                                                <FaUniversity className="text-blue-500 dark:text-blue-400 mr-2" />
                                                                <span className="text-gray-700 dark:text-gray-300">{branch}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {!expandedSections.branches && filteredBranches.length > 8 && (
                                                        <button 
                                                            onClick={() => toggleSection('branches')}
                                                            className="w-full mt-3 text-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                                        >
                                                            Show all {filteredBranches.length} branches
                                                        </button>
                                                    )}
                                                    {expandedSections.branches && filteredBranches.length > 8 && (
                                                        <button 
                                                            onClick={() => toggleSection('branches')}
                                                            className="w-full mt-3 text-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                                        >
                                                            Show less
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                sections.branches ? (
                                                    <ReactMarkdown>{sections.branches}</ReactMarkdown>
                                                ) : (
                                                    <p className="text-gray-500 dark:text-gray-400 italic">
                                                        Branch information not available
                                                    </p>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Public Perception & Ratings */}
                                    <div>
                                        <h2 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                                            <FaUsers className="text-blue-600 dark:text-blue-400 text-2xl mr-3" />
                                            Public Perception
                                        </h2>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                            {sections.perception ? (
                                                <ReactMarkdown>{sections.perception}</ReactMarkdown>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 italic">
                                                    Public perception information not available
                                                </p>
                                            )}

                                            {sections.ratings && (
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                                                        <FaStar className="text-yellow-500 mr-2" />
                                                        Branch Ratings
                                                    </h3>
                                                    <ReactMarkdown>{sections.ratings}</ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Digital Services */}
                                <div className="mt-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white">
                                            <FaMobileAlt className="text-blue-600 dark:text-blue-400 text-2xl mr-3" />
                                            Digital Banking Services
                                        </h2>
                                        <button 
                                            onClick={() => toggleSection('digitalServices')}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            aria-label="Toggle digital services list"
                                        >
                                            {expandedSections.digitalServices ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </div>
                                    
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                        {bankData?.digital_services && bankData.digital_services.length > 0 ? (
                                            <>
                                                <div className="mb-3">
                                                    <div className="relative">
                                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search digital services..."
                                                            value={serviceFilter}
                                                            onChange={(e) => setServiceFilter(e.target.value)}
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {(expandedSections.digitalServices ? filteredServices : filteredServices.slice(0, 6)).map((service, index) => (
                                                        <div 
                                                            key={index}
                                                            className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm"
                                                            dir={service.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr'}
                                                        >
                                                            {service}
                                                        </div>
                                                    ))}
                                                </div>
                                                {!expandedSections.digitalServices && filteredServices.length > 6 && (
                                                    <button 
                                                        onClick={() => toggleSection('digitalServices')}
                                                        className="w-full mt-3 text-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                                    >
                                                        Show all {filteredServices.length} digital services
                                                    </button>
                                                )}
                                                {expandedSections.digitalServices && filteredServices.length > 6 && (
                                                    <button 
                                                        onClick={() => toggleSection('digitalServices')}
                                                        className="w-full mt-3 text-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                                    >
                                                        Show less
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            sections.services ? (
                                                <ReactMarkdown>{sections.services}</ReactMarkdown>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 italic">
                                                    Digital services information not available
                                                </p>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Fees and Rates */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                                    {/* Fees */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white">
                                                <FaMoneyBillWave className="text-blue-600 dark:text-blue-400 text-2xl mr-3" />
                                                Fees & Charges
                                            </h2>
                                            <button 
                                                onClick={() => toggleSection('fees')}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                aria-label="Toggle fees list"
                                            >
                                                {expandedSections.fees ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>
                                        </div>
                                        
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-h-80 overflow-y-auto">
                                            {bankData?.fees && bankData.fees.length > 0 ? (
                                                <ul className="list-disc list-inside space-y-2">
                                                    {(expandedSections.fees ? bankData.fees : bankData.fees.slice(0, 5)).map((fee, index) => (
                                                        <li 
                                                            key={index} 
                                                            className="text-gray-700 dark:text-gray-300"
                                                            dir={fee.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr'}
                                                        >
                                                            {fee}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 italic">
                                                    Fee information not available
                                                </p>
                                            )}
                                            
                                            {!expandedSections.fees && bankData?.fees && bankData.fees.length > 5 && (
                                                <button 
                                                    onClick={() => toggleSection('fees')}
                                                    className="w-full mt-3 text-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                                >
                                                    Show all {bankData.fees.length} fee items
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Interest Rates */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white">
                                                <FaPercent className="text-blue-600 dark:text-blue-400 text-2xl mr-3" />
                                                Interest Rates
                                            </h2>
                                            <button 
                                                onClick={() => toggleSection('interestRates')}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                aria-label="Toggle interest rates list"
                                            >
                                                {expandedSections.interestRates ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>
                                        </div>
                                        
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-h-80 overflow-y-auto">
                                            {bankData?.interest_rates && bankData.interest_rates.length > 0 ? (
                                                <ul className="list-disc list-inside space-y-2">
                                                    {(expandedSections.interestRates ? bankData.interest_rates : bankData.interest_rates.slice(0, 5)).map((rate, index) => (
                                                        <li 
                                                            key={index} 
                                                            className="text-gray-700 dark:text-gray-300"
                                                            dir={rate.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr'}
                                                        >
                                                            {rate}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 italic">
                                                    Interest rate information not available
                                                </p>
                                            )}
                                            
                                            {!expandedSections.interestRates && bankData?.interest_rates && bankData.interest_rates.length > 5 && (
                                                <button 
                                                    onClick={() => toggleSection('interestRates')}
                                                    className="w-full mt-3 text-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                                >
                                                    Show all {bankData.interest_rates.length} interest rate items
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Awards & CSR Programs */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                                    {/* Awards */}
                                    <div>
                                        <h2 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                                            <FaTrophy className="text-amber-500 dark:text-amber-400 text-2xl mr-3" />
                                            Awards & Recognition
                                        </h2>
                                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                                            {bankData?.awards && bankData.awards.length > 0 ? (
                                                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {bankData.awards[0]}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 italic">
                                                    Awards information not available
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* CSR Programs */}
                                    <div>
                                        <h2 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                                            <FaHandshake className="text-green-600 dark:text-green-400 text-2xl mr-3" />
                                            CSR Programs
                                        </h2>
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                            {bankData?.csr_programs && bankData.csr_programs.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-2">
                                                    {bankData.csr_programs.map((program, index) => (
                                                        <div 
                                                            key={index}
                                                            className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm"
                                                        >
                                                            {program}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 italic">
                                                    CSR program information not available
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Strengths & Weaknesses */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                                    {/* Strengths */}
                                    <div>
                                        <h2 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                                            <FaCheckCircle className="text-green-600 dark:text-green-400 text-2xl mr-3" />
                                            Strengths
                                        </h2>
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                            {sections.strengths ? (
                                                <ReactMarkdown>{sections.strengths}</ReactMarkdown>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 italic">
                                                    Strengths information not available
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Weaknesses */}
                                    <div>
                                        <h2 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                                            <FaExclamationTriangle className="text-amber-600 dark:text-amber-400 text-2xl mr-3" />
                                            Areas for Improvement
                                        </h2>
                                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                                            {sections.weaknesses ? (
                                                <ReactMarkdown>{sections.weaknesses}</ReactMarkdown>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 italic">
                                                    Areas for improvement information not available
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Banking Products - Cards & Loans */}
                                <div className="mt-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white">
                                            <FaCreditCard className="text-blue-600 dark:text-blue-400 text-2xl mr-3" />
                                            Banking Products
                                        </h2>
                                    </div>
                                    
                                    {/* Card Products */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                                        <h3 className="font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                                            <FaCreditCard className="text-blue-500 mr-2" /> Card Products
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {bankData?.cards && bankData.cards.map((card, index) => (
                                                <div 
                                                    key={index}
                                                    className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border-l-4 border-blue-500"
                                                >
                                                    {card}
                                                </div>
                                            ))}
                                            {(!bankData?.cards || bankData.cards.length === 0) && (
                                                <p className="text-gray-500 dark:text-gray-400 italic">
                                                    Card information not available
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Loan Products with filter */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-medium text-gray-800 dark:text-white flex items-center">
                                                <FaMoneyBillWave className="text-green-500 mr-2" /> Loan Products
                                            </h3>
                                            <button 
                                                onClick={() => toggleSection('loans')}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                aria-label="Toggle loans list"
                                            >
                                                {expandedSections.loans ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>
                                        </div>
                                        
                                        {bankData?.loans && bankData.loans.length > 0 ? (
                                            <>
                                                {expandedSections.loans && (
                                                    <div className="mb-3">
                                                        <div className="relative">
                                                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search loan products..."
                                                                value={loanFilter}
                                                                onChange={(e) => setLoanFilter(e.target.value)}
                                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {(expandedSections.loans ? filteredLoans : filteredLoans.slice(0, 6)).map((loan, index) => (
                                                        <div 
                                                            key={index}
                                                            className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border-l-4 border-green-500"
                                                        >
                                                            {loan}
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                {!expandedSections.loans && filteredLoans.length > 6 && (
                                                    <button 
                                                        onClick={() => toggleSection('loans')}
                                                        className="w-full mt-3 text-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                                    >
                                                        Show all {filteredLoans.length} loan products
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400 italic">
                                                Loan product information not available
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="mt-8">
                                    <h2 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                                        <FaPhone className="text-blue-600 dark:text-blue-400 text-2xl mr-3" />
                                        Contact Information
                                    </h2>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                        {bankData?.contact_info && bankData.contact_info.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {bankData.contact_info.map((contact, index) => (
                                                    <div 
                                                        key={index}
                                                        className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm"
                                                    >
                                                        <span>{contact}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center p-3">
                                                <span>Customer Service: 1700150150</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Updates */}
                                {sections.updates && (
                                    <div className="mt-8">
                                        <h2 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                                            <FaInfoCircle className="text-blue-600 dark:text-blue-400 text-2xl mr-3" />
                                            Recent Updates
                                        </h2>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                            <ReactMarkdown>{sections.updates}</ReactMarkdown>
                                        </div>
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