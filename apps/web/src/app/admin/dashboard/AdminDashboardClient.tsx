'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  Package, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  User,
  ArrowUp,
  Minus,
  PackageSearch
} from 'lucide-react';

interface DashboardStats {
  totalItems: number;
  activeCases: number;
  successfulRecoveries: number;
  recoveryRate: number;
}

interface PendingClaim {
  id: string;
  created_at: string;
  seeker: {
    full_name: string;
    avatar_url?: string;
  };
  item: {
    title: string;
  };
}

interface AdminDashboardClientProps {
  stats: DashboardStats;
  pendingClaims: PendingClaim[];
}

// Mock data for analytics chart (last 6 months)
const analyticsData = [
  { month: 'Jan', foundItems: 120, lostItems: 180 },
  { month: 'Feb', foundItems: 145, lostItems: 165 },
  { month: 'Mar', foundItems: 180, lostItems: 200 },
  { month: 'Apr', foundItems: 165, lostItems: 190 },
  { month: 'May', foundItems: 195, lostItems: 210 },
  { month: 'Jun', foundItems: 220, lostItems: 235 },
];

export default function AdminDashboardClient({ stats, pendingClaims }: AdminDashboardClientProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for skeleton states
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse" />
        <div className="w-16 h-6 bg-slate-200 rounded-full animate-pulse" />
      </div>
      <div className="w-20 h-8 bg-slate-200 rounded animate-pulse mb-2" />
      <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
    </div>
  );

  const SkeletonClaim = () => (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
      <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse" />
      <div className="flex-1">
        <div className="w-32 h-4 bg-slate-200 rounded animate-pulse mb-2" />
        <div className="w-24 h-3 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Monitor and manage the MTU Lost & Found system</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Total Items Logged */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUp className="w-3 h-3" />
                  <span>+12%</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalItems.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">Total Items Logged</p>
              <p className="text-xs text-gray-400 mt-2">+12% from last month</p>
            </div>

            {/* Active Cases */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <PackageSearch className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  <Minus className="w-3 h-3" />
                  <span>Steady</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.activeCases.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">Active Cases</p>
              <p className="text-xs text-gray-400 mt-2">Steady overall</p>
            </div>

            {/* Successful Recoveries */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  <span>{stats.recoveryRate}%</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.successfulRecoveries.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">Successful Recoveries</p>
              <p className="text-xs text-gray-400 mt-2">{stats.recoveryRate}% Recovery Rate</p>
            </div>
          </>
        )}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Items Reported (Last 6 Months)</h2>
            <p className="text-sm text-gray-500 mt-1">Found vs Lost Items trend</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="foundItems" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  name="Found Items"
                  dot={{ fill: '#2563EB', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="lostItems" 
                  stroke="#93C5FD" 
                  strokeWidth={2}
                  name="Lost Items"
                  dot={{ fill: '#93C5FD', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Claims Feed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Pending Claims</h2>
            <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded-full">
              {pendingClaims.length}
            </span>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <>
                <SkeletonClaim />
                <SkeletonClaim />
                <SkeletonClaim />
              </>
            ) : pendingClaims.length > 0 ? (
              pendingClaims.map((claim) => (
                <div 
                  key={claim.id} 
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {claim.seeker.avatar_url ? (
                    <img 
                      src={claim.seeker.avatar_url} 
                      alt={claim.seeker.full_name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {claim.seeker.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {claim.seeker.full_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {claim.item.title}
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatDate(claim.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No pending claims</p>
              </div>
            )}
          </div>
          {pendingClaims.length > 0 && (
            <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
              View All Claims
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
