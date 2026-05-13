'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Trash2,
  Package,
  Folder,
  X
} from 'lucide-react';

interface Item {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  image_url: string | null;
  created_at: string;
  reporter_email: string | null;
  category: string;
  location: string;
}

interface Category {
  id: string;
  name: string;
}

interface InventoryManagementClientProps {
  items: Item[];
  categories: Category[];
}

// Sanitize function to remove URL encoding
const sanitizeString = (str: string): string => {
  if (!str) return '';
  return decodeURIComponent(str);
};

// Capitalize first letter of a string
const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Report Wizard categories
const REPORT_WIZARD_CATEGORIES = [
  'Electronics',
  'Keys',
  'Wallets',
  'Clothing',
  'Accessories',
  'Phones',
  'Jewelry',
  'Documents',
  'Bags',
  'Others'
];

export default function InventoryManagementClient({ items, categories }: InventoryManagementClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [archiveModal, setArchiveModal] = useState<{ isOpen: boolean; itemId: string; currentStatus: string }>({ isOpen: false, itemId: '', currentStatus: '' });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; itemId: string }>({ isOpen: false, itemId: '' });
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === '' || 
      sanitizeString(item.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      sanitizeString(item.description).toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      item.category === selectedCategory;
    
    const matchesType = selectedType === 'all' || 
      item.type === selectedType;
    
    const matchesStatus = selectedStatus === 'all' || 
      item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Active' };
      case 'claimed':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Claimed' };
      case 'archived':
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Archived' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const SkeletonRow = () => (
    <tr className="border-b border-gray-100">
      <td className="py-4 px-6"><div className="w-16 h-4 bg-gray-200 rounded animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-32 h-12 bg-gray-200 rounded animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-20 h-4 bg-gray-200 rounded animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-24 h-4 bg-gray-200 rounded animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-20 h-4 bg-gray-200 rounded animate-pulse" /></td>
      <td className="py-4 px-6"><div className="w-20 h-8 bg-gray-200 rounded animate-pulse" /></td>
    </tr>
  );

  const confirmArchive = async () => {
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/admin/items/${archiveModal.itemId}/archive`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setArchiveModal({ isOpen: false, itemId: '', currentStatus: '' });
        router.refresh();
      }
    } catch (error) {
      // Handle error silently
    }
    setIsActionLoading(false);
  };

  const confirmDelete = async () => {
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/admin/items/${deleteModal.itemId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDeleteModal({ isOpen: false, itemId: '' });
        router.refresh();
      }
    } catch (error) {
      // Handle error silently
    }
    setIsActionLoading(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Master Inventory</h1>
        <p className="text-gray-500 mt-2">Search, filter, and manage all reported items</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Search */}
          <div className="w-200 mr-20 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, description, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {REPORT_WIZARD_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex-1">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="claimed">Claimed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Max Height Container - shrinks with less data */}
        <div className="max-h-[calc(100vh-280px)] overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item ID</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name/Details</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reporter Email</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No items found</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const statusBadge = getStatusBadge(item.status);
                  const truncateDescription = (desc: string) => {
                    if (!desc) return 'No description for this product';
                    return sanitizeString(desc).length > 50 
                      ? sanitizeString(desc).substring(0, 50) + '...' 
                      : sanitizeString(desc);
                  };
                  
                  const handleArchive = () => {
                    setArchiveModal({ isOpen: true, itemId: item.id, currentStatus: item.status });
                  };

                  const handleDelete = () => {
                    setDeleteModal({ isOpen: true, itemId: item.id });
                  };

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-sm font-mono text-gray-600">#{item.id.slice(0, 8)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={sanitizeString(item.title)}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{sanitizeString(item.title)}</p>
                            <p className="text-sm text-gray-500">{truncateDescription(item.description)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-700">{capitalizeFirst(item.category) || 'Uncategorized'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {item.type === 'lost' ? 'Lost' : 'Found'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-700">{item.reporter_email ? decodeURIComponent(item.reporter_email) : 'Unknown'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-700">{capitalizeFirst(item.location) || 'Unknown'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={handleArchive}
                            className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" 
                            title={item.status === 'archived' ? 'Unarchive' : 'Archive'}
                          >
                            <Folder className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={handleDelete}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
          Showing <span className="font-semibold text-gray-900">{filteredItems.length}</span> of {items.length} items
        </p>
      </div>

      {/* Archive/Unarchive Modal */}
      {archiveModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {archiveModal.currentStatus === 'archived' ? 'Unarchive Item?' : 'Archive Item?'}
            </h2>
            <p className="text-gray-600 mb-6">
              {archiveModal.currentStatus === 'archived' 
                ? 'This will restore the item\'s visibility to students on the Lost/Found ledgers.'
                : 'This will remove the item from all student views but keep it in the admin database.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setArchiveModal({ isOpen: false, itemId: '', currentStatus: '' })}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isActionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmArchive}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isActionLoading}
              >
                {isActionLoading ? 'Processing...' : (archiveModal.currentStatus === 'archived' ? 'Unarchive' : 'Archive')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Permanently Delete Item?
            </h2>
            <p className="text-gray-600 mb-6">
              This action is irreversible. All records and associated claims for this item will be destroyed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, itemId: '' })}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isActionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isActionLoading}
              >
                {isActionLoading ? 'Processing...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
