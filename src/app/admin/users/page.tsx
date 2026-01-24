"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useAuth } from '@/core/store/auth-context';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { fixAdminToken } from '@/utils/admin-login';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Shield,
  Mail,
  Calendar,
  Plus,
  Download,
  RefreshCw,
  Ban
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'guest' | 'host' | 'admin';
  isVerified: boolean;
  accountStatus: 'active' | 'suspended' | 'banned' | 'deactivated';
  createdAt: string;
  lastLogin?: string;
  kyc?: {
    status: 'pending' | 'verified' | 'rejected';
    documentType?: string;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Helper function to show notifications
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5 seconds
  };

  // Debug function to check authentication
  const debugAuth = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('tripme_token');
    const user = localStorage.getItem('adminData') || localStorage.getItem('tripme_user');
    console.log('Debug Auth - Token:', token ? 'Present' : 'Missing');
    console.log('Debug Auth - User:', user ? 'Present' : 'Missing');
    console.log('Debug Auth - Token value:', token);
    console.log('Debug Auth - User value:', user);
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAdminUsers();
      if (response.success) {
        setUsers(response.data.users || []);
        setFilteredUsers(response.data.users || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.accountStatus === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, roleFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: UserCheck },
      suspended: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: UserX },
      banned: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: UserX },
      deactivated: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: UserX }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      host: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      guest: { color: 'bg-slate-500/20 text-slate-500 border-slate-500/30' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.guest;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {role}
      </span>
    );
  };

  const getKYCBadge = (kyc?: any) => {
    if (!kyc) return null;
    
    const kycConfig = {
      verified: { color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30' }
    };
    
    const config = kycConfig[kyc.status as keyof typeof kycConfig] || kycConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        KYC {kyc.status}
      </span>
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;
    
    try {
      setLoading(true);
      
      switch (action) {
        case 'activate':
          // Activate all selected users
          for (const userId of selectedUsers) {
            await apiClient.updateUserStatus(userId, 'active');
          }
          showNotification('success', `Successfully activated ${selectedUsers.length} users`);
          break;
        case 'suspend':
          // Suspend all selected users
          for (const userId of selectedUsers) {
            await apiClient.updateUserStatus(userId, 'suspended');
          }
          showNotification('success', `Successfully suspended ${selectedUsers.length} users`);
          break;
        case 'ban':
          // Ban all selected users
          for (const userId of selectedUsers) {
            await apiClient.updateUserStatus(userId, 'banned');
          }
          showNotification('success', `Successfully banned ${selectedUsers.length} users`);
          break;
        case 'deactivate':
          // Deactivate all selected users
          for (const userId of selectedUsers) {
            await apiClient.updateUserStatus(userId, 'deactivated');
          }
          showNotification('success', `Successfully deactivated ${selectedUsers.length} users`);
          break;
      }
      
      // Refresh the users list
      await fetchUsers();
      
    } catch (error) {
      console.error('Error performing bulk action:', error);
      console.error('Error details:', error);
      // Show more specific error message
      const errorMessage = error?.message || error?.status || 'Unknown error';
      showNotification('error', `Error performing action: ${errorMessage}`);
    } finally {
      setLoading(false);
      setSelectedUsers([]);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      setLoading(true);
      
      switch (action) {
        case 'view':
          // Navigate to user profile page in the same tab
          router.push(`/admin/users/${userId}`);
          break;
        case 'suspend':
          if (confirm('Are you sure you want to suspend this user?')) {
            await apiClient.updateUserStatus(userId, 'suspended');
            showNotification('success', 'User suspended successfully');
            // Refresh the users list
            await fetchUsers();
          }
          break;
        case 'activate':
          await apiClient.updateUserStatus(userId, 'active');
          showNotification('success', 'User activated successfully');
          // Refresh the users list
          await fetchUsers();
          break;
        case 'ban':
          if (confirm('Are you sure you want to ban this user? This will permanently restrict their access.')) {
            await apiClient.updateUserStatus(userId, 'banned');
            showNotification('success', 'User banned successfully');
            // Refresh the users list
            await fetchUsers();
          }
          break;
        case 'deactivate':
          if (confirm('Are you sure you want to deactivate this user? They will not be able to log in.')) {
            await apiClient.updateUserStatus(userId, 'deactivated');
            showNotification('success', 'User deactivated successfully');
            // Refresh the users list
            await fetchUsers();
          }
          break;
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      console.error('Error details:', error);
      // Show more specific error message
      const errorMessage = error?.message || error?.status || 'Unknown error';
      showNotification('error', `Error performing action: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-6"></div>
            <p className="text-slate-600 text-lg">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100  p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
              notification.type === 'success' 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : notification.type === 'error'
                ? 'bg-red-100 text-red-800 border-red-200'
                : 'bg-blue-100 text-blue-800 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <span>{notification.message}</span>
                <button 
                  onClick={() => setNotification(null)}
                  className="ml-4 text-lg font-bold hover:opacity-70"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          {/* Enhanced Header */}
         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 md:p-6">
  {/* Changed to flex-col for mobile, flex-row for desktop */}
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    
    {/* Text Section */}
    <div>
      <h1 className="text-xl md:text-3xl font-bold text-slate-900">
        User Management
      </h1>
      <p className="text-xs md:text-base text-slate-600 mt-1 md:mt-2">
        Manage all platform users, hosts, and guests
      </p>
    </div>

    {/* Actions Section - Grid on mobile for equal width buttons */}
    <div className="grid grid-cols-2 md:flex items-center gap-3 md:gap-4">
      <button className="bg-white/80 hover:bg-white text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2 border border-slate-200/50 shadow-sm active:scale-95">
        <Download className="h-4 w-4" />
        <span className="text-sm">Export</span>
      </button>
      
      <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 active:scale-95">
        <Plus className="h-4 w-4" />
        <span className="text-sm">Add User</span>
      </button>
    </div>

  </div>
</div>

          {/* Stats Cards */}
         {/* grid-cols-2 makes it 2 per row on mobile, md:grid-cols-4 makes it 4 per row on desktop */}

  {/* Total Users */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
  {/* Example Card: Total Users */}
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 md:p-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      
      {/* Icon is now first in the DOM for mobile top-alignment */}
      <div className="p-2 md:p-3 rounded-xl bg-blue-100 w-fit">
        <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
      </div>

      <div className="md:text-right"> {/* Align text right on desktop for balance */}
        <p className="text-slate-600 text-[10px] md:text-sm font-bold uppercase tracking-wider">
          Total Users
        </p>
        <p className="text-xl md:text-3xl font-bold text-slate-900 mt-1">
          {users.length}
        </p>
      </div>

    </div>
  </div>

 


  {/* Active Users */}
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 md:p-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div className="p-2 md:p-3 rounded-xl bg-green-100 w-fit">
        <UserCheck className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
      </div>
      <div>
        <p className="text-slate-600 text-[10px] md:text-sm font-bold uppercase tracking-wider">Active</p>
        <p className="text-xl md:text-3xl font-bold text-slate-900 mt-1">
          {users.filter(u => u.accountStatus === 'active').length}
        </p>
      </div>
      
    </div>
  </div>

  {/* Pending KYC */}
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 md:p-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
       <div className="p-2 md:p-3 rounded-xl bg-yellow-100 w-fit">
        <Shield className="h-4 w-4 md:h-6 md:w-6 text-yellow-600" />
      </div>
      <div>
        <p className="text-slate-600 text-[10px] md:text-sm font-bold uppercase tracking-wider">Pending KYC</p>
        <p className="text-xl md:text-3xl font-bold text-slate-900 mt-1">
          {users.filter(u => u.kyc?.status === 'pending').length}
        </p>
      </div>
     
    </div>
  </div>

  {/* Hosts */}
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 md:p-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
       <div className="p-2 md:p-3 rounded-xl bg-purple-100 w-fit">
        <UserCheck className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
      </div>
      <div>
        <p className="text-slate-600 text-[10px] md:text-sm font-bold uppercase tracking-wider">Hosts</p>
        <p className="text-xl md:text-3xl font-bold text-slate-900 mt-1">
          {users.filter(u => u.role === 'host').length}
        </p>
      </div>
     
    </div>
  </div>
</div>

          {/* Filters and Search */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl bg-white/80 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-xl bg-white/80 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
                <option value="deactivated">Deactivated</option>
              </select>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-xl bg-white/80 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="all">All Roles</option>
                <option value="guest">Guest</option>
                <option value="host">Host</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setRoleFilter('all');
                }}
                className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={debugAuth}
                className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
              >
                Debug Auth
              </button>
              <button
                onClick={fixAdminToken}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Fix Token
              </button>
            </div>
          </div>
        </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-900">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors duration-200"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('suspend')}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors duration-200"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => handleBulkAction('ban')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors duration-200"
                  >
                    Ban
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced User Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
  {filteredUsers.map((user) => (
    <div 
      key={user._id} 
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-2xl transition-all duration-300 group flex flex-col"
    >
      {/* 1. Header: Avatar & Checkbox */}
      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="relative shrink-0">
          <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
            <span className="text-lg md:text-xl font-bold text-white uppercase">{user.name.charAt(0)}</span>
          </div>
          <div className="absolute -top-1 -right-1">
            <input
              type="checkbox"
              checked={selectedUsers.includes(user._id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedUsers([...selectedUsers, user._id]);
                } else {
                  setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                }
              }}
              className="w-5 h-5 rounded-lg border-slate-300 bg-white text-blue-600 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
            {user.name}
          </h3>
          <p className="text-[11px] md:text-sm text-slate-500 flex items-center mt-0.5 truncate">
            <Mail className="h-3 w-3 mr-1 shrink-0" />
            {user.email}
          </p>
        </div>
      </div>

      {/* 2. User Details: 2-column grid for mobile to save height */}
      <div className="grid grid-cols-2 gap-2 mb-6 text-[11px] md:text-sm">
        <div className="col-span-2 flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="font-medium text-slate-500">Role & Status</span>
          <div className="flex gap-1.5 scale-90 origin-right">
            {getRoleBadge(user.role)}
            {getStatusBadge(user.accountStatus)}
          </div>
        </div>
        
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">KYC</p>
          {getKYCBadge(user.kyc)}
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Joined</p>
          <span className="text-slate-700 font-semibold truncate block">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* 3. Action Buttons: Better spacing and active states */}
      <div className="mt-auto flex flex-wrap items-center gap-2">
        <button 
          onClick={() => handleUserAction(user._id, 'view')}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
        >
          <Eye className="h-4 w-4" />
          <span>Profile</span>
        </button>

        {/* Secondary Actions Row */}
        <div className="flex gap-2 w-full xs:w-auto">
          {user.accountStatus === 'active' ? (
            <button 
              onClick={() => handleUserAction(user._id, 'suspend')}
              className="flex-1 xs:flex-none p-2.5 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 active:scale-90 transition-all shadow-sm"
              title="Suspend User"
            >
              <UserX className="h-5 w-5 mx-auto" />
            </button>
          ) : user.accountStatus === 'suspended' ? (
            <button 
              onClick={() => handleUserAction(user._id, 'activate')}
              className="flex-1 xs:flex-none p-2.5 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 active:scale-90 transition-all shadow-sm"
              title="Activate User"
            >
              <UserCheck className="h-5 w-5 mx-auto" />
            </button>
          ) : null}

          <button 
            onClick={() => handleUserAction(user._id, 'ban')}
            className="flex-1 xs:flex-none p-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 active:scale-90 transition-all shadow-sm"
            title="Ban User"
          >
            <Ban className="h-5 w-5 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  ))}
</div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 md:p-12 text-center">
            <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Users Found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No users have been registered yet.'
              }
            </p>
            {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setRoleFilter('all');
                }}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-slate-900 px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50">
              Previous
            </button>
            <span className="px-3 py-2 text-slate-900">1</span>
            <button className="px-3 py-2 text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 