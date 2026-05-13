'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// Generate UUID in browser
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
import { 
  ChevronLeft, 
  MapPin, 
  Shield, 
  Upload,
  FileText,
  X,
  CheckCircle,
  HelpCircle,
  Send,
  AlertCircle,
  Lock
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

interface VerifyClaimClientProps {
  item: Item;
  userId: string;
}

// Get generalized location
const getGeneralLocation = (specificLocation: string): string => {
  const locationMap: Record<string, string> = {
    'University Main Library': 'University Main Library',
    'Student Center Cafeteria': 'Student Center Cafeteria',
    'Science Building': 'Science Building',
    'Engineering Complex': 'Engineering Complex',
    'Student Center': 'Student Center',
    'University Auditorium': 'Campus Area',
    'Sports Complex': 'Sports Complex',
    'North Campus Parking Lot': 'North Campus Area',
    'South Campus Parking Lot': 'South Campus Area',
    'Campus Shuttle Stop': 'Campus Shuttle Stop',
    'Administration Building': 'Administration Building',
    'Health Center': 'Health Center',
  };
  return locationMap[specificLocation] || specificLocation;
};

export default function VerifyClaimClient({ item, userId }: VerifyClaimClientProps) {
  const router = useRouter();
  const [hiddenDetails, setHiddenDetails] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  const handleFiles = (files: File[]) => {
    const currentTotalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
    const newFilesSize = files.reduce((sum, f) => sum + f.size, 0);
    const totalSize = currentTotalSize + newFilesSize;
    const totalSizeMB = totalSize / (1024 * 1024);

    // Check total 5MB limit
    if (totalSizeMB > 5) {
      setSubmitError('Total file size cannot exceed 5MB. Please remove some files.');
      return;
    }

    // Check max 4 files limit
    if (uploadedFiles.length + files.length > 4) {
      setSubmitError('Maximum 4 files allowed. Please remove some files.');
      return;
    }

    setUploadedFiles([...uploadedFiles, ...files]);
    setSubmitError(null);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setSubmitError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTotalSizeMB = () => {
    const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
    return (totalSize / (1024 * 1024)).toFixed(2);
  };

  const handleSubmit = async () => {
    
    if (!hiddenDetails.trim()) {
      setSubmitError('Please provide hidden details to verify your ownership.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let proofUrl: string | null = null;

      // Upload files if present
      if (uploadedFiles.length > 0) {
        
        const uploadPromises = uploadedFiles.map(async (file, index) => {
          
          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}/${item.id}/${Date.now()}-${index}.${fileExt}`;
          
          const { error: uploadError, data: uploadData } = await supabaseClient.storage
            .from('claim-proofs')
            .upload(fileName, file);


          if (uploadError) {
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
          }

          const { data: urlData } = supabaseClient.storage
            .from('claim-proofs')
            .getPublicUrl(fileName);
          
          return urlData.publicUrl;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        proofUrl = JSON.stringify(uploadedUrls); // Store all URLs as JSON string
      } else {
      }

      // Create claim record
      const claimId = generateUUID();
      const now = new Date().toISOString();
      
      const { error: claimError, data: claimData } = await (supabaseClient as any)
        .from('claims')
        .insert({
          id: claimId,
          seeker_id: userId,
          item_id: item.id,
          verification_text: hiddenDetails,
          proof_url: proofUrl,
          status: 'pending_review',
          created_at: now,
          updated_at: now
        });


      if (claimError) {
        throw new Error(`Failed to submit claim: ${claimError.message}`);
      }
      

      // Redirect to my claims
      router.push('/my-claims');
    } catch (err) {
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col justify-center min-h-[calc(100vh-200px)]">
      {/* Back Button */}
      <Link
        href={`/found-items/${item.id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Item
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Claim</h1>
        <p className="text-gray-500">
          Provide details and proof to securely claim this item as yours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item Summary Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No img</span>
                </div>
              )}
              <div className="flex-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Claiming Item</span>
                <h2 className="text-lg font-bold text-gray-900 mt-1">{item.name || 'Found Item'}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>Found near {getGeneralLocation(item.location)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Banner */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 text-sm">Secure Claim Submission</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your claim details are encrypted and will only be reviewed by authorized MTU Security personnel to verify ownership.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {/* Hidden Detail Verification */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Hidden Detail Verification</h3>
            <p className="text-sm text-gray-500 mb-4">
              Describe a specific, non-public detail about the item that only the true owner would know. Examples include a serial number, distinct scratches, specific stickers, or lock screen background.
            </p>
            <textarea
              value={hiddenDetails}
              onChange={(e) => setHiddenDetails(e.target.value)}
              placeholder="Example: There is a small dent on the bottom left corner, and the lock screen wallpaper is a picture of a golden retriever..."
              className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-sm"
            />
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Upload Proof of Ownership</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please upload any supporting documents such as a purchase receipt, a previous photo of you with the item, or a matching ID.
            </p>
            
            {uploadedFiles.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                }`}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Supported formats: PNG, JPG, PDF
                </p>
                <p className="text-xs text-gray-500">
                  Up to 4 images allowed • Total size must not exceed 5MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {/* File list */}
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {/* Total size display */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-sm font-medium text-blue-900">Total Size:</span>
                  <span className="text-sm font-semibold text-blue-900">{getTotalSizeMB()} MB / 5 MB</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href={`/found-items/${item.id}`}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || uploadedFiles.length === 0}
              className="px-6 py-3 bg-[#2563EB] text-white font-medium rounded-xl hover:bg-[#1D4ED8] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Claim Request
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Process Guide */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gray-400" />
              Verification Process
            </h3>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div className="w-0.5 h-12 bg-blue-100 mt-2" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Submit Your Details</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Provide accurate hidden details and upload any supporting documents or receipts.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div className="w-0.5 h-12 bg-blue-100 mt-2" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Staff Verification</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    MTU Security carefully reviews your claim against the private details logged by the finder.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Approval & Recovery</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Once your claim is approved, you will receive instructions via email to pick up your item at the main security desk.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 leading-relaxed">
                We prioritize your privacy. Uploaded files and descriptions are securely stored and automatically deleted after the claim is resolved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
