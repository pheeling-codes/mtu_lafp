'use client';

import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Clock, 
  Hash, 
  Shield, 
  Hand,
  Share2,
  Flag,
  ChevronLeft,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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

interface ItemDetailClientProps {
  item: FoundItem;
  userId: string;
}

// Function to generate redacted general location
const getGeneralLocation = (specificLocation: string): string => {
  const locationMap: Record<string, string> = {
    'University Main Library': 'Library (Generalized)',
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

// Format time for display
const formatTime = (dateStr: string | null): string => {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  return `Approx. ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
};

// Generate item reference ID
const generateItemId = (id: string): string => {
  const hash = id.slice(-4).toUpperCase();
  return `#FI-${hash}`;
};

export default function ItemDetailClient({ item, userId }: ItemDetailClientProps) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleClaim = () => {
    router.push(`/found-items/${item.id}/verify`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch {
      // Fallback - could show a modal with the URL
    }
  };

  const handleReport = () => {
    // Could open a modal or navigate to a report page
    alert('Thank you for reporting. Our team will review this item.');
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col justify-center min-h-[calc(100vh-200px)]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/found-items" className="hover:text-gray-700 transition-colors">
          Found Items
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-semibold">{generateItemId(item.id)}</span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div className="relative">
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            {item.image_url ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full" />
                  </div>
                )}
                <img
                  src={item.image_url}
                  alt={item.name}
                  onLoad={() => setImageLoaded(true)}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hash className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-400 font-medium">No Image Available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Category & Title */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg mb-4">
              <span className="text-sm font-medium text-blue-700 capitalize">
                {item.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name || 'Found Item'}</h1>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Date Found</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{formatDate(item.date_lost)}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Location</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {getGeneralLocation(item.location)}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Time</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{formatTime(item.created_at)}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Hash className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Reference ID</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{generateItemId(item.id)}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {item.description || 
                `A ${item.category} was found unattended and has been securely stored at the central security desk. The item was turned in by a responsible finder to ensure it can be returned to its rightful owner.`}
            </p>
          </div>

          {/* Verification Required Box */}
          <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Verification Required</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  To successfully claim this item, you will need to provide specific identifying details 
                  (such as a serial number, lock screen wallpaper, or distinguishing marks) that are not 
                  publicly displayed.
                </p>
              </div>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleClaim}
              className="flex-1 py-3.5 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Hand className="w-5 h-5" />
              This is mine
            </button>

            <button
              onClick={handleShare}
              className="py-3.5 px-6 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* Report Link */}
          <button
            onClick={handleReport}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
          >
            <Flag className="w-4 h-4" />
            Report inappropriate content
          </button>
        </div>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Info className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">Link copied to clipboard</span>
        </div>
      )}
    </div>
  );
}
