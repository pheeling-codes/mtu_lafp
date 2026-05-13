'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ChevronDown, 
  Info, 
  MapPin, 
  Calendar, 
  Tag,
  Loader2,
  Hand
} from 'lucide-react';
import Link from 'next/link';

interface FoundItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  location: string;
  date_lost: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
}

interface FoundItemsClientProps {
  initialItems: FoundItem[];
  userId: string;
}

const categories = [
  { id: 'all', name: 'All' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'keys', name: 'Keys' },
  { id: 'wallets', name: 'Wallets' },
  { id: 'bags', name: 'Bags' },
  { id: 'phones', name: 'Phones' },
  { id: 'jewelry', name: 'Jewelry' },
  { id: 'documents', name: 'Documents' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'other', name: 'Other' },
];

const locations = [
  { id: 'all', name: 'All' },
  { id: 'library', name: 'University Main Library' },
  { id: 'cafeteria', name: 'Student Center Cafeteria' },
  { id: 'science-building', name: 'Science Building' },
  { id: 'engineering-complex', name: 'Engineering Complex' },
  { id: 'student-center', name: 'Student Center' },
  { id: 'auditorium', name: 'Main Auditorium' },
  { id: 'sports-complex', name: 'Sports Complex' },
  { id: 'parking-north', name: 'North Parking Lot' },
  { id: 'parking-south', name: 'South Parking Lot' },
  { id: 'shuttle-stop', name: 'Campus Shuttle Stop' },
  { id: 'admin-building', name: 'Administration Building' },
  { id: 'health-center', name: 'Health Center' },
  { id: 'other', name: 'Other' },
];

const dateRanges = [
  { id: 'any', name: 'Any time' },
  { id: 'today', name: 'Today' },
  { id: 'yesterday', name: 'Yesterday' },
  { id: 'week', name: 'This week' },
  { id: 'month', name: 'This month' },
];

// Function to generate redacted general location
const getGeneralLocation = (specificLocation: string): string => {
  const locationMap: Record<string, string> = {
    'University Main Library': 'Library Area',
    'Student Center Cafeteria': 'Student Center Cafeteria',
    'Science Building': 'Science Building',
    'Engineering Complex': 'Engineering Wing',
    'Student Center': 'Student Center',
    'University Auditorium': 'Campus Area',
    'Sports Complex': 'North Campus Gym',
    'North Campus Parking Lot': 'North Campus Area',
    'South Campus Parking Lot': 'South Campus Area',
    'Campus Shuttle Stop': 'Campus Shuttle Bus',
    'Administration Building': 'Campus Area',
    'Health Center': 'Campus Area',
  };
  return locationMap[specificLocation] || 'Campus Area';
};

// Format date for display
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Generate item reference ID
const generateItemId = (id: string, index: number): string => {
  return `#A-${4029 - index}`;
};

export default function FoundItemsClient({ initialItems, userId }: FoundItemsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDate, setSelectedDate] = useState('any');
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoading, setIsLoading] = useState(false);

  // Filter items
  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation;
      
      let matchesDate = true;
      if (selectedDate !== 'any' && item.date_lost) {
        const itemDate = new Date(item.date_lost);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (selectedDate === 'today') matchesDate = diffDays < 1;
        else if (selectedDate === 'yesterday') matchesDate = diffDays >= 1 && diffDays < 2;
        else if (selectedDate === 'week') matchesDate = diffDays <= 7;
        else if (selectedDate === 'month') matchesDate = diffDays <= 30;
      }
      
      return matchesSearch && matchesCategory && matchesLocation && matchesDate;
    });
  }, [initialItems, searchQuery, selectedCategory, selectedLocation, selectedDate]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 8);
      setIsLoading(false);
    }, 500);
  };

  const handleClaim = (itemId: string) => {
    router.push(`/found-items/${itemId}/verify`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Found Items Ledger</h1>
        <p className="text-gray-500">
          Browse items that have been turned in. Sensitive details are hidden to protect ownership.
        </p>
      </div>

      {/* Claiming Notice Banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          <span className="font-semibold">How claiming works:</span> To successfully claim an item, you will be required to provide hidden details or photo proof of ownership during the verification process.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search found items by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative min-w-[140px]">
          <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white hover:border-gray-300 cursor-pointer transition-colors">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-900 outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Location Dropdown */}
        <div className="relative min-w-[140px]">
          <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white hover:border-gray-300 cursor-pointer transition-colors">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Location:</span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-900 outline-none cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Date Dropdown */}
        <div className="relative min-w-[120px]">
          <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white hover:border-gray-300 cursor-pointer transition-colors">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Date:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-900 outline-none cursor-pointer"
            >
              {dateRanges.map((date) => (
                <option key={date.id} value={date.id}>{date.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex-1 overflow-hidden">
          <div className="h-[calc(100vh-200px)] overflow-y-auto px-4 py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
          </div>
        </div>
      ) : (
        <div className="h-[800px] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start">
            {visibleItems.map((item, index) => (
              <Link
                href={`/found-items/${item.id}`}
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group animate-fade-in block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image Container */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <Tag className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {/* Category Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-gray-700 border border-gray-200/50">
                      {item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Uncategorized'}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 truncate">
                    {item.name || 'Unnamed Item'}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>Location</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-700 font-medium">
                        {locations.find(l => l.id === item.location)?.name || 'Campus Area'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Date Found</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-700 font-medium">
                        {formatDate(item.date_lost)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button - stop propagation to prevent navigation when clicking button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClaim(item.id);
                    }}
                    className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <Hand className="w-4 h-4" />
                    This is mine
                  </button>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Items'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
