'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft,
  User,
  Package,
  FileText,
  MapPin,
  Calendar,
  Shield,
  AlertTriangle,
  CheckSquare,
  XSquare,
  Eye,
  Loader2
} from 'lucide-react';

interface ClaimWithDetails {
  id: string;
  item_id: string;
  seeker_id: string;
  verification_text: string;
  proof_url: string | string[] | null;
  status: 'pending_review' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  seeker: {
    full_name: string;
    email: string;
    avatar_url: string | null;
    matric_number: string | null;
  };
  item: {
    id: string;
    title: string;
    description_public: string;
    description_private: string | null;
    category_id: string;
    location_id: string;
    image_url: string | null;
    date_lost_or_found: string | null;
    created_at: string;
    category?: { name: string };
    location?: { name: string };
  };
}

interface ClaimVerificationClientProps {
  claim: ClaimWithDetails;
}

// Sanitize function to remove URL encoding
const sanitizeString = (str: string | null): string => {
  if (!str) return '';
  return decodeURIComponent(str);
};

// Helper function to parse proof_url which might be a JSON string array
const parseProofUrls = (proofUrl: string | string[] | null): string[] => {
  if (!proofUrl) return [];
  
  if (Array.isArray(proofUrl)) {
    return proofUrl;
  }
  
  // If it's a string that looks like a JSON array
  if (typeof proofUrl === 'string' && proofUrl.startsWith('[')) {
    try {
      const parsed = JSON.parse(proofUrl);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      // If parsing fails, treat as single URL
    }
  }
  
  // Treat as single URL
  return [proofUrl];
};

