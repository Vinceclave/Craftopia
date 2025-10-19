import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Ban, UserCog, Trash2, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';

export default function AdminUsers() {
  const { users, meta, isLoading, params, setParams, toggleStatus, updateRole, deleteUser } = useUsers();
  const [actionLoading, setActionLoading] = useState(false);

  const handleSearch = (e) => {
    setParams({ ...params, search: e.target.value, page: 1 });
  };

  const handleToggleStatus = async (userId) => {
    try {
      setActionLoading(true);
      await toggleStatus(userId);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          </div>
          <p className="text-gray-600">Manage and monitor all platform users</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={params.search}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              <Select value={params.role} onValueChange={(role) => setParams({ ...params, role, page: 1 })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({meta?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    {user.is_active ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600">
                        <XCircle className="w-3 h-3 mr-1" />
                        Banned
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleToggleStatus(user.user_id)} disabled={actionLoading}>
                      <Ban className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {meta && meta.lastPage > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={meta.page === 1}
                  onClick={() => setParams({ ...params, page: meta.page - 1 })}
                >
                  Previous
                </Button>
                <span className="px-4 py-2">Page {meta.page} of {meta.lastPage}</span>
                <Button
                  variant="outline"
                  disabled={meta.page === meta.lastPage}
                  onClick={() => setParams({ ...params, page: meta.page + 1 })}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
