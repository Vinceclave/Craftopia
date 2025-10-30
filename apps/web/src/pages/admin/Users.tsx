// apps/web/src/pages/admin/Users.tsx - COMPLETE VERSION

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Users, Search, Ban, UserCog, Trash2, Shield, CheckCircle, 
  Loader2, Lock, Unlock, AlertCircle, Eye, FileText,
  MessageSquare, Trophy, Calendar, Mail, RefreshCw,
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminUsers() {
  const { 
    users, meta, isLoading, error, params, setParams, 
    refetch, toggleStatus, updateRole, deleteUser,
    isToggling, isUpdating, isDeleting
  } = useUsers();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, search: e.target.value, page: 1 });
  };

  // ✅ Ban/Unban user (toggle is_active)
  const handleToggleStatus = async (user: any) => {
    const action = user.is_active ? 'ban' : 'unban';
    if (!window.confirm(`Are you sure you want to ${action} ${user.username}?`)) return;
    
    try {
      await toggleStatus(user.user_id);
      alert(`User ${action}ned successfully!`);
      refetch();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  // ✅ Change user role
  const handleRoleChange = async (user: any) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${user.username}'s role to ${newRole}?`)) return;
    
    try {
      await updateRole({ userId: user.user_id, role: newRole });
      alert(`Role updated to ${newRole} successfully!`);
      refetch();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  // ✅ Open delete dialog
  const handleOpenDeleteDialog = (user: any) => {
    setUserToDelete(user);
    setDeleteConfirmation('');
    setDeleteDialogOpen(true);
  };

  // ✅ Confirm delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type "DELETE" to confirm');
      return;
    }
    
    try {
      await deleteUser(userToDelete.user_id);
      alert('User permanently deleted successfully!');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setDeleteConfirmation('');
      refetch();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  // ✅ View user details
  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-white p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#6CAC73] mx-auto mb-4" />
          <p className="text-[#2B4A2F] font-poppins">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 text-[#6CAC73]" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#2B4A2F] font-poppins mb-1">Error loading users</p>
                  <p className="text-gray-600 text-sm font-nunito">{(error as Error).message}</p>
                </div>
                <Button 
                  onClick={() => refetch()} 
                  className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const metaSafe = (meta && 'page' in meta)
  ? meta as { total: number; page: number; lastPage: number; limit: number }
  : { total: 0, page: 1, lastPage: 1, limit: 10 };
  const totalUsers = metaSafe.total || users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const bannedUsers = users.filter(u => !u.is_active).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const verifiedCount = users.filter(u => u.is_email_verified).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-4 sm:p-6 relative">
      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#6CAC73] rounded-full opacity-20 animate-float"
            style={{
              left: `${20 + i * 25}%`,
              top: `${10 + (i % 2) * 20}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2B4A2F] font-poppins">User Management</h1>
              <p className="text-gray-600 text-sm font-nunito">Manage platform users and permissions</p>
            </div>
          </div>
          <Button 
            onClick={() => {refetch()}} 
            className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0 shadow-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1 font-nunito">Total Users</p>
                <p className="text-3xl font-bold text-[#2B4A2F] font-poppins">{totalUsers || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1 font-nunito">Active</p>
                <p className="text-3xl font-bold text-[#6CAC73] font-poppins">{activeUsers || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1 font-nunito">Banned</p>
                <p className="text-3xl font-bold text-rose-500 font-poppins">{bannedUsers || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1 font-nunito">Admins</p>
                <p className="text-3xl font-bold text-purple-500 font-poppins">{adminCount || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1 font-nunito">Verified</p>
                <p className="text-3xl font-bold text-blue-500 font-poppins">{verifiedCount || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Card */}
        <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">Filters & Search</CardTitle>
            <CardDescription className="font-nunito">Filter users by role, status, or search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={params.search}
                  onChange={handleSearch}
                  className="pl-10 border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10 bg-white/50"
                />
              </div>

              {/* Role Filter */}
              <Select 
                value={params.role || "all"} 
                onValueChange={(role) => setParams({ ...params, role: role === "all" ? "" : role, page: 1 })}
              >
                <SelectTrigger className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10 bg-white/50">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select 
                value={params.isActive || "all"} 
                onValueChange={(isActive) => setParams({ ...params, isActive: isActive === "all" ? "" : isActive, page: 1 })}
              >
                <SelectTrigger className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10 bg-white/50">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Banned</SelectItem>
                </SelectContent>
              </Select>

              {/* Verification Filter */}
              <Select 
                value={params.isVerified || "all"} 
                onValueChange={(isVerified) => setParams({ ...params, isVerified: isVerified === "all" ? "" : isVerified, page: 1 })}
              >
                <SelectTrigger className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10 bg-white/50">
                  <SelectValue placeholder="Verification Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List Card */}
        <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">All Users</CardTitle>
                <CardDescription className="font-nunito">
                  Showing {users.length} of {totalUsers} users
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-2 font-poppins">No users found</p>
                <p className="text-gray-400 text-sm font-nunito">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div 
                    key={user.user_id} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 transition-colors bg-white/60 backdrop-blur-sm ${
                      !user.is_active 
                        ? 'border-rose-200 bg-rose-50/50' 
                        : 'border-[#6CAC73]/20 hover:bg-white/80'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 shadow-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* User Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-[#2B4A2F] font-poppins truncate">
                            {user.username}
                          </p>
                          {user.is_email_verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          )}
                          {!user.is_active && (
                            <Lock className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-nunito mb-2">
                          <Mail className="w-3 h-3" />
                          <p className="truncate">{user.email}</p>
                        </div>
                        
                        {/* User Stats */}
                        {user._count && (
                          <div className="flex items-center gap-4 text-xs text-gray-400 font-nunito">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {user._count.posts} posts
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {user._count.comments} comments
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              {user.profile?.points || 0} pts
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badges & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`text-xs border-0 font-poppins ${
                            user.role === 'admin' 
                              ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-700' 
                              : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700'
                          }`}
                        >
                          {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {user.role}
                        </Badge>
                        
                        <Badge 
                          className={`text-xs border-0 font-poppins ${
                            user.is_active 
                              ? "bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/20 text-[#2B4A2F]" 
                              : "bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-700"
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <Unlock className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 mr-1" />
                              Banned
                            </>
                          )}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {/* View Details */}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewDetails(user)}
                          className="border-[#6CAC73]/20 text-blue-600 hover:bg-blue-50 h-9 w-9 p-0"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Ban/Unban */}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleToggleStatus(user)} 
                          disabled={isToggling}
                          className={`border-[#6CAC73]/20 h-9 w-9 p-0 ${
                            !user.is_active 
                              ? 'text-[#6CAC73] hover:bg-[#6CAC73]/10' 
                              : 'text-orange-600 hover:bg-orange-50'
                          }`}
                          title={user.is_active ? 'Ban User' : 'Unban User'}
                        >
                          {user.is_active ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </Button>

                        {/* Change Role */}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRoleChange(user)}
                          disabled={isUpdating}
                          className="border-[#6CAC73]/20 text-purple-600 hover:bg-purple-50 h-9 w-9 p-0"
                          title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                        >
                          <UserCog className="w-4 h-4" />
                        </Button>

                        {/* Delete */}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenDeleteDialog(user)}
                          disabled={isDeleting}
                          className="border-[#6CAC73]/20 text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-9 w-9 p-0"
                          title="Permanently Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {metaSafe.lastPage > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-[#6CAC73]/20">
                <div className="text-sm text-gray-500 font-nunito">
                  Page {metaSafe.page} of {metaSafe.lastPage} • Total: {metaSafe.total} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={metaSafe.page === 1}
                    onClick={() => setParams({ ...params, page: metaSafe.page - 1 })}
                    className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={metaSafe.page >= metaSafe.lastPage}
                    onClick={() => setParams({ ...params, page: metaSafe.page + 1 })}
                    className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-[#2B4A2F] font-poppins">User Details</DialogTitle>
              <DialogDescription className="font-nunito">
                View detailed information about {selectedUser?.username}
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1 font-nunito">Username</p>
                    <p className="font-medium text-[#2B4A2F] font-poppins">{selectedUser.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1 font-nunito">Email</p>
                    <p className="font-medium text-[#2B4A2F] font-poppins">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1 font-nunito">Role</p>
                    <Badge className={
                      selectedUser.role === 'admin' 
                        ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-700 border-0' 
                        : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700 border-0'
                    }>
                      {selectedUser.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1 font-nunito">Status</p>
                    <Badge className={
                      selectedUser.is_active 
                        ? 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/20 text-[#2B4A2F] border-0' 
                        : 'bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-700 border-0'
                    }>
                      {selectedUser.is_active ? 'Active' : 'Banned'}
                    </Badge>
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h3 className="font-semibold mb-3 text-[#2B4A2F] font-poppins">Activity Statistics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10">
                      <p className="text-sm text-gray-500 mb-1 font-nunito">Posts</p>
                      <p className="text-xl font-bold text-[#2B4A2F] font-poppins">{selectedUser._count?.posts || 0}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10">
                      <p className="text-sm text-gray-500 mb-1 font-nunito">Comments</p>
                      <p className="text-xl font-bold text-[#2B4A2F] font-poppins">{selectedUser._count?.comments || 0}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10">
                      <p className="text-sm text-gray-500 mb-1 font-nunito">Challenges</p>
                      <p className="text-xl font-bold text-[#2B4A2F] font-poppins">{selectedUser._count?.userChallenges || 0}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10">
                      <p className="text-sm text-gray-500 mb-1 font-nunito">Points</p>
                      <p className="text-xl font-bold text-[#2B4A2F] font-poppins">{selectedUser.profile?.points || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div>
                  <h3 className="font-semibold mb-3 text-[#2B4A2F] font-poppins">Account Information</h3>
                  <div className="space-y-2 text-sm font-nunito">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email Verified:</span>
                      <span className={selectedUser.is_email_verified ? 'text-[#6CAC73]' : 'text-rose-500'}>
                        {selectedUser.is_email_verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Member Since:</span>
                      <span className="text-[#2B4A2F]">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-rose-600 font-poppins">⚠️ Permanent Delete</DialogTitle>
              <DialogDescription className="font-nunito">
                This action cannot be undone and will permanently delete the user account.
              </DialogDescription>
            </DialogHeader>
            
            {userToDelete && (
              <div className="space-y-4">
                <Alert className="bg-rose-50/80 border-rose-200 backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <AlertDescription className="text-rose-900 font-nunito">
                    <p className="font-medium mb-2">You are about to delete:</p>
                    <p className="font-bold">{userToDelete.username} ({userToDelete.email})</p>
                  </AlertDescription>
                </Alert>

                <div className="bg-gradient-to-br from-[#FFF9F0] to-white p-4 rounded-xl border border-[#6CAC73]/10 space-y-2 text-sm font-nunito">
                  <p className="font-medium text-[#2B4A2F]">This will:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Soft delete all their posts and comments</li>
                    <li>Soft delete all their craft ideas</li>
                    <li>Soft delete all their challenge submissions</li>
                    <li>Remove all their refresh tokens (force logout)</li>
                    <li>Mark their account as permanently deleted</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2B4A2F] font-poppins mb-2">
                    Type <span className="font-mono bg-[#6CAC73]/10 px-2 py-1 rounded text-[#2B4A2F]">DELETE</span> to confirm:
                  </label>
                  <Input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE"
                    className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeleteConfirmation('');
                  setUserToDelete(null);
                }}
                disabled={isDeleting}
                className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 border-0"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Permanently
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}