export default function AdminDashboardLoading() {
  return (
    <div className="p-8 max-w-7xl mx-auto pt-20">
      <div className="flex items-center justify-between mb-8 animate-pulse">
        <div>
          <div className="h-8 w-64 bg-slate-200/80 rounded-xl mb-3"></div>
          <div className="h-4 w-48 bg-slate-200/60 rounded-xl"></div>
        </div>
        <div className="h-11 w-36 bg-slate-200/80 rounded-xl"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/80 shadow-sm animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-200/80"></div>
            </div>
            <div className="h-10 w-16 bg-slate-200/80 rounded-xl mb-2"></div>
            <div className="h-4 w-28 bg-slate-200/60 rounded-xl"></div>
          </div>
        ))}
      </div>
      
      <div className="h-80 w-full bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm p-6 animate-pulse">
         <div className="h-6 w-48 bg-slate-200/80 rounded-xl mb-6"></div>
         <div className="space-y-4">
           {[1, 2, 3, 4, 5].map((i) => (
             <div key={i} className="h-12 w-full bg-slate-200/40 rounded-xl"></div>
           ))}
         </div>
      </div>
    </div>
  );
}
