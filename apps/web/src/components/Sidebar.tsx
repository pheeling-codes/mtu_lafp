'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  CheckCircle, 
  Sparkles, 
  FileText,
  User,
  Shield,
  LogOut,
  PackageSearch,
  ChevronLeft,
  Settings
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import LogoutModal from './LogoutModal';
import { supabaseClient } from '@/utils/supabaseClient';

// Revised navigation order: Dashboard, Report Item, Lost Items, Found Items, Matches, My Claims, Profile
const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Report Item', href: '/report', icon: PlusCircle },
  { name: 'Lost Items', href: '/lost-items', icon: Search },
  { name: 'Found Items', href: '/found-items', icon: CheckCircle },
  { name: 'Matches', href: '/matches', icon: Sparkles },
  { name: 'My Claims', href: '/my-claims', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

// Cookie helper for user data
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

export default function Sidebar() {
  const pathname = usePathname();
  const { role, logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [userData, setUserData] = useState({
    name: 'User',
    email: '',
    avatar: ''
  });

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Load and sanitize user data from cookies on mount
  useEffect(() => {
    const name = sanitizeUserData(getCookie('user-name')) || 'User';
    const email = sanitizeUserData(getCookie('user-email')) || '';
    const avatar = sanitizeUserData(getCookie('user-avatar')) || '';
    setUserData({ name, email, avatar });

    // Fetch user avatar from Supabase
    const fetchUserAvatar = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user?.user_metadata?.avatar_url) {
        setUserData(prev => ({ ...prev, avatar: user.user_metadata.avatar_url }));
      }
    };
    fetchUserAvatar();
  }, []);

  // Fetch match count for badge
  useEffect(() => {
    if (!user) return;
    
    const fetchMatchCount = async () => {
      const { data, error } = await supabaseClient
        .from('matches')
        .select(`
          id,
          lost_item:items!matches_lost_item_id_fkey(reporter_id)
        `)
        .eq('lost_item.reporter_id', user.id)
        .eq('status', 'pending');
      
      if (!error && data) {
        setMatchCount(data.length);
      }
    };
    
    fetchMatchCount();
    
    // Subscribe to changes - refetch on any match change
    const channel = supabaseClient
      .channel('sidebar_matches')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matches'
      }, () => {
        fetchMatchCount();
      })
      .subscribe();
    
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [user]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Dispatch custom event for same-tab communication
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: newState } }));
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <>
      <aside 
        className={`h-screen bg-white border-r border-[#E5E7EB] flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[80px]' : 'w-[260px]'
        }`}
      >
        {/* Logo - Modern Brand Icon with Toggle */}
        <div className="h-20 px-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <Link href="/dashboard" className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <PackageSearch className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-gray-900 text-lg">MTU Portal</h1>
                <p className="text-xs font-bold text-[#6B7280] tracking-wide">LAFP</p>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="absolute top-13 right-1 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="absolute top-16 -right-3 p-1.5 bg-white border border-[#E5E7EB] text-gray-400 hover:text-gray-600 rounded-full shadow-sm transition-colors"
            title="Expand sidebar"
          >
            <ChevronLeft className="w-3 h-3 rotate-180" />
          </button>
        )}

      {/* Navigation - No MENU heading, increased spacing */}
      <nav className={`flex-1 py-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                    isCollapsed 
                      ? 'justify-center px-2 py-3' 
                      : 'gap-3 px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                      : 'text-[#374151] hover:bg-[#F3F4F6] hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#6B7280]'}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.name === 'Matches' && matchCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                          {matchCount}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#2563EB] rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Admin Section - Only if role is admin */}
        {role === 'admin' && !isCollapsed && (
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3 px-4">
              Administration
            </p>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] hover:text-gray-900 transition-all duration-200"
            >
              <Shield className="w-5 h-5 text-[#6B7280]" />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
        {role === 'admin' && isCollapsed && (
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <Link
              href="/admin/dashboard"
              className="flex justify-center items-center px-2 py-3 rounded-xl text-[#374151] hover:bg-[#F3F4F6] transition-all duration-200"
              title="Admin Panel"
            >
              <Shield className="w-5 h-5 text-[#6B7280]" />
            </Link>
          </div>
        )}
      </nav>

      {/* User Profile - Real data from cookies */}
      <div className={`p-4 border-t border-[#E5E7EB] ${isCollapsed ? 'px-2' : ''}`}>
        <div className={`flex items-center rounded-xl hover:bg-[#F3F4F6] transition-all duration-200 ${
          isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-3'
        }`}>
          {userData.avatar ? (
            <img 
              src={userData.avatar} 
              alt={userData.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white flex-shrink-0">
              {userData.name[0].toUpperCase()}
            </div>
          )}
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userData.name}
                </p>
                <p className="text-xs text-[#6B7280] truncate">
                  {userData.email || 'Student'}
                </p>
              </div>
              <button 
                onClick={handleLogoutClick}
                className="p-2 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
          {isCollapsed && (
            <button 
              onClick={handleLogoutClick}
              className="p-2 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>

    {/* Logout Confirmation Modal */}
    <LogoutModal
      isOpen={isLogoutModalOpen}
      onClose={() => setIsLogoutModalOpen(false)}
      onConfirm={handleConfirmLogout}
    />
  </>
  );
}