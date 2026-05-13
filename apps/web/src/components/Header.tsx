'use client';

import { Search, Bell, Command } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabaseClient } from '@/utils/supabaseClient';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Get user info from cookies set at login
    const email = sanitizeUserData(getCookie('user-email'));
    const name = sanitizeUserData(getCookie('user-name'));
    if (email) setUserEmail(email);
    if (name) setUserName(name);

    // Fetch user avatar from Supabase
    const fetchUserAvatar = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user?.user_metadata?.avatar_url) {
        setUserAvatar(user.user_metadata.avatar_url);
      }
    };
    fetchUserAvatar();
  }, []);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = () => {
      const saved = localStorage.getItem('sidebar-collapsed');
      setIsSidebarCollapsed(saved === 'true');
    };

    // Initial check
    handleSidebarToggle();

    window.addEventListener('storage', handleSidebarToggle);
    window.addEventListener('sidebar-toggle', handleSidebarToggle);

    return () => {
      window.removeEventListener('storage', handleSidebarToggle);
      window.removeEventListener('sidebar-toggle', handleSidebarToggle);
    };
  }, []);

  // Sanitize URL-encoded strings
  function sanitizeUserData(value: string | null): string {
    if (!value) return '';
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return (
    <header 
      className="h-18 w-full bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-6 flex items-center justify-between sticky top-0 z-30 transition-all duration-300 ease-in-out"
      style={{ paddingLeft: isSidebarCollapsed ? '100px' : '280px', paddingRight: '40px' }}
    >
      {/* Search - Center */}
      <div className="relative w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Search items, matches, claims, locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-14 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[#9CA3AF] bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB] shadow-sm">
          <Command className="w-3 h-3" />
          <span className="font-medium">K</span>
        </div>
      </div>

      {/* Right Section - Utilities */}
      <div className="flex items-center gap-3">
        {/* Notifications with Status Ping */}
        <button className="relative p-2 text-[#6B7280] hover:text-[#374151] hover:bg-gray-100 rounded-lg transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#E5E7EB]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#111827]">{userName}</p>
            <p className="text-xs text-[#6B7280]">{userEmail || 'Student'}</p>
          </div>
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Profile" 
              className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-white"
            />
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white">
              {userName[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}