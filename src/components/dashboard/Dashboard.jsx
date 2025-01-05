import { useState } from 'react';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';
import NewsAnalytics from './NewsAnalytics';
import PayoutDetails from './PayoutDetails';
import { useNews } from '../../context/NewContext';
import { Menu } from 'lucide-react';
import Navbar from '../Navbar/Navbar';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('Dashboard');
  const { news, loading, error } = useNews();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <div className="sticky top-0 left-0 right-0 z-30">
        <Navbar />
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content - Full Width */}
      <main className="w-full px-4 py-6 lg:px-8 lg:py-8 mt-4">

        {/* SearchBar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 max-w-[2000px] mx-auto"
        >
          <SearchBar />
        </motion.div>

        <div className="space-y-8 max-w-[2000px] mx-auto">
          {/* PayoutDetails */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <PayoutDetails data={news || []} />
          </motion.div>

          {/* NewsAnalytics */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full bg-white rounded-lg shadow-sm p-4 lg:p-6"
          >
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <NewsAnalytics data={news || []} />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}