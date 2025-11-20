import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
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

const UserSkeleton = () => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 bg-white/60 backdrop-blur-sm border-[#6CAC73]/20">
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-16" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  </div>
);

export default function AdminUsers() {
  const { 
    users, meta, isLoading, error, params, setParams, 
    refetch, toggleStatus, updateRole, deleteUser,
    isToggling, isUpdating, isDeleting
  } = useUsers();

  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Ban/Unban confirmation modal
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [userToBan, setUserToBan] = useState<any>(null);
  
  // Role change confirmation modal
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState<any>(null);

  React.useEffect(() => {
    if (!isLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, search: e.target.value, page: 1 });
  };

  const handleOpenBanDialog = (user: any) => {
    setUserToBan(user);
    setBanDialogOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!userToBan) return;
    
    const action = userToBan.is_active ? 'banned' : 'unbanned';
    
    try {
      await toggleStatus(userToBan.user_id);
      toast({
        title: "Success",
        description: `${userToBan.username} has been ${action} successfully.`,
        variant: "default",
      });
      setBanDialogOpen(false);
      setUserToBan(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action.replace('ned', '')} user.`,
        variant: "destructive",
      });
    }
  };

  const handleOpenRoleDialog = (user: any) => {
    setUserToChangeRole(user);
    setRoleDialogOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!userToChangeRole) return;
    
    const newRole = userToChangeRole.role === 'admin' ? 'user' : 'admin';
    
    try {
      await updateRole({ userId: userToChangeRole.user_id, role: newRole });
      toast({
        title: "Success",
        description: `${userToChangeRole.username}'s role has been changed to ${newRole}.`,
        variant: "default",
      });
      setRoleDialogOpen(false);
      setUserToChangeRole(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const handleOpenDeleteDialog = (user: any) => {
    setUserToDelete(user);
    setDeleteConfirmation('');
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    if (deleteConfirmation !== 'DELETE') {
      toast({
        title: "Confirmation Required",
        description: 'Please type "DELETE" to confirm this action.',
        variant: "destructive",
      });
      return;
    }
    
    try {
      await deleteUser(userToDelete.user_id);
      toast({
        title: "User Deleted",
        description: `${userToDelete.username} has been permanently deleted.`,
        variant: "default",
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setDeleteConfirmation('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  // Show full page loading only on initial load
  if (isLoading && isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-white p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#6CAC73] mx-auto mb-4" />
          <p className="text-[#2B4A2F] font-poppins">Loading users...</p>
        </div>
      </div>
    );
  }

  const metaSafe = (meta && 'page' in meta)
    ? meta as { total: number; page: number; lastPage: number; limit: number }
    : { total: users.length, page: 1, lastPage: 1, limit: users.length };
  
  const totalUsers = metaSafe.total;
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
            onClick={() => refetch()} 
            disabled={isLoading}
            className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0 shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm mb-6">
            <AlertCircle className="h-5 w-5 text-rose-500" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#2B4A2F] font-poppins mb-1">Error loading users</p>
                  <p className="text-gray-600 text-sm font-nunito">{(error as Error).message}</p>
                </div>
                <Button 
                  onClick={() => refetch()} 
                  size="sm"
                  className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1 font-nunito">Total Users</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16 mx-auto" />
                ) : (
                  <p className="text-3xl font-bold text-[#2B4A2F] font-poppins">{totalUsers}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1 font-nunito">Active</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16 mx-auto" />
                ) : (
                  <p className="text-3xl font-bold text-[#6CAC73] font-poppins">{activeUsers}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1 font-nunito">Banned</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16 mx-auto" />
                ) : (
                  <p className="text-3xl font-bold text-rose-500 font-poppins">{bannedUsers}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1 font-nunito">Admins</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16 mx-auto" />
                ) : (
                  <p className="text-3xl font-bold text-purple-500 font-poppins">{adminCount}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1 font-nunito">Verified</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16 mx-auto" />
                ) : (
                  <p className="text-3xl font-bold text-blue-500 font-poppins">{verifiedCount}</p>
                )}
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
                  disabled={isLoading}
                  className="pl-10 border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10 bg-white/50"
                />
              </div>

              {/* Role Filter */}
              <Select 
                value={params.role || "all"} 
                onValueChange={(role) => setParams({ ...params, role: role === "all" ? "" : role, page: 1 })}
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                  {isLoading ? (
                    <Skeleton className="h-4 w-32 mt-1" />
                  ) : (
                    `Showing ${users.length} of ${totalUsers} users`
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <UserSkeleton key={i} />
                ))}
              </div>
            ) : users.length === 0 ? (
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
                          onClick={() => handleOpenBanDialog(user)} 
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
                          onClick={() => handleOpenRoleDialog(user)}
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
            {!isLoading && metaSafe.lastPage > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-[#6CAC73]/20">
                <div className="text-sm text-gray-500 font-nunito">
                  Page {metaSafe.page} of {metaSafe.lastPage} • Total: {metaSafe.total} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={metaSafe.page === 1 || isLoading}
                    onClick={() => setParams({ ...params, page: metaSafe.page - 1 })}
                    className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={metaSafe.page >= metaSafe.lastPage || isLoading}
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
                    <p className="font-medium text-[#2B4A2F] font-poppins break-all">{selectedUser.email}</p>
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
                {selectedUser._count && (
                  <div>
                    <h3 className="font-semibold mb-3 text-[#2B4A2F] font-poppins">Activity Statistics</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10">
                        <p className="text-sm text-gray-500 mb-1 font-nunito">Posts</p>
                        <p className="text-xl font-bold text-[#2B4A2F] font-poppins">{selectedUser._count.posts || 0}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10">
                        <p className="text-sm text-gray-500 mb-1 font-nunito">Comments</p>
                        <p className="text-xl font-bold text-[#2B4A2F] font-poppins">{selectedUser._count.comments || 0}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10">
                        <p className="text-sm text-gray-500 mb-1 font-nunito">Challenges</p>
                        <p className="text-xl font-bold text-[#2B4A2F] font-poppins">{selectedUser._count.userChallenges || 0}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10">
                        <p className="text-sm text-gray-500 mb-1 font-nunito">Points</p>
                        <p className="text-xl font-bold text-[#2B4A2F] font-poppins">{selectedUser.profile?.points || 0}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Info */}
                <div>
                  <h3 className="font-semibold mb-3 text-[#2B4A2F] font-poppins">Account Information</h3>
                  <div className="space-y-2 text-sm font-nunito">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email Verified:</span>
                      <span className={selectedUser.is_email_verified ? 'text-[#6CAC73] font-medium' : 'text-rose-500'}>
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

        {/* Ban/Unban Confirmation Dialog */}
        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogContent className="border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className={`font-poppins ${userToBan?.is_active ? 'text-orange-600' : 'text-[#6CAC73]'}`}>
                {userToBan?.is_active ? (
                  <>
                    <Ban className="w-5 h-5 inline mr-2" />
                    Ban User
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5 inline mr-2" />
                    Unban User
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="font-nunito">
                {userToBan?.is_active 
                  ? 'This will prevent the user from accessing their account.'
                  : 'This will restore the user\'s access to their account.'
                }
              </DialogDescription>
            </DialogHeader>
            
            {userToBan && (
              <div className="space-y-4">
                <Alert className={`backdrop-blur-sm ${
                  userToBan.is_active 
                    ? 'bg-orange-50/80 border-orange-200' 
                    : 'bg-[#6CAC73]/10 border-[#6CAC73]/20'
                }`}>
                  <AlertCircle className={`h-4 w-4 ${userToBan.is_active ? 'text-orange-600' : 'text-[#6CAC73]'}`} />
                  <AlertDescription className="font-nunito">
                    <p className="font-medium mb-2">
                      {userToBan.is_active ? 'You are about to ban:' : 'You are about to unban:'}
                    </p>
                    <p className="font-bold text-[#2B4A2F]">{userToBan.username} ({userToBan.email})</p>
                  </AlertDescription>
                </Alert>

                <div className="bg-gradient-to-br from-[#FFF9F0] to-white p-4 rounded-xl border border-[#6CAC73]/10 space-y-2 text-sm font-nunito">
                  <p className="font-medium text-[#2B4A2F]">
                    {userToBan.is_active ? 'This will:' : 'This will restore:'}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {userToBan.is_active ? (
                      <>
                        <li>Prevent the user from logging in</li>
                        <li>Hide their content from public view</li>
                        <li>Disable all account activities</li>
                      </>
                    ) : (
                      <>
                        <li>Allow the user to log in again</li>
                        <li>Make their content visible again</li>
                        <li>Enable all account activities</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setBanDialogOpen(false);
                  setUserToBan(null);
                }}
                disabled={isToggling}
                className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmToggleStatus}
                disabled={isToggling}
                className={`border-0 ${
                  userToBan?.is_active 
                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800' 
                    : 'bg-gradient-to-r from-[#6CAC73] to-[#2B4A2F] hover:from-[#6CAC73]/90 hover:to-[#2B4A2F]/90'
                }`}
              >
                {isToggling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : userToBan?.is_active ? (
                  <>
                    <Ban className="w-4 h-4 mr-2" />
                    Ban User
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Unban User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Change Confirmation Dialog */}
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent className="border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-purple-600 font-poppins">
                <UserCog className="w-5 h-5 inline mr-2" />
                Change User Role
              </DialogTitle>
              <DialogDescription className="font-nunito">
                This will change the user's permissions and access level.
              </DialogDescription>
            </DialogHeader>
            
            {userToChangeRole && (
              <div className="space-y-4">
                <Alert className="bg-purple-50/80 border-purple-200 backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="font-nunito">
                    <p className="font-medium mb-2">You are about to change:</p>
                    <p className="font-bold text-[#2B4A2F]">{userToChangeRole.username} ({userToChangeRole.email})</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700 border-0">
                        Current: {userToChangeRole.role}
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <Badge className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-700 border-0">
                        New: {userToChangeRole.role === 'admin' ? 'user' : 'admin'}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="bg-gradient-to-br from-[#FFF9F0] to-white p-4 rounded-xl border border-[#6CAC73]/10 space-y-2 text-sm font-nunito">
                  <p className="font-medium text-[#2B4A2F]">
                    {userToChangeRole.role === 'admin' ? 'Demoting to User will:' : 'Promoting to Admin will:'}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {userToChangeRole.role === 'admin' ? (
                      <>
                        <li>Remove admin dashboard access</li>
                        <li>Remove user management permissions</li>
                        <li>Remove content moderation abilities</li>
                      </>
                    ) : (
                      <>
                        <li>Grant admin dashboard access</li>
                        <li>Grant user management permissions</li>
                        <li>Grant content moderation abilities</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRoleDialogOpen(false);
                  setUserToChangeRole(null);
                }}
                disabled={isUpdating}
                className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRoleChange}
                disabled={isUpdating}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border-0"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <UserCog className="w-4 h-4 mr-2" />
                    Change Role
                  </>
                )}
              </Button>
            </DialogFooter>
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

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}