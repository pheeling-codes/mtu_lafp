'use client';

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="relative">
        {/* Outer ring */}
        <div
          className="w-24 h-24 rounded-full border-4 border-blue-100 animate-spin"
          style={{ animationDuration: '3s' }}
        />
        
        {/* Inner spinning gradient */}
        <div
          className="absolute inset-0 w-24 h-24 rounded-full border-4 border-t-[#2563EB] border-r-transparent border-b-[#3B82F6] border-l-transparent animate-spin"
          style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
        />
        
        {/* Center pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-lg shadow-lg animate-pulse" />
        </div>
      </div>
      
      {/* Text */}
      <p className="absolute mt-32 text-slate-400 font-medium tracking-wide animate-pulse">
        Loading...
      </p>
    </div>
  );
}

// Dashboard-specific skeleton
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse" />
            <div className="w-48 h-6 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-10 bg-slate-200 rounded-xl animate-pulse" />
            <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse" />
                <div className="w-16 h-8 bg-slate-200 rounded-lg animate-pulse" />
              </div>
              <div className="mt-4 w-24 h-4 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Recent activity skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="w-40 h-6 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse" />
                <div className="flex-1">
                  <div className="w-48 h-5 bg-slate-200 rounded-lg animate-pulse mb-2" />
                  <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="w-20 h-8 bg-slate-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
