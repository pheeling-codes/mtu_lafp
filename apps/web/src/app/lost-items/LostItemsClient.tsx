'use client';

import { useState } from 'react';
import { Plus, Filter, ArrowUpDown, Search, MapPin, Calendar, Eye, FileCheck, PackageOpen } from 'lucide-react';
import Link from 'next/link';

interface LostItem {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  status: 'active' | 'matched' | 'claimed' | 'resolved';
  created_at: string;
  image_url?: string;
}

interface LostItemsClientProps {
  initialItems: LostItem[];
  userId: string;
}

const statusConfig = {
  active: { bg: 'bg-slate-700', text: 'text-white', label: 'Active' },
  matched: { bg: 'bg-amber-500', text: 'text-white', label: 'Matched' },
  claimed: { bg: 'bg-emerald-500', text: 'text-white', label: 'Claimed' },
  resolved: { bg: 'bg-gray-500', text: 'text-white', label: 'Resolved' },
} as const;

const tabs = [
  { id: 'all', label: 'All Items' },
  { id: 'active', label: 'Active' },
  { id: 'matched', label: 'Matched' },
  { id: 'claimed', label: 'Claimed' },
] as const;

export default function LostItemsClient({ initialItems, userId }: LostItemsClientProps) {
  const [items] = useState<LostItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [isLoading] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === 'all' || item.status === activeTab;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const getStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold ${config.bg} ${config.text} shadow-sm`}>
        {status === 'matched' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getActionButton = (status: string) => {
    if (status === 'matched') {
      return { text: 'View Match Details', icon: Eye };
    }
    if (status === 'claimed') {
      return { text: 'View Recovery Receipt', icon: FileCheck };
    }
    return { text: 'View Details', icon: Eye };
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Lost Items</h1>
          <p className="mt-1 text-gray-500">Track the status of items you have reported as lost.</p>
        </div>
        <Link
          href="/report"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Report Lost Item
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {tabs.map((tab) => {
          const count = tab.id === 'all' ? items.length : items.filter(i => i.status === tab.id).length;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>{tab.label}</span>
              {count > 0 && tab.id !== 'all' && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Utility Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button 
            onClick={() => setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort: {sortBy === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-5 space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <PackageOpen className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
          </div>
          {activeTab === 'matched' ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches made</h3>
              <p className="text-gray-500 text-center max-w-md">
                No matches have been made for your lost items yet. We&apos;ll notify you when a potential match is found.
              </p>
            </>
          ) : activeTab === 'claimed' ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No claims made</h3>
              <p className="text-gray-500 text-center max-w-md">
                You haven&apos;t made any claims for found items yet. Browse found items to claim what&apos;s yours.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No lost items reported</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                You haven&apos;t reported any lost items yet. Get started by reporting your first lost item.
              </p>
              <Link
                href="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-[#1D4ED8] transition-all"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                Report Lost Item
              </Link>
            </>
          )}
        </div>
      )}

      {/* Items Grid */}
      {!isLoading && sortedItems.length > 0 && (
        <div className="h-[800px] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start">
            {sortedItems.map((item) => {
              const action = getActionButton(item.status);
              const ActionIcon = action.icon;
              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <PackageOpen className="w-12 h-12 text-gray-300" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* Content */}
                <div className="p-5">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {item.category || 'Uncategorized'}
                  </p>
                  
                  <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-1">
                    {item.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-500">Date lost:</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-500">Location:</span>
                      <span>{item.location || 'Unknown location'}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <button className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] active:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2">
                    <ActionIcon className="w-4 h-4" />
                    {action.text}
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