// Helper function to convert Supabase URL to proxy URL
const getProxyImageUrl = (claimId: string, originalUrl: string): string => {
  // Fix missing https:// in URLs - handle all variations
  let fixedUrl = originalUrl;
  if (originalUrl.startsWith('http://')) {
    fixedUrl = 'https://' + originalUrl.substring(7); // Remove http:// and add https://
  } else if (originalUrl.startsWith('https://')) {
    fixedUrl = 'https://' + originalUrl.substring(8); // Remove https:// and add https://
  }
  
  // For item images, use direct Supabase URL (they work)
  if (fixedUrl.includes('/item-images/')) {
    return fixedUrl;
  }
  
  // For proof images, keep claim-proofs as is (actual bucket name)
  if (fixedUrl.includes('/claims--proof/')) {
    return fixedUrl;
  }
  
  // For proof images with claim-proofs (actual bucket)
  if (fixedUrl.includes('/claim-proofs/')) {
    return fixedUrl;
  }
  
  // Extract path from Supabase storage URL
  const urlParts = originalUrl.split('/public/');
  if (urlParts.length < 2) {
    return originalUrl;
  }
  
  const path = urlParts[1]; // Get everything after '/public/'
  const proxyUrl = `/api/admin/claims/${claimId}/proof/${path}`;
  return proxyUrl;
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

export default function ClaimVerificationClient({ claim }: ClaimVerificationClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = () => {
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    setIsSubmitting(true);
    setShowApproveModal(false);
    try {
      const response = await fetch(`/api/admin/claims/${claim.id}/approve`, {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/admin/claims');
      }
    } catch (error) {
      // Handle error silently
    }
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    setIsSubmitting(true);
    setShowRejectModal(false);
    try {
      const response = await fetch(`/api/admin/claims/${claim.id}/reject`, {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/admin/claims');
      }
    } catch (error) {
      // Handle error silently
    }
    setIsSubmitting(false);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Debug Info */}
          <div className="fixed top-4 right-4 bg-yellow-100 text-black p-2 rounded z-50 text-xs">
            Debug: Approve Modal: {showApproveModal ? 'OPEN' : 'CLOSED'} | 
            Reject Modal: {showRejectModal ? 'OPEN' : 'CLOSED'} | 
            Claim Status: {claim.status}
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-100 rounded-2xl h-96"></div>
              <div className="bg-gray-100 rounded-2xl h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/claims"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Pending Claims
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Review Claim: {sanitizeString(claim.item.title)}
        </h1>
        <p className="text-gray-500">
          Verify ownership details and approve or reject this claim
        </p>
      </div>

      {/* Side-by-Side Verification Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Column - Student Submission */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Student Submission</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Claimant Details */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Claimant Details
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {claim.seeker.avatar_url ? (
                    <img 
                      src={claim.seeker.avatar_url} 
                      alt={sanitizeString(claim.seeker.full_name)}
                      className="w-12 h-12 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{sanitizeString(claim.seeker.full_name)}</p>
                    <p className="text-sm text-gray-500">{sanitizeString(claim.seeker.email)}</p>
                    {claim.seeker.matric_number && (
                      <p className="text-sm text-gray-500">Student ID: {sanitizeString(claim.seeker.matric_number)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Text */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Hidden Detail Description
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-gray-800">{sanitizeString(claim.verification_text)}</p>
              </div>
            </div>

            {/* Evidence Images */}
            {(() => {
              const proofUrls = parseProofUrls(claim.proof_url);
              if (proofUrls.length === 0) {
                return (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Proof of Ownership
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <p className="text-sm text-gray-500 italic">No proof image uploaded for this claim</p>
                    </div>
                  </div>
                );
              }

              return (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Proof of Ownership ({proofUrls.length} image{proofUrls.length > 1 ? 's' : ''})
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {proofUrls.map((url, index) => {
                        const proxyUrl = getProxyImageUrl(claim.id, url);
                        return (
                          <div key={index} className="relative group">
                            <img
                              src={proxyUrl}
                              alt={`Proof of ownership ${index + 1}`}
                              className="w-32 h-32 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <a
                                href={proxyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-gray-200 transition-colors"
                              >
                                <Eye className="w-6 h-6" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-600 mt-3">Click any image to view full size</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right Column - Internal Security Record */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Internal Security Record</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Item Image */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Item Image
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                {claim.item.image_url ? (
                  <div className="relative group">
                    <img
                      src={getProxyImageUrl(claim.id, claim.item.image_url)}
                      alt={sanitizeString(claim.item.title)}
                      className="w-32 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={getProxyImageUrl(claim.id, claim.item.image_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-gray-200 transition-colors"
                      >
                        <Eye className="w-6 h-6" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-2">Click to view full size</p>
              </div>
            </div>

            {/* Item Metadata */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Item Details
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-gray-900">{sanitizeString(claim.item.title)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Public Description</p>
                  <p className="text-gray-900">{sanitizeString(claim.item.description_public)}</p>
                </div>
                {claim.item.category && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Category</p>
                    <p className="text-gray-900">{sanitizeString(claim.item.category.name)}</p>
                  </div>
                )}
                {claim.item.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Exact Location Found</p>
                    <p className="text-gray-900">{sanitizeString(claim.item.location.name)}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Found on: {formatDate(claim.item.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Internal Staff Notes
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-gray-700 italic">
                  {claim.item.description_private 
                    ? sanitizeString(claim.item.description_private)
                    : 'No internal notes available for this item.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Below Submitted Claim */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Claim submitted on {formatDate(claim.created_at)}
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleReject}
              disabled={isSubmitting || claim.status !== 'pending_review'}
              className="px-8 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XSquare className="w-4 h-4" />
              )}
              Reject Claim
            </button>
            <button
              onClick={handleApprove}
              disabled={isSubmitting || claim.status !== 'pending_review'}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckSquare className="w-4 h-4" />
              )}
              Approve Claim
            </button>
          </div>
        </div>
      </div>

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
              By approving this, you confirm that the student's details match the item record. The item will be marked as Claimed and the student will be notified to begin recovery.
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
    </div>
  );
}
