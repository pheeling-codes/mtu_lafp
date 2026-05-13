'use client';

import { 
  Search, 
  MapPin, 
  Sparkles, 
  FileText, 
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Inbox
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Sanitize URL-encoded strings (e.g., %20 -> space, %40 -> @)
function sanitizeUserData(value: string | null): string {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    // Get user name from cookie set at login
    const name = sanitizeUserData(getCookie('user-name'));
    if (name) setUserName(name);
  }, []);

  // Mock stats data
  const stats = {
    lostItemsCount: 2,
    lostItemsSubtext: '1 active, 1 claimed',
    foundItemsCount: 14,
    foundItemsSubtext: 'Within library & student center',
    matchesCount: 1,
    matchesSubtext: 'High probability match found',
    claimsCount: 1,
    claimsSubtext: 'Pending security verification',
  };

  // Mock recent activity
  const recentActivity = [
    {
      id: 1,
      type: 'match',
      title: 'Potential match found',
      description: 'for your reported lost item "MacBook Pro 14-inch"',
      time: '2h ago',
      action: 'Review Match',
      actionUrl: '/matches/1',
      icon: Sparkles,
      iconColor: 'text-[#F59E0B]',
      iconBg: 'bg-[#FEF3C7]',
    },
    {
      id: 2,
      type: 'claim',
      title: 'Claim approved!',
      description: 'You can now pick up your "Hydro Flask Water Bottle" from the central security desk.',
      time: 'Yesterday',
      action: 'View Instructions',
      actionUrl: '/claims/2',
      icon: CheckCircle,
      iconColor: 'text-[#10B981]',
      iconBg: 'bg-[#D1FAE5]',
    },
    {
      id: 3,
      type: 'report',
      title: 'New report submitted',
      description: 'You reported a lost "MacBook Pro 14-inch" at the Library.',
      time: 'Oct 12',
      action: null,
      actionUrl: null,
      icon: FileText,
      iconColor: 'text-[#2563EB]',
      iconBg: 'bg-[#DBEAFE]',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto mt-6">
      {/* Welcome Section - Premium Typography */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111827] tracking-tight mb-2">
          Welcome back, {userName}
        </h1>
        <p className="text-[#6B7280] text-base">
          Here&apos;s an overview of your lost and found activities.
        </p>
      </div>

      {/* Stats Grid - 4 Uniform Cards with Hover Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Lost Items */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#2563EB]/30 transition-all duration-200 group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-[#EFF6FF] rounded-lg group-hover:bg-[#DBEAFE] transition-colors">
              <Search className="w-5 h-5 text-[#2563EB]" />
            </div>
          </div>
          <p className="text-sm text-[#6B7280] mb-1">Lost Items Reported</p>
          <p className="text-3xl font-bold text-[#111827]">{stats.lostItemsCount}</p>
          <p className="text-xs text-[#6B7280] mt-2">{stats.lostItemsSubtext}</p>
        </div>

        {/* Found Items */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#10B981]/30 transition-all duration-200 group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-[#ECFDF5] rounded-lg group-hover:bg-[#D1FAE5] transition-colors">
              <MapPin className="w-5 h-5 text-[#10B981]" />
            </div>
          </div>
          <p className="text-sm text-[#6B7280] mb-1">Found Items Nearby</p>
          <p className="text-3xl font-bold text-[#111827]">{stats.foundItemsCount}</p>
          <p className="text-xs text-[#6B7280] mt-2">{stats.foundItemsSubtext}</p>
        </div>

        {/* Matches */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#F59E0B]/30 transition-all duration-200 group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-[#FEF3C7] rounded-lg group-hover:bg-[#FDE68A] transition-colors">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            </div>
          </div>
          <p className="text-sm text-[#6B7280] mb-1">Potential Matches</p>
          <p className="text-3xl font-bold text-[#111827]">{stats.matchesCount}</p>
          <p className="text-xs text-[#F59E0B] mt-2 font-medium">{stats.matchesSubtext}</p>
        </div>

        {/* Claims */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#8B5CF6]/30 transition-all duration-200 group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-[#F3E8FF] rounded-lg group-hover:bg-[#E9D5FF] transition-colors">
              <FileText className="w-5 h-5 text-[#8B5CF6]" />
            </div>
          </div>
          <p className="text-sm text-[#6B7280] mb-1">Active Claims</p>
          <p className="text-3xl font-bold text-[#111827]">{stats.claimsCount}</p>
          <p className="text-xs text-[#6B7280] mt-2">{stats.claimsSubtext}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity - Left Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#111827]">Recent Activity</h2>
              <Link 
                href="/activity" 
                className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium"
              >
                View all
              </Link>
            </div>
            <div className="p-6">
              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-6 h-6 text-[#9CA3AF]" />
                  </div>
                  <p className="text-[#6B7280] text-sm">No recent activity. Reported items will appear here.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex gap-4 items-start group hover:bg-[#F9FAFB] -mx-3 px-3 py-2 rounded-lg transition-colors">
                        <div className={`flex-shrink-0 w-10 h-10 ${activity.iconBg} rounded-full flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#374151]">
                            <span className="font-semibold text-[#111827]">{activity.title}</span>{' '}
                            <span className="text-[#6B7280]">{activity.description}</span>
                          </p>
                          <p className="text-xs text-[#9CA3AF] mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </p>
                        </div>
                        {activity.action && (
                          <Link
                            href={activity.actionUrl || '#'}
                            className="flex-shrink-0 px-4 py-2 text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all"
                          >
                            {activity.action}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions - Right Column */}
        <div className="space-y-4">
          {/* Report Lost Item - Primary CTA */}
          <Link
            href="/report?type=lost"
            className="flex items-center gap-4 p-5 bg-[#2563EB] rounded-xl shadow-sm hover:bg-[#1D4ED8] hover:shadow-md transition-all duration-200 group"
          >
            <div className="p-2 bg-white/20 rounded-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">Report Lost Item</p>
              <p className="text-sm text-blue-100">Start tracking your missing item</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Report Found Item - Secondary CTA */}
          <Link
            href="/report?type=found"
            className="flex items-center gap-4 p-5 bg-white border-2 border-[#E5E7EB] rounded-xl hover:border-[#10B981] hover:bg-[#ECFDF5] transition-all duration-200 group"
          >
            <div className="p-2 bg-[#ECFDF5] rounded-lg group-hover:bg-[#D1FAE5] transition-colors">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#111827]">Report Found Item</p>
              <p className="text-sm text-[#6B7280]">Help return items to owners</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#10B981] group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Browse Found Items */}
          <Link
            href="/found-items"
            className="flex items-center gap-4 p-4 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all duration-200 group"
          >
            <div className="p-2 bg-[#EFF6FF] rounded-lg group-hover:bg-[#DBEAFE] transition-colors">
              <Search className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#111827]">Browse Found Items</p>
              <p className="text-xs text-[#6B7280]">Search through items turned in</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Verification Requirements */}
          <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#9CA3AF] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#111827] text-sm">Verification Requirements</p>
                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                  To claim an item, provide specific details or photo proof during verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}