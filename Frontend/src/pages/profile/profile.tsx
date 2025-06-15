import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  FaChevronDown, FaChevronUp, FaSearch
} from 'react-icons/fa';
import Navbar from '../../components/custom/navbar.tsx';
import { BeatLoader } from 'react-spinners';
import { BASE_URL } from '@/api';

interface SectionData {
  title: string;
  items: string[];
}

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

const toTitle = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<string>('');
  const [bankData, setBankData] = useState<BankProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Fetch profile and structured data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [profRes, dataRes] = await Promise.all([
          axios.get(`${BASE_URL}/institution-profile`),
          axios.get(`${BASE_URL}/data/bank_profile_data.json`)
        ]);
        setProfile(profRes.data.profile);
        setBankData(dataRes.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('فشل في تحميل بيانات البنك أو الملف الشخصي.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Parse markdown sections by Arabic headings using useCallback
  const parseSection = React.useCallback((heading: string): string[] => {
    const regex = new RegExp(`\\*\\*${heading}\\*\\*([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i');
    const match = profile.match(regex);
    if (!match) return [];
    return match[1]
      .trim()
      .split(/\r?\n/)
      .map(line => line.replace(/^\s*[*\-\d.]+\s*/, '').trim())
      .filter(line => line);
  }, [profile]);

  // Memoized parsed sections with Arabic titles
  const parsedSections: SectionData[] = useMemo(() => [
    { title: 'نظرة عامة', items: parseSection('نظرة عامة') },
    { title: 'انطباع العملاء', items: parseSection('انطباع العملاء') },
    { title: 'تقييمات الفروع', items: parseSection('تقييمات الفروع') },
    { title: 'نقاط القوة', items: parseSection('نقاط القوة') },
    { title: 'نقاط الضعف', items: parseSection('نقاط الضعف') },
    { title: 'الخدمات المقدمة', items: parseSection('الخدمات المقدمة') },
    { title: 'التحديثات الأخيرة', items: parseSection('التحديثات الأخيرة') }
  ], [parseSection]);

  // Memoized structured bank data sections
  const structuredSections: SectionData[] = useMemo(() => {
    if (!bankData) return [];
    return (Object.keys(bankData) as Array<keyof BankProfileData>)
      .map(key => ({
        title: toTitle(key),
        items: bankData[key]
      }));
  }, [bankData]);

  // Combine all sections
  const allSections: SectionData[] = useMemo(
    () => [...parsedSections, ...structuredSections],
    [parsedSections, structuredSections]
  );

  // Toggle accordion
  const toggle = (key: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

  if (loading)
    return <div className="flex justify-center items-center h-full"><BeatLoader /></div>;
  if (error)
    return <div className="text-red-600 p-4">{error}</div>;

  // Filter by search across all sections
  const visible = allSections
    .map(sec => ({
      ...sec,
      items: sec.items.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(sec => sec.items.length);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">الملف الشخصي للبنك </h1>

        {/* Search Bar */}
        <div className="mb-4 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في جميع الأقسام..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 w-full py-2 border rounded"
          />
        </div>

        {/* Accordion Display */}
        <div className="space-y-4">
          {visible.map(sec => (
            <div key={sec.title} className="border rounded overflow-hidden">
              <div
                className="flex items-center justify-between p-4 bg-gray-100 cursor-pointer"
                onClick={() => toggle(sec.title)}
              >
                <span className="font-semibold">{sec.title}</span>
                {expanded.has(sec.title) ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              <motion.div
                initial={false}
                animate={{ height: expanded.has(sec.title) ? 'auto' : 0 }}
                className="overflow-hidden px-4"
              >
                <ul className="py-2 list-disc list-inside space-y-1">
                  {sec.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Profile;
