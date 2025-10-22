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
  MessageSquare, Trophy, Calendar, Mail, RefreshCw
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
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="border-rose-200 bg-rose-50">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-rose-900 mb-1">Error loading users</p>
                  <p className="text-rose-700 text-sm">{(error as Error).message}</p>
                </div>
                <Button onClick={refetch} size="sm" className="bg-gray-900 text-white">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const totalUsers = meta?.total || users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const bannedUsers = users.filter(u => !u.is_active).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const verifiedCount = users.filter(u => u.is_email_verified).length;

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-500 text-sm">Manage platform users and permissions</p>
            </div>
          </div>
          <Button variant="outline" onClick={refetch} className="border-gray-200">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <Card className="border border-gray-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">{activeUsers || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Banned</p>
                <p className="text-3xl font-bold text-rose-600">{bannedUsers || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Admins</p>
                <p className="text-3xl font-bold text-purple-600">{adminCount || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Verified</p>
                <p className="text-3xl font-bold text-blue-600">{verifiedCount || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Card */}
        <Card className="border border-gray-100 mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Filters & Search</CardTitle>
            <CardDescription>Filter users by role, status, or search</CardDescription>
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
                  className="pl-10 border-gray-200"
                />
              </div>

              {/* Role Filter */}
              <Select 
                value={params.role || "all"} 
                onValueChange={(role) => setParams({ ...params, role: role === "all" ? "" : role, page: 1 })}
              >
                <SelectTrigger className="border-gray-200">
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
                <SelectTrigger className="border-gray-200">
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
                <SelectTrigger className="border-gray-200">
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
        <Card className="border border-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">All Users</CardTitle>
                <CardDescription>
                  Showing {users.length} of {totalUsers} users
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-2">No users found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div 
                    key={user.user_id} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 transition-colors ${
                      !user.is_active 
                        ? 'border-rose-200 bg-rose-50' 
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* User Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {user.username}
                          </p>
                          {user.is_email_verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          )}
                          {!user.is_active && (
                            <Lock className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Mail className="w-3 h-3" />
                          <p className="truncate">{user.email}</p>
                        </div>
                        
                        {/* User Stats */}
                        {user._count && (
                          <div className="flex items-center gap-4 text-xs text-gray-400">
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
                          variant="secondary" 
                          className={`text-xs ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700 border-purple-200' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {user.role}
                        </Badge>
                        
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            user.is_active 
                              ? "bg-green-100 text-green-700 border-green-200" 
                              : "bg-rose-100 text-rose-700 border-rose-200"
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
                          className="border-gray-200 text-blue-600 hover:bg-blue-50 h-9 w-9 p-0"
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
                          className={`border-gray-200 h-9 w-9 p-0 ${
                            !user.is_active 
                              ? 'text-green-600 hover:bg-green-50' 
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
                          className="border-gray-200 text-purple-600 hover:bg-purple-50 h-9 w-9 p-0"
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
                          className="border-gray-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-9 w-9 p-0"
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
            {meta && meta.lastPage > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Page {meta.page} of {meta.lastPage} • Total: {meta.total} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page === 1}
                    onClick={() => setParams({ ...params, page: meta.page - 1 })}
                    className="border-gray-200"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page >= meta.lastPage}
                    onClick={() => setParams({ ...params, page: meta.page + 1 })}
                    className="border-gray-200"
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
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View detailed information about {selectedUser?.username}
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Username</p>
                    <p className="font-medium">{selectedUser.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Role</p>
                    <Badge variant="secondary" className={
                      selectedUser.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                    }>
                      {selectedUser.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <Badge variant="secondary" className={
                      selectedUser.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-rose-100 text-rose-700'
                    }>
                      {selectedUser.is_active ? 'Active' : 'Banned'}
                    </Badge>
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h3 className="font-semibold mb-3">Activity Statistics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Posts</p>
                      <p className="text-xl font-bold">{selectedUser._count?.posts || 0}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Comments</p>
                      <p className="text-xl font-bold">{selectedUser._count?.comments || 0}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Challenges</p>
                      <p className="text-xl font-bold">{selectedUser._count?.userChallenges || 0}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Points</p>
                      <p className="text-xl font-bold">{selectedUser.profile?.points || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div>
                  <h3 className="font-semibold mb-3">Account Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email Verified:</span>
                      <span className={selectedUser.is_email_verified ? 'text-green-600' : 'text-rose-600'}>
                        {selectedUser.is_email_verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Member Since:</span>
                      <span>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-rose-600">⚠️ Permanent Delete</DialogTitle>
              <DialogDescription>
                This action cannot be undone and will permanently delete the user account.
              </DialogDescription>
            </DialogHeader>
            
            {userToDelete && (
              <div className="space-y-4">
                <Alert variant="destructive" className="bg-rose-50 border-rose-200">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <AlertDescription className="text-rose-900">
                    <p className="font-medium mb-2">You are about to delete:</p>
                    <p className="font-bold">{userToDelete.username} ({userToDelete.email})</p>
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-medium text-gray-900">This will:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Soft delete all their posts and comments</li>
                    <li>Soft delete all their craft ideas</li>
                    <li>Soft delete all their challenge submissions</li>
                    <li>Remove all their refresh tokens (force logout)</li>
                    <li>Mark their account as permanently deleted</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">DELETE</span> to confirm:
                  </label>
                  <Input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE"
                    className="border-gray-200"
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
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting || deleteConfirmation !== 'DELETE'}
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