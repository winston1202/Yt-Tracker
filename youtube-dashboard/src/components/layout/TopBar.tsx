import { useState } from 'react';
import { Search, ListFilter as Filter, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopBarProps {
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function TopBar({ onSearch, onRefresh, isLoading }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearch = (e: Event) => {
    e.preventDefault?.();
    onSearch?.(searchQuery);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
        <input
          type="text"
          value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Search channels or videos..."
            />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Filters */}
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>

          {/* Refresh */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>
      </div>
    </div>
  );
}