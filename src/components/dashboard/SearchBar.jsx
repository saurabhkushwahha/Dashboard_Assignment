import { useState } from 'react';
import { useNews } from '../../context/NewContext';
import { SearchIcon } from 'lucide-react';

const SearchBar = () => {
  const { filters, setFilters } = useNews();
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      searchQuery: searchInput,
    }));
  };

  const handleDateChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      type: event.target.value,
    }));
  };

  return (
    <form onSubmit={handleSearch} className="w-full bg-white rounded-lg shadow-sm p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        {/* Search Input */}
        <div className="sm:col-span-2 lg:col-span-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search news..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2"
            >
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Date Inputs */}
        <div className="sm:col-span-1 lg:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">From Date</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleDateChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-1 lg:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">To Date</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleDateChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type Select */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Type</label>
          <select
            value={filters.type}
            onChange={handleTypeChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="news">News</option>
            <option value="blog">Blog</option>
          </select>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;