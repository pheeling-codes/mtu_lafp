'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, CheckCircle, Clock, XCircle, MapPin, Calendar, Package, Shield, FileText, Eye, Download, X } from 'lucide-react';
import { supabaseClient } from '@/utils/supabaseClient';
import JSZip from 'jszip';

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  image_url: string | null;
  created_at: string;
}

interface Claim {
  id: string;
  verification_text: string;
  proof_url: string | null;
  status: 'pending_review' | 'approved' | 'rejected';
  recovery_instructions: string | null;
  created_at: string;
  reviewed_at: string | null;
  item: Item;
}

interface ClaimDetailClientProps {
  claim: Claim;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'approved':
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        icon: CheckCircle,
        label: 'Approved',
        description: 'Your claim has been verified and approved!'
      };
    case 'rejected':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: XCircle,
        label: 'Rejected',
        description: 'Unfortunately, your claim could not be verified.'
      };
    case 'pending_review':
    default:
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: Clock,
        label: 'Pending Review',
        description: 'Your claim is being reviewed by our security team.'
      };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export default function ClaimDetailClient({ claim }: ClaimDetailClientProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [signedUrls, setSignedUrls] = useState<{ [key: string]: string }>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const statusConfig = getStatusConfig(claim.status);
  const StatusIcon = statusConfig.icon;
  
  const isApproved = claim.status === 'approved';
  const isRejected = claim.status === 'rejected';

  // Parse proof URLs - handle both single URL and JSON array
  const proofUrls = claim.proof_url ? 
    (claim.proof_url.startsWith('[') ? JSON.parse(claim.proof_url) : [claim.proof_url]) : 
    [];

  // Ref to track navigation state
  const navigationRef = useRef(false);
  
  // Ref to track modal state
  const modalRef = useRef(false);
  
  // Ref to track signed URL generation to prevent concurrent requests
  const signedUrlGenerationRef = useRef(false);

  // Simple modal handlers without complex protection
  const openModal = (e?: React.MouseEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setShowImageModal(true);
  };
  
  const closeModal = (e?: React.MouseEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setShowImageModal(false);
  };

  // Generate signed URLs for images - prevent concurrent requests
  useEffect(() => {
    if (proofUrls.length > 0 && showImageModal && !signedUrlGenerationRef.current) {
      signedUrlGenerationRef.current = true;
      
      // Sequential generation to prevent lock stealing
      const generateSequentially = async () => {
        for (let i = 0; i < proofUrls.length; i++) {
          const url = proofUrls[i];
          await generateSignedUrl(url);
          // Small delay between requests to prevent lock conflicts
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        signedUrlGenerationRef.current = false;
      };
      
      generateSequentially();
    }
  }, [proofUrls, showImageModal]);

  const generateSignedUrl = async (fileUrl: string) => {
    try {
      // Extract file path from URL - remove the bucket name from the path
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.indexOf('claim-proofs');
      const filePath = pathParts.slice(bucketIndex + 1).join('/'); // Skip the bucket name
      
      
      // Add retry logic for lock stealing
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const { data, error } = await supabaseClient.storage
            .from('claim-proofs')
            .createSignedUrl(filePath, 3600); // 1 hour expiry
          
          if (error) {
            if (retryCount === maxRetries - 1) {
              // Final fallback to original URL
              setSignedUrls(prev => ({ ...prev, [fileUrl]: fileUrl }));
              return;
            }
          } else {
            setSignedUrls(prev => ({ ...prev, [fileUrl]: data.signedUrl }));
            return;
          }
        } catch (requestError) {
          if (retryCount === maxRetries - 1) {
            // Final fallback to original URL
            setSignedUrls(prev => ({ ...prev, [fileUrl]: fileUrl }));
            return;
          }
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        retryCount++;
      }
    } catch (err) {
      // Fallback to original URL
      setSignedUrls(prev => ({ ...prev, [fileUrl]: fileUrl }));
    }
  };

  const downloadAllAsZip = async (e: React.MouseEvent) => {
    // Comprehensive event prevention
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();
    
    // Prevent navigation interference
    if (navigationRef.current) {
      return;
    }
    
    navigationRef.current = true;
    setIsDownloading(true);
    
    try {
      
      // Download all files concurrently with isolated execution
      const downloadPromises = proofUrls.map(async (url: string, index: number) => {
        try {
          const signedUrl = signedUrls[url] || url;
          
          // Use iframe isolation to prevent navigation interference
          return new Promise<void>((resolve, reject) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.style.position = 'absolute';
            iframe.style.left = '-9999px';
            document.body.appendChild(iframe);
            
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!iframeDoc) {
              reject(new Error('Could not access iframe document'));
              return;
            }
            
            const link = iframeDoc.createElement('a');
            link.href = signedUrl;
            link.download = `proof_${index + 1}.jpg`;
            link.style.display = 'none';
            
            iframeDoc.body.appendChild(link);
            
            // Trigger download in isolated context
            setTimeout(() => {
              try {
                link.click();
                resolve();
              } catch (clickError) {
                reject(clickError);
              } finally {
                // Cleanup iframe after delay
                setTimeout(() => {
                  if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                  }
                }, 200);
              }
            }, 50);
          });
        } catch (error) {
          throw error;
        }
      });
      
      // Wait for all downloads with timeout
      const results = await Promise.allSettled(downloadPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      
      if (failed > 0) {
        alert(`${successful} files downloaded successfully. ${failed} files failed.`);
      } else {
      }
      
    } catch (error) {
      alert('Failed to download files. Please try again.');
    } finally {
      setIsDownloading(false);
      // Reset navigation ref after delay
      setTimeout(() => {
        navigationRef.current = false;
      }, 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/my-claims"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to My Claims
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim Details</h1>
        <p className="text-gray-500">
          View the status and details of your item claim request.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Item Details */}
        <div className="space-y-6">
          {/* Item Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="relative h-64 bg-gray-100">
              {claim.item.image_url ? (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full" />
                    </div>
                  )}
                  <img
                    src={claim.item.image_url}
                    alt={claim.item.name}
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <Package className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{claim.item.name}</h2>
              <p className="text-gray-600 text-sm mb-4">{claim.item.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{claim.item.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Found on {formatDate(claim.item.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Your Submitted Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Your Verification Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Hidden Detail Provided
                </label>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-4 text-sm">
                  {claim.verification_text}
                </p>
              </div>
              
              {claim.proof_url && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">
                    Proof of Ownership
                  </label>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openModal();
                    }}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View Uploaded Document
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Status & Recovery */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className={`${statusConfig.bg} ${statusConfig.border} border rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`${statusConfig.text}`}>
                <StatusIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${statusConfig.text}`}>
                  {statusConfig.label}
                </h3>
                <p className="text-sm text-gray-500">
                  Submitted on {formatDate(claim.created_at)}
                </p>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              {statusConfig.description}
            </p>
            
            {claim.reviewed_at && (
              <p className="text-sm text-gray-500 mt-3">
                Reviewed on {formatDate(claim.reviewed_at)}
              </p>
            )}
          </div>

          {/* Recovery Instructions - Only for Approved Claims */}
          {isApproved && claim.recovery_instructions && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-emerald-900">
                  Recovery Instructions
                </h3>
              </div>
              
              <div className="bg-white/70 rounded-lg p-4 border border-emerald-100">
                <p className="text-emerald-800 leading-relaxed">
                  {claim.recovery_instructions}
                </p>
              </div>
              
              <div className="mt-4 flex items-start gap-2 text-sm text-emerald-700">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  Please bring a valid student ID or government-issued ID when picking up your item.
                </p>
              </div>
            </div>
          )}

          {/* Rejection Info - Only for Rejected Claims */}
          {isRejected && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-900">
                  Claim Not Verified
                </h3>
              </div>
              
              <p className="text-red-700 text-sm leading-relaxed">
                Unfortunately, we were unable to verify your ownership of this item. 
                If you believe this was an error, please contact the MTU Security Office 
                directly for further assistance.
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Security Notice
                </h4>
                <p className="text-sm text-blue-700">
                  All claims are reviewed by authorized MTU Security personnel. 
                  Your verification details are encrypted and securely stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && claim.proof_url && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-content bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeModal();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Proof of Ownership ({proofUrls.length} file{proofUrls.length !== 1 ? 's' : ''})</h4>
                            
                  {proofUrls.length > 0 ? (
                    <div className="space-y-4">
                      {/* Image Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {proofUrls.map((url: string, index: number) => (
                          <div key={index} className="relative group">
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden aspect-square">
                              {signedUrls[url] ? (
                                <img
                                  src={signedUrls[url]}
                                  alt={`Proof document ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                  onLoad={() => {
                                  }}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                              )}
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <a
                                href={signedUrls[url] || url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                              >
                                <Eye className="w-4 h-4 text-gray-700" />
                              </a>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              #{index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                      <p className="text-gray-500">No proof documents available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
