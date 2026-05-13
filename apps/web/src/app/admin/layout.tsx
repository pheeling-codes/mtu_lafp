import { ReactNode } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="pt-6 px-8 transition-all duration-300" style={{ marginLeft: 'var(--sidebar-width, 280px)' }}>
        {children}
      </main>
    </div>
  );
}
