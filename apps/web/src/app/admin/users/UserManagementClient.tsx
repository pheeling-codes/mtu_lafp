'use client';

import { useState } from 'react';
import { 
  Search, 
  Shield,
  User,
  Trash2,
  GraduationCap,
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  matric_number: string | null;
  role: 'ADMIN' | 'STUDENT';
  avatar_url: string | null;
  created_at: string;
}

interface UserManagementClientProps {
  users: UserProfile[];
}

// Sanitize function to remove URL encoding
const sanitizeString = (str: string | null): string => {
  if (!str) return '';
  return decodeURIComponent(str);
};

export default function UserManagementClient({ users }: UserManagementClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: string; userName: string }>({ isOpen: false, userId: '', userName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const sanitizedName = sanitizeString(user.full_name).toLowerCase();
    const sanitizedEmail = sanitizeString(user.email).toLowerCase();
    const sanitizedMatric = sanitizeString(user.matric_number).toLowerCase();
    
    const matchesSearch = searchQuery === '' || 
      sanitizedName.includes(searchQuery.toLowerCase()) ||
      sanitizedEmail.includes(searchQuery.toLowerCase()) ||
      sanitizedMatric.includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || 
      user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Shield, label: 'Admin' };
      case 'STUDENT':
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: GraduationCap, label: 'Student' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: User, label: role };
    }
  };

  const getStatusBadge = () => {
    return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Active' };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const SkeletonRow = () => (
    <tr className="border-b border-gray-100">
      <td className="py-4 px-6"><div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2" /><div className="w-24 h-3 bg-gray-200 rounded animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-28 h-4 bg-gray-200 rounded animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-24 h-4 bg-gray-200 rounded animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-10 h-8 bg-gray-200 rounded animate-pulse" /></td>
    </tr>
  );

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${deleteModal.userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDeleteModal({ isOpen: false, userId: '', userName: '' });
        window.location.reload();
      }
    } catch (error) {
      // Handle error silently
    }
    setIsDeleting(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-2">Search, filter, and manage all registered users</p>
      </div>

      {/* Search and Filters - Inline Layout */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-20 justify-between items-center">
          {/* Search */}
          <div className="w-full md:w-[800px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or matric number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Role Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRole('all')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors border ${
                selectedRole === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedRole('STUDENT')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors border ${
                selectedRole === 'STUDENT'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setSelectedRole('ADMIN')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors border ${
                selectedRole === 'ADMIN'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>


      {/* Users Table - Fixed Header Scrollable Body */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Max Height Container - shrinks with less data */}
        <div className="max-h-[calc(100vh-280px)] overflow-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">User</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">Matric Number</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">Email</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">Role</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">Joined</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const roleBadge = getRoleBadge(user.role);
                    const statusBadge = getStatusBadge();
                    const RoleIcon = roleBadge.icon;
                    const StatusIcon = statusBadge.icon;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={sanitizeString(user.full_name)}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {sanitizeString(user.full_name).charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{sanitizeString(user.full_name)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-700 font-mono">
                            {user.matric_number ? sanitizeString(user.matric_number) : 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-700">{sanitizeString(user.email)}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${roleBadge.bg} ${roleBadge.text}`}>
                            <RoleIcon className="w-3 h-3" />
                            {roleBadge.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 items-center">
                          <span className="text-sm text-gray-600">{formatDate(user.created_at)}</span>
                        </td>
                        <td className="py-4 px-6 ">
                          <button 
                            type="button"
                            onClick={() => handleDeleteClick(user.id, sanitizeString(user.full_name))}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of {users.length} users
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModal({ isOpen: false, userId: '', userName: '' })} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
            </div>
            
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong className="text-gray-900">{deleteModal.userName}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              This will permanently delete the user and all associated items and claims. This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, userId: '', userName: '' })}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
