'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  SearchCode, 
  Calendar, 
  MapPin, 
  ArrowRightLeft,
  Eye,
  CheckSquare,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { supabaseClient } from '@/utils/supabaseClient';

interface Item {
  id: string;
  name: string;
  category: string;
  description: string | null;
  location: string;
  date_lost: string | null;
  image_url: string | null;
  status: string;
  type: string;
  created_at: string;
}

interface Match {
  id: string;
  user_id: string;
  lost_item_id: string;
  found_item_id: string;
  confidence_score: number;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
  lost_item: Item;
  found_item: Item;
}

interface MatchesClientProps {
  initialMatches: Match[];
  userId: string;
}

type TabType = 'unresolved' | 'resolved' | 'all';

// Format date
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Format relative time
const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `Matched ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Matched 1 day ago';
  return `Matched ${diffDays} days ago`;
};

// Generate item reference ID
const generateItemId = (id: string, type: 'lost' | 'found'): string => {
  const hash = id.slice(-4).toUpperCase();
  return type === 'lost' ? `#L-${hash}` : `#F-${hash}`;
};

// Get confidence badge styles
const getConfidenceBadge = (score: number) => {
  if (score >= 85) {
    return {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: 'bg-emerald-500',
      label: `${score}% Match Confidence`
    };
  } else if (score >= 70) {
    return {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: 'bg-amber-500',
      label: `${score}% Match Confidence`
    };
  } else {
    return {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-600',
      icon: 'bg-gray-400',
      label: `${score}% Match Confidence`
    };
  }
};

// Match Card Component
function MatchCard({ match, onClaim }: { match: Match; onClaim: (id: string) => void }) {
  const badge = getConfidenceBadge(match.confidence_score);
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${badge.bg} ${badge.border}`}>
          <span className={`w-2 h-2 rounded-full ${badge.icon}`} />
          <span className={`text-sm font-semibold ${badge.text}`}>{badge.label}</span>
        </div>
        <span className="text-sm text-gray-400">{formatRelativeTime(match.created_at)}</span>
      </div>

      {/* Card Body - Side by Side */}
      <div className="p-6">
        <div className="flex items-stretch gap-4">
          {/* Left Panel - Your Lost Item */}
          <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Lost Item</span>
              <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                {generateItemId(match.lost_item_id, 'lost')}
              </span>
            </div>
            
            <div className="flex gap-4">
              {match.lost_item?.image_url ? (
                <img 
                  src={match.lost_item.image_url} 
                  alt={match.lost_item.name}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-2 truncate">{match.lost_item?.name || 'Unknown Item'}</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Lost {formatDate(match.lost_item?.date_lost)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{match.lost_item?.location || 'Unknown location'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Link Icon */}
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
              <ArrowRightLeft className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          {/* Right Panel - Found Item */}
          <div className="flex-1 bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Found Item</span>
              <span className="text-xs font-medium text-blue-600 bg-white px-2 py-1 rounded border border-blue-100">
                {generateItemId(match.found_item_id, 'found')}
              </span>
            </div>
            
            <div className="flex gap-4">
              {match.found_item?.image_url ? (
                <img 
                  src={match.found_item.image_url} 
                  alt={match.found_item.name}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-2 truncate">{match.found_item?.name || 'Unknown Item'}</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Found {formatDate(match.found_item?.date_lost)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{match.found_item?.location || 'Unknown location'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Link
            href={`/found-items/${match.found_item_id}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Found Item
          </Link>
          <button
            onClick={() => onClaim(match.found_item_id)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm"
          >
            <CheckSquare className="w-4 h-4" />
            Claim This Item
          </button>
        </div>
      </div>
    </div>
  );
}

// Skeleton Card
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="w-32 h-6 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="p-6">
        <div className="flex items-stretch gap-4">
          <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-2/3 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-2/3 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <div className="w-28 h-9 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-32 h-9 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function MatchesClient({ initialMatches, userId }: MatchesClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('unresolved');
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [isLoading, setIsLoading] = useState(false);

  // Filter matches based on tab
  const filteredMatches = useMemo(() => {
    switch (activeTab) {
      case 'unresolved':
        return matches.filter(m => m.status === 'pending');
      case 'resolved':
        return matches.filter(m => m.status === 'resolved');
      case 'all':
      default:
        return matches;
    }
  }, [matches, activeTab]);

  // Counts for tabs
  const counts = useMemo(() => ({
    unresolved: matches.filter(m => m.status === 'pending').length,
    resolved: matches.filter(m => m.status === 'resolved').length,
    all: matches.length
  }), [matches]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabaseClient
      .channel('matches_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMatches(prev => [payload.new as Match, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setMatches(prev => prev.map(m => m.id === payload.new.id ? payload.new as Match : m));
          } else if (payload.eventType === 'DELETE') {
            setMatches(prev => prev.filter(m => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId]);

  const handleClaim = (foundItemId: string) => {
    router.push(`/found-items/${foundItemId}/verify`);
  };

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'unresolved', label: 'Unresolved', count: counts.unresolved },
    { id: 'resolved', label: 'Resolved', count: counts.resolved },
    { id: 'all', label: 'All Matches', count: counts.all },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Automated Matches</h1>
        <p className="text-gray-500">
          Potential items found that match your active reports.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-gray-100 text-gray-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchCode className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            We&apos;ll notify you as soon as a potential match is discovered. Keep your lost item reports active!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} onClaim={handleClaim} />
          ))}
        </div>
      )}
    </div>
  );
}
