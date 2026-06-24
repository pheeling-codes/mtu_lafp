'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/utils/supabaseClient';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  ChevronLeft, 
  Package,
  FileText,
  MapPin,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  CheckSquare,
  Loader2
} from 'lucide-react';

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  image_url: string | null;
  created_at: string;
}

interface User {
  full_name: string;
  email: string;
}

interface Claim {
  id: string;
  user_id: string;
  hidden_details: string;
  proof_url: string | null;
  status: 'pending_review' | 'approved' | 'rejected';
  recovery_instructions: string | null;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  item: Item;
  user: User;
}

interface AdminClaimsClientProps {
  initialClaims: Claim[];
}

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

export default function AdminClaimsClient({ initialClaims }: AdminClaimsClientProps) {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [recoveryInstructions, setRecoveryInstructions] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time subscription for claim updates
  useEffect(() => {
    const channel = supabaseClient
      .channel('admin_claims_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'claims'
        },
        async (payload) => {
          // Refresh claims list
          const { data } = await supabaseClient
            .from('claims')
            .select(`
              *,
              item:items(*),
              user:profiles(full_name, email)
            `)
            .order('created_at', { ascending: false });
          
          if (data) {
            setClaims(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const handleReview = (claim: Claim) => {
    setSelectedClaim(claim);
    setRecoveryInstructions(claim.recovery_instructions || '');
    setAdminNotes(claim.admin_notes || '');
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedClaim) return;
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedClaim) return;
    setIsSubmitting(true);
    setShowApproveModal(false);
    try {
      const { data, error } = await supabaseClient
        .from('claims')
        .update({
          status: 'approved',
          recovery_instructions: recoveryInstructions.trim(),
          admin_notes: adminNotes.trim() || null,
          reviewed_at: new Date().toISOString()
        } as any)
        .eq('id', selectedClaim.id);

      if (error) {
        console.error('Approve error:', error);
        return;
      }

      // Update local state
      setClaims(claims.map(c => 
        c.id === selectedClaim.id 
          ? { ...c, status: 'approved' as const, recovery_instructions: recoveryInstructions.trim() }
          : c
      ));
      
      setIsReviewModalOpen(false);
      setSelectedClaim(null);
    } catch (err) {
      console.error('Error approving claim:', err);
      alert('Failed to approve claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim) return;
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedClaim) return;
    setIsSubmitting(true);
    setShowRejectModal(false);
    try {
      const { data, error } = await supabaseClient
        .from('claims')
        .update({
          status: 'rejected',
          admin_notes: adminNotes.trim() || null,
          reviewed_at: new Date().toISOString()
        } as any)
        .eq('id', selectedClaim.id);

      if (error) {
        console.error('Reject error:', error);
        return;
      }

      // Update local state
      setClaims(claims.map(c => 
        c.id === selectedClaim.id 
          ? { ...c, status: 'rejected' as const }
          : c
      ));
      
      setIsReviewModalOpen(false);
      setSelectedClaim(null);
    } catch (err) {
      console.error('Error rejecting claim:', err);
      alert('Failed to reject claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingClaims = claims.filter(c => c.status === 'pending_review');
  const reviewedClaims = claims.filter(c => c.status !== 'pending_review');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Claims</h1>
        <p className="text-gray-500">
          Review and process ownership claims submitted by users.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">{pendingClaims.length}</p>
              <p className="text-sm text-amber-700">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-900">
                {claims.filter(c => c.status === 'approved').length}
              </p>
              <p className="text-sm text-emerald-700">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-900">
                {claims.filter(c => c.status === 'rejected').length}
              </p>
              <p className="text-sm text-red-700">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Claims Section */}
      {pendingClaims.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Pending Review ({pendingClaims.length})
          </h2>
          <div className="space-y-4">
            {pendingClaims.map((claim) => (
              <ClaimCard 
                key={claim.id} 
                claim={claim} 
                onReview={() => handleReview(claim)} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Reviewed Claims Section */}
      {reviewedClaims.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Reviewed Claims ({reviewedClaims.length})
          </h2>
          <div className="space-y-4">
            {reviewedClaims.map((claim) => (
              <ClaimCard 
                key={claim.id} 
                claim={claim} 
                onReview={() => handleReview(claim)} 
                isReviewed
              />
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Review Claim</h2>
              <p className="text-gray-500">Verify ownership details and provide recovery instructions.</p>
            </div>
            
            <div className="p-6">
              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Left: Submitted Claim */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Submitted Claim</h3>
                  </div>
                  
                  {/* Claimant Info */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Claimant:</span> {selectedClaim.user.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {selectedClaim.user.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Submitted:</span> {formatDate(selectedClaim.created_at)}
                    </p>
                  </div>

                  {/* Verification Text */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Verification Details</label>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <p className="text-sm text-gray-800">{selectedClaim.hidden_details}</p>
                    </div>
                  </div>

                  {/* Proof of Ownership */}
                  {selectedClaim.proof_url && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Proof of Ownership</label>
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <a
                          href={selectedClaim.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View Uploaded Document
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Actual Item Record */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Item Record</h3>
                  </div>

                  {/* Item Image */}
                  <div className="mb-4">
                    {selectedClaim.item.image_url ? (
                      <img
                        src={selectedClaim.item.image_url}
                        alt={selectedClaim.item.name}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{selectedClaim.item.name}</h4>
                    <p className="text-sm text-gray-600">{selectedClaim.item.description}</p>
                  </div>

                  {/* Location Found */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>Found at: {selectedClaim.item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>Found on: {formatDate(selectedClaim.item.created_at)}</span>
                    </div>
                  </div>

                  {/* Internal Staff Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Internal Staff Notes</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <p className="text-sm text-gray-600 italic">
                        Private security notes about this item...
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recovery Instructions (for approval) */}
              {selectedClaim.status === 'pending_review' && (
                <div className="mb-4">
                  <label className="block font-semibold text-gray-900 mb-2">
                    Recovery Instructions <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={recoveryInstructions}
                    onChange={(e) => setRecoveryInstructions(e.target.value)}
                    placeholder="e.g., Pick up at the Main Security Desk between 9 AM - 4 PM. Bring your student ID."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    These instructions will be shown to the user upon approval.
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div className="mb-4">
                <label className="block font-semibold text-gray-900 mb-2">
                  Admin Notes (Internal)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this claim..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                />
              </div>

              {/* Previous Recovery Instructions (if approved) */}
              {selectedClaim.status === 'approved' && selectedClaim.recovery_instructions && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Approved Recovery Instructions
                  </h4>
                  <p className="text-emerald-800">{selectedClaim.recovery_instructions}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Close
              </button>
              
              {selectedClaim.status === 'pending_review' && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Reject Claim'}
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isSubmitting || !recoveryInstructions.trim()}
                    className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Approve & Send Instructions'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Claim Card Component
function ClaimCard({ 
  claim, 
  onReview, 
  isReviewed = false 
}: { 
  claim: Claim; 
  onReview: () => void;
  isReviewed?: boolean;
}) {
  const status = getStatusBadge(claim.status);
  const StatusIcon = status.icon;

  return (
    <div className={`bg-white rounded-xl border ${isReviewed ? 'border-gray-200' : 'border-amber-200'} p-4 shadow-sm`}>
      <div className="flex items-start gap-4">
        {claim.item.image_url ? (
          <img
            src={claim.item.image_url}
            alt={claim.item.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{claim.item.name}</h3>
              <p className="text-sm text-gray-500">{claim.user.full_name} • {claim.user.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Submitted {formatDate(claim.created_at)}
              </p>
              {claim.reviewed_at && (
                <p className="text-xs text-gray-400 mt-1">
                  {claim.status === 'approved' ? 'Approved' : 'Rejected'} {formatDate(claim.reviewed_at)}
                </p>
              )}
            </div>
            <div className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </div>
          </div>
        </div>
        
        <button
          onClick={onReview}
          className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {isReviewed ? 'View Details' : 'Review'}
        </button>
      </div>
    </div>
  );
}
