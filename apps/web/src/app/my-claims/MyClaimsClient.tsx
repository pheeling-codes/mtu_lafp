'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  SearchCode, 
  MoreVertical,
  Trash2,
  ChevronRight,
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

interface Claim {
  id: string;
  user_id: string;
  item_id: string;
  hidden_details: string;
  proof_url: string | null;
  status: 'pending_review' | 'approved' | 'rejected';
  recovery_instructions: string | null;
  created_at: string;
  item: Item;
}

interface MyClaimsClientProps {
  initialClaims: Claim[];
  userId: string;
}

// Format date
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Status badge styles
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        label: 'Approved',
        icon: '✓'
      };
    case 'rejected':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'Rejected',
        icon: '✕'
      };
    case 'pending_review':
    default:
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        label: 'Pending Review',
        icon: '○'
      };
  }
};

// Skeleton Row
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-4 px-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
      </td>
      <td className="py-4 px-6">
        <div className="w-28 h-6 bg-gray-200 rounded-full animate-pulse" />
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </td>
    </tr>
  );
}

type FilterTab = 'all' | 'verified';

export default function MyClaimsClient({ initialClaims, userId }: MyClaimsClientProps) {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Filter claims based on active tab
  const filteredClaims = useMemo(() => {
    if (activeFilter === 'verified') {
      return claims.filter(claim => claim.status === 'approved');
    }
    return claims;
  }, [claims, activeFilter]);

  // Real-time subscription
  useEffect(() => {
    
    const channel = supabaseClient
      .channel('claims_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'claims',
          filter: `seeker_id=eq.${userId}`
        },
        (payload) => {
          
          if (payload.eventType === 'INSERT') {
            setClaims(prev => [payload.new as Claim, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setClaims(prev => prev.map(c => c.id === payload.new.id ? payload.new as Claim : c));
          } else if (payload.eventType === 'DELETE') {
            setClaims(prev => {
              const updated = prev.filter(c => c.id !== payload.old.id);
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
      });

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId]);

  const handleViewDetails = (claimId: string) => {
    router.push(`/my-claims/${claimId}`);
  };

  const handleDeleteClaim = async (claimId: string) => {
    if (!confirm('Are you sure you want to delete this claim? This action cannot be undone.')) {
      return;
    }

    try {
      
      const { error } = await supabaseClient
        .from('claims')
        .delete()
        .eq('id', claimId);

      if (error) {
        alert('Failed to delete claim. Please try again.');
        return;
      }

      
      // Remove from local state immediately
      setClaims(prev => {
        const updated = prev.filter(c => c.id !== claimId);
        return updated;
      });

      // Close any open menu
      setOpenMenuId(null);
      
      // Show success message
      alert('Claim deleted successfully.');
    } catch (err) {
      alert('Failed to delete claim. Please try again.');
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Claims</h1>
        <p className="text-gray-500">
          Track the status of your submitted claim requests.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('verified')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeFilter === 'verified'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Verified
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-50/50 border-b border-blue-100">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Details</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </tbody>
          </table>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchCode className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">You haven&apos;t submitted any claims yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Find your item in the Found Ledger to get started.
          </p>
          <Link
            href="/found-items"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors"
          >
            Browse Found Items
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-blue-50/50 border-b border-blue-100">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Details</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim) => {
                const status = getStatusBadge(claim.status);
                return (
                  <tr key={claim.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        {claim.item?.image_url ? (
                          <img
                            src={claim.item.image_url}
                            alt={claim.item.name}
                            className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No img</span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-900">{claim.item?.name || 'Unknown Item'}</h4>
                          <p className="text-sm text-gray-500 capitalize">{claim.item?.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">{formatDate(claim.created_at)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                        <span>{status.icon}</span>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(claim.id)}
                          className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors"
                        >
                          View Details
                        </button>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === claim.id ? null : claim.id);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === claim.id && (
                            <div className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => {
                                  handleDeleteClaim(claim.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Claim
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
