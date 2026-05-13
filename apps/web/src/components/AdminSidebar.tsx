'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PackageSearch,
  FileCheck,
  Users,
  Shield,
  LogOut,
  ChevronLeft,
  Package
} from 'lucide-react';
import LogoutModal from './LogoutModal';
import { supabaseClient } from '@/utils/supabaseClient';

// Admin navigation items
const adminMenuItems = [
  { name: 'Admin Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/admin/inventory', icon: PackageSearch },
  { name: 'Claim Reviews', href: '/admin/claims', icon: FileCheck },
  { name: 'Users', href: '/admin/users', icon: Users },
];

// Cookie helper for user data
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Sanitize URL-encoded strings
function sanitizeUserData(value: string | null): string {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  // const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);
  const [userData, setUserData] = useState({
    name: 'User Name ',
    role: 'Admin',
    avatar: ''
  });

  // Expose collapse state to parent via CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '280px');
  }, [isCollapsed]);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Load user data
  useEffect(() => {
    const name = sanitizeUserData(getCookie('user-name')) || 'Officer Davis';
    const email = sanitizeUserData(getCookie('user-email')) || '';
    const avatar = sanitizeUserData(getCookie('user-avatar')) || '';
    setUserData({ name, role: 'Admin Role', avatar });
  }, []);

  // Fetch pending claims count for badge
  // TODO: Re-enable when endpoint is fixed
  // useEffect(() => {
  //   const fetchPendingClaims = async () => {
  //     try {
  //       const response = await fetch('/api/admin/pending-claims-count');
  //       if (!response.ok) {
  //         console.error('Failed to fetch pending claims count:', response.status);
  //         return;
  //       }
  //       const { data, error } = await response.json();
  //       if (!error && data !== undefined) {
  //         setPendingClaimsCount(data.count || 0);
  //       }
  //     } catch (err) {
  //       console.error('Error fetching pending claims count:', err);
  //     }
  //   };
    
  //   fetchPendingClaims();
  // }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    
    try {
      // Sign out from Supabase
      await supabaseClient.auth.signOut({ scope: 'global' });
      
      // Clear all auth cookies
      const cookiesToClear = [
        'sb-access-token',
        'sb-refresh-token', 
        'sb-provider-token',
        'user-name',
        'user-email',
        'user-avatar',
        'user-role'
      ];
      
      cookiesToClear.forEach(name => {
        document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
      });
      
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if sign out fails
      router.push('/login');
    }
  };

  return (
    <>
      <aside 
        className={`h-screen bg-white border-r border-[#E5E7EB] flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[80px]' : 'w-[280px]'
        }`}
      >
        {/* Logo - Admin Brand */}
        <div className="h-20 px-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <Link href="/admin/dashboard" className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-gray-900 text-lg">MTU Portal</h1>
                <p className="text-xs font-bold text-[#6B7280] tracking-wide">ADMIN</p>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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

        {/* Navigation */}
        <nav className={`flex-1 py-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <ul className="space-y-1.5">
            {/* ADMINISTRATION Header */}
            {!isCollapsed && (
              <li className="px-4 mb-4">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  Administration
                </p>
              </li>
            )}

            {adminMenuItems.map((item) => {
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
                        {item.name === 'Claim Reviews' && pendingClaimsCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                            {pendingClaimsCount}
                          </span>
                        )}
                      </>
                    )}
                    {isCollapsed && item.name === 'Claim Reviews' && pendingClaimsCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Admin Profile Slot - Fixed Bottom */}
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
                    {userData.role}
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
