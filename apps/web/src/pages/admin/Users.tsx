import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Users, Search, Ban, UserCog, Trash2, Shield, CheckCircle, Loader2 
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';

export default function AdminUsers() {
  const { 
    users, meta, isLoading, error, params, setParams, 
    refetch, toggleStatus, updateRole, deleteUser 
  } = useUsers();

  const [actionLoading, setActionLoading] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, search: e.target.value, page: 1 });
  };

  const handleAction = async (action: () => Promise<void>, message: string) => {
    try {
      setActionLoading(true);
      await action();
      alert(message);
      refetch();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = (userId: number) => 
    handleAction(() => toggleStatus(userId), 'User status updated successfully!');

  const handleRoleChange = (userId: number, newRole: string) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;
    handleAction(() => updateRole({ userId, role: newRole }), 'Role updated successfully!');
  };

  const handleDeleteUser = (userId: number) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    handleAction(() => deleteUser(userId), 'User deleted successfully!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-gray-600 mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border border-gray-100">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">Error loading users</p>
              <Button onClick={refetch} className="bg-gray-900 text-white text-sm sm:text-base">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalUsers = meta?.total || users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const verifiedCount = users.filter(u => u.is_email_verified).length;

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-500 text-xs sm:text-sm">Manage platform users</p>
            </div>
          </div>
          <Button variant="outline" onClick={refetch} className="border-gray-200 text-sm sm:text-base">
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {[
            { label: 'Total', value: totalUsers },
            { label: 'Active', value: activeUsers },
            { label: 'Admins', value: adminCount },
            { label: 'Verified', value: verifiedCount }
          ].map((stat, index) => (
            <Card key={index} className="border border-gray-100">
              <CardContent className="p-3 sm:p-4 text-center">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value || 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border border-gray-100 mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                <Input
                  placeholder="Search users..."
                  value={params.search}
                  onChange={handleSearch}
                  className="pl-8 sm:pl-10 border-gray-200 text-sm sm:text-base"
                />
              </div>

              {/* Role Filter */}
              <Select 
                value={params.role || "all"} 
                onValueChange={(role) => setParams({ ...params, role: role === "all" ? "" : role, page: 1 })}
              >
                <SelectTrigger className="border-gray-200 text-sm sm:text-base">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-sm">All Roles</SelectItem>
                  <SelectItem value="user" className="text-sm">User</SelectItem>
                  <SelectItem value="admin" className="text-sm">Admin</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select 
                value={params.isActive || "all"} 
                onValueChange={(isActive) => setParams({ ...params, isActive: isActive === "all" ? "" : isActive, page: 1 })}
              >
                <SelectTrigger className="border-gray-200 text-sm sm:text-base">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-sm">All Status</SelectItem>
                  <SelectItem value="true" className="text-sm">Active</SelectItem>
                  <SelectItem value="false" className="text-sm">Banned</SelectItem>
                </SelectContent>
              </Select>

              {/* Verification Filter */}
              <Select 
                value={params.isVerified || "all"} 
                onValueChange={(isVerified) => setParams({ ...params, isVerified: isVerified === "all" ? "" : isVerified, page: 1 })}
              >
                <SelectTrigger className="border-gray-200 text-sm sm:text-base">
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-sm">All</SelectItem>
                  <SelectItem value="true" className="text-sm">Verified</SelectItem>
                  <SelectItem value="false" className="text-sm">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="border border-gray-100">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-base sm:text-lg font-semibold">Users</CardTitle>
              <span className="text-xs sm:text-sm text-gray-500">{totalUsers} total</span>
            </div>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div 
                    key={user.user_id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-100 rounded-lg gap-3 sm:gap-4"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm sm:text-base flex-shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {user.username}
                          </p>
                          {user.is_email_verified && (
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* User Actions & Badges */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                          {user.role === 'admin' && <Shield className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />}
                          {user.role}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${user.is_active ? "bg-gray-100 text-gray-700" : "bg-rose-50 text-rose-700"}`}
                        >
                          {user.is_active ? 'Active' : 'Banned'}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1 sm:gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleToggleStatus(user.user_id)} 
                          disabled={actionLoading}
                          className="border-gray-200 h-8 w-8 sm:h-9 sm:w-9 p-0"
                        >
                          <Ban className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRoleChange(user.user_id, user.role === 'admin' ? 'user' : 'admin')}
                          disabled={actionLoading}
                          className="border-gray-200 h-8 w-8 sm:h-9 sm:w-9 p-0"
                        >
                          <UserCog className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteUser(user.user_id)}
                          disabled={actionLoading}
                          className="border-gray-200 text-rose-600 hover:text-rose-700 h-8 w-8 sm:h-9 sm:w-9 p-0"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.lastPage > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                <div className="text-xs sm:text-sm text-gray-500">
                  Page {meta.page} of {meta.lastPage}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={meta.page === 1}
                    onClick={() => setParams({ ...params, page: meta.page - 1 })}
                    className="border-gray-200 text-xs sm:text-sm"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={meta.page >= meta.lastPage}
                    onClick={() => setParams({ ...params, page: meta.page + 1 })}
                    className="border-gray-200 text-xs sm:text-sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}