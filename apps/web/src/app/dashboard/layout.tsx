'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Listen for sidebar state changes via custom event
  useEffect(() => {
    const handleSidebarToggle = () => {
      const saved = localStorage.getItem('sidebar-collapsed');
      setIsSidebarCollapsed(saved === 'true');
    };

    // Initial check
    handleSidebarToggle();

    // Listen for storage changes (from Sidebar component)
    window.addEventListener('storage', handleSidebarToggle);
    
    // Custom event for same-tab communication
    window.addEventListener('sidebar-toggle', handleSidebarToggle);

    return () => {
      window.removeEventListener('storage', handleSidebarToggle);
      window.removeEventListener('sidebar-toggle', handleSidebarToggle);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <div 
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
        style={{ marginLeft: isSidebarCollapsed ? '80px' : '260px' }}
      >
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}