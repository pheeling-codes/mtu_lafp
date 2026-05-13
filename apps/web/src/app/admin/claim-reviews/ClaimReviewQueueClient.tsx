'use client';

import { useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search,
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Package,
  Calendar,
  Eye,
  CheckSquare,
  XSquare,
  Loader2
} from 'lucide-react';

interface ClaimWithDetails {
  id: string;
  item_id: string;
  seeker_id: string;
  verification_text: string;
  proof_url: string | null;
  status: 'pending_review' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  seeker: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  item: {
    id: string;
    title: string;
    category_id: string;
    location_id: string;
    image_url: string | null;
    created_at: string;
  };
}

interface ClaimReviewQueueClientProps {
  claims: ClaimWithDetails[];
}

// Sanitize function to remove URL encoding
const sanitizeString = (str: string | null): string => {
  if (!str) return '';
  return decodeURIComponent(str);
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        icon: CheckCircle,
        label: 'Approved'
      };
    case 'rejected':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: XCircle,
        label: 'Rejected'
      };
    case 'pending_review':
    default:
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        icon: Clock,
        label: 'Pending Review'
      };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const generateClaimId = (id: string) => {
  return `CLM-${id.slice(0, 4).toUpperCase()}-${id.slice(-4).toUpperCase()}`;
};

export default function ClaimReviewQueueClient({ claims }: ClaimReviewQueueClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter claims based on search and selected tab
  const filteredClaims = claims.filter(claim => {
    const matchesSearch = searchQuery === '' || 
      sanitizeString(claim.seeker.full_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      sanitizeString(claim.seeker.email).toLowerCase().includes(searchQuery.toLowerCase()) ||
      sanitizeString(claim.item.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      generateClaimId(claim.id).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = selectedTab === 'pending' 
      ? claim.status === 'pending_review'
      : selectedTab === 'approved' 
        ? claim.status === 'approved'
        : claim.status === 'rejected';

    return matchesSearch && matchesTab;
  });

  const pendingCount = claims.filter(c => c.status === 'pending_review').length;
  const approvedCount = claims.filter(c => c.status === 'approved').length;
  const rejectedCount = claims.filter(c => c.status === 'rejected').length;

  const handleApprove = (claimId: string) => {
    setSelectedClaimId(claimId);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedClaimId) return;
    setIsSubmitting(true);
    setShowApproveModal(false);
    try {
      const response = await fetch(`/api/admin/claims/${selectedClaimId}/approve`, {
        method: 'POST',
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsSubmitting(false);
      setSelectedClaimId(null);
    }
  };

  const handleReject = (claimId: string) => {
    setSelectedClaimId(claimId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedClaimId) return;
    setIsSubmitting(true);
    setShowRejectModal(false);
    try {
      const response = await fetch(`/api/admin/claims/${selectedClaimId}/reject`, {
        method: 'POST',
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsSubmitting(false);
      setSelectedClaimId(null);
    }
  };

  const handleViewDetails = (claimId: string) => {
    router.push(`/admin/claims/${claimId}`);
  };

  // Skeleton loading row
  const SkeletonRow = () => (
    <tr className="border-b border-gray-100">
      <td className="py-4 px-6"><div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2" /><div className="w-24 h-3 bg-gray-200 rounded animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-36 h-4 bg-gray-200 rounded animate-pulse mb-2" /><div className="w-16 h-3 bg-gray-200 rounded animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-28 h-4 bg-gray-200 rounded animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" /></td>
      <td className="py-4 px-6"><div className="flex gap-2"><div className="w-20 h-8 bg-gray-200 rounded animate-pulse" /><div className="w-20 h-8 bg-gray-200 rounded animate-pulse" /></div></td>
    </tr>
  );

  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim Review Queue</h1>
          <p className="text-gray-500">Review and process ownership claims submitted by users</p>
        </div>

        {/* Search and Filters - Inline Layout */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-20 justify-between items-center">
            {/* Search */}
            <div className="w-full md:w-[400px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, item, or claim ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedTab('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === 'pending'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setSelectedTab('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === 'approved'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setSelectedTab('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === 'rejected'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Claims Table - Fixed Header Scrollable Body */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Fixed Height Container - shrinks with less data */}
          <div className="max-h-[calc(100vh-350px)] overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Claimant</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                  {(selectedTab === 'approved' || selectedTab === 'rejected') && (
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Reviewed</th>
                  )}
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={selectedTab === 'approved' || selectedTab === 'rejected' ? 6 : 5} className="py-12 text-center">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No claims found</p>
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((claim) => {
                    const statusBadge = getStatusBadge(claim.status);
                    const StatusIcon = statusBadge.icon;
                    const isPending = claim.status === 'pending_review';
                    
                    return (
                      <tr 
                        key={claim.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewDetails(claim.id)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              {claim.seeker.avatar_url ? (
                                <img 
                                  src={claim.seeker.avatar_url} 
                                  alt={sanitizeString(claim.seeker.full_name)}
                                  className="w-10 h-10 rounded-full object-cover" 
                                />
                              ) : (
                                <User className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{sanitizeString(claim.seeker.full_name)}</p>
                              <p className="text-sm text-gray-500">{sanitizeString(claim.seeker.email)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{sanitizeString(claim.item.title)}</p>
                            <p className="text-sm text-gray-500">{generateClaimId(claim.id)}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600">{formatDate(claim.created_at)}</span>
                        </td>
                        {(selectedTab === 'approved' || selectedTab === 'rejected') && (
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600">{formatDate(claim.updated_at)}</span>
                          </td>
                        )}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            {isPending ? (
                              <>
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(claim.id);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer transition-colors"
                                >
                                  Approve
                                </span>
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(claim.id);
                                  }}
                                  className="text-red-400 hover:text-red-600 text-sm font-medium cursor-pointer transition-colors"
                                >
                                  Reject
                                </span>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(claim.id);
                                }}
                                className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredClaims.length}</span> of {claims.length} claims
          </p>
        </div>
      </div>

      {/* Rejection Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 border border-gray-200 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XSquare className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Reject Ownership Claim?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reject this claim? You should only do this if the provided hidden details or proof do not match the item record.
            </p>
            <div className="flex gap-3 justify-between">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={isSubmitting}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <XSquare className="w-4 h-4" />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 border border-gray-200 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Approve Ownership Claim?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              By approving this, you confirm that student's details match the item record. The item will be marked as Claimed and the student will be notified to begin recovery.
            </p>
            <div className="flex gap-3 justify-between">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    Confirm Approval
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
