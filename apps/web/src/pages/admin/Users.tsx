// apps/web/src/pages/admin/Users.refactored.tsx
import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  Users, Ban, UserCog, Trash2, Shield, CheckCircle,
  Unlock, Eye, Mail, Calendar, FileText, MessageSquare,
  Trophy, User,
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import {
  DataTable,
  FilterOption,
  ConfirmDialog,
  StatsGrid,
  PageHeader,
  ExportButtons,
  LoadingState,
  ErrorState,
  PageContainer,
  ActionButtons,
  ActionButton,
  DetailModal,
  DetailSection,
  DetailStatGrid,
} from '@/components/shared';
import { exportToPDF } from '@/utils/exportToPDF';
import { exportToExcel } from '@/utils/exportToExcel';

interface User {
  user_id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  _count?: {
    posts: number;
    comments: number;
    userChallenges: number;
  };
  profile?: {
    points: number;
  };
}

export default function AdminUsersRefactored() {
  const {
    users,
    isLoading,
    error,
    toggleStatus,
    updateRole,
    deleteUser,
    isToggling,
    isUpdating,
    isDeleting,
  } = useUsers();

  const { toast } = useToast();
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  // Define columns
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'User',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {row.original.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#2B4A2F] font-poppins truncate">
                  {row.original.username}
                </p>
                {row.original.is_email_verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500 font-nunito truncate">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge
            className={
              row.original.role === 'admin'
                ? 'bg-purple-100 text-purple-800 border-0'
                : 'bg-gray-100 text-gray-800 border-0'
            }
          >
            {row.original.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            className={
              row.original.is_active
                ? 'bg-green-100 text-green-800 border-0'
                : 'bg-red-100 text-red-800 border-0'
            }
          >
            {row.original.is_active ? (
              <>
                <Unlock className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <Ban className="w-3 h-3 mr-1" />
                Banned
              </>
            )}
          </Badge>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Joined Date',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500 font-nunito">
            {new Date(row.original.created_at).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const actions: ActionButton[] = [
            {
              icon: <Eye className="w-4 h-4" />,
              label: 'View Details',
              onClick: () => handleViewDetails(row.original),
              variant: 'default',
            },
            {
              icon: row.original.is_active ? (
                <Ban className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              ),
              label: row.original.is_active ? 'Ban User' : 'Unban User',
              onClick: () => handleOpenBanDialog(row.original),
              variant: row.original.is_active ? 'warning' : 'success',
            },
            {
              icon: <UserCog className="w-4 h-4" />,
              label:
                row.original.role === 'admin' ? 'Demote to User' : 'Promote to Admin',
              onClick: () => handleOpenRoleDialog(row.original),
              variant: 'info',
            },
            {
              icon: <Trash2 className="w-4 h-4" />,
              label: 'Delete User',
              onClick: () => handleOpenDeleteDialog(row.original),
              variant: 'danger',
            },
          ];

          return <ActionButtons actions={actions} />;
        },
      },
    ],
    []
  );

  // Filtered data
  const filteredData = useMemo(() => {
    return users.filter((user) => {
      const searchTerm = globalFilter.toLowerCase();
      const matchesSearch =
        !globalFilter ||
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm) ||
        (user.is_active ? 'active' : 'banned').includes(searchTerm) ||
        new Date(user.created_at).toLocaleDateString().toLowerCase().includes(searchTerm) ||
        (user._count?.posts?.toString() || '0').includes(searchTerm) ||
        (user._count?.comments?.toString() || '0').includes(searchTerm) ||
        (user._count?.userChallenges?.toString() || '0').includes(searchTerm) ||
        (user.profile?.points?.toString() || '0').includes(searchTerm);

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'banned' && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, globalFilter, roleFilter, statusFilter]);

  // Filters configuration
  const filters: FilterOption[] = [
    {
      label: 'All Roles',
      value: roleFilter,
      options: [
        { label: 'All Roles', value: 'all' },
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
      onChange: setRoleFilter,
    },
    {
      label: 'All Status',
      value: statusFilter,
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Banned', value: 'banned' },
      ],
      onChange: setStatusFilter,
    },
  ];

  // Stats
  const stats = useMemo(
    () => [
      {
        label: 'Total Users',
        value: users.length,
        icon: <Users className="w-5 h-5" />,
        color: 'text-[#2B4A2F]',
      },
      {
        label: 'Active',
        value: users.filter((u) => u.is_active).length,
        icon: <Unlock className="w-5 h-5" />,
        color: 'text-green-600',
      },
      {
        label: 'Banned',
        value: users.filter((u) => !u.is_active).length,
        icon: <Ban className="w-5 h-5" />,
        color: 'text-red-600',
      },
      {
        label: 'Admins',
        value: users.filter((u) => u.role === 'admin').length,
        icon: <Shield className="w-5 h-5" />,
        color: 'text-purple-600',
      },
      {
        label: 'Verified',
        value: users.filter((u) => u.is_email_verified).length,
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'text-blue-600',
      },
    ],
    [users]
  );

  // Export handlers
  const handleExportPDF = async () => {
    try {
      exportToPDF(filteredData, 'users-report', { title: 'Users Management' });
      toast({
        title: 'PDF Exported',
        description: 'User data has been exported as PDF successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map((user) => ({
      Username: user.username,
      Email: user.email,
      Role: user.role,
      Status: user.is_active ? 'Active' : 'Banned',
      'Email Verified': user.is_email_verified ? 'Yes' : 'No',
      'Joined Date': new Date(user.created_at).toLocaleDateString(),
      Posts: user._count?.posts || 0,
      Comments: user._count?.comments || 0,
      Challenges: user._count?.userChallenges || 0,
      Points: user.profile?.points || 0,
    }));

    exportToExcel(exportData, 'users-report');

    toast({
      title: 'Excel Exported',
      description: 'Users report has been exported as Excel successfully.',
    });
  };

  // Handlers
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleOpenBanDialog = (user: User) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  const handleOpenRoleDialog = (user: User) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedUser) return;

    try {
      await toggleStatus(selectedUser.user_id);
      toast({
        title: 'Success',
        description: `${selectedUser.username} has been ${
          selectedUser.is_active ? 'banned' : 'unbanned'
        } successfully.`,
      });
      setBanDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user status.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedUser) return;

    const newRole = selectedUser.role === 'admin' ? 'user' : 'admin';

    try {
      await updateRole({ userId: selectedUser.user_id, role: newRole });
      toast({
        title: 'Success',
        description: `${selectedUser.username}'s role has been changed to ${newRole}.`,
      });
      setRoleDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user role.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.user_id);
      toast({
        title: 'User Deleted',
        description: `${selectedUser.username} has been permanently deleted.`,
      });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user.',
        variant: 'destructive',
      });
    }
  };

  // Detail modal sections
  const detailSections: DetailSection[] = selectedUser
    ? [
        {
          title: 'Account Information',
          items: [
            {
              label: 'Role',
              value: (
                <Badge
                  className={
                    selectedUser.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 border-0'
                      : 'bg-gray-100 text-gray-800 border-0'
                  }
                >
                  {selectedUser.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                  {selectedUser.role}
                </Badge>
              ),
            },
            {
              label: 'Status',
              value: (
                <Badge
                  className={
                    selectedUser.is_active
                      ? 'bg-green-100 text-green-800 border-0'
                      : 'bg-red-100 text-red-800 border-0'
                  }
                >
                  {selectedUser.is_active ? 'Active' : 'Banned'}
                </Badge>
              ),
            },
            {
              label: 'Member Since',
              icon: <Calendar className="w-4 h-4" />,
              value: new Date(selectedUser.created_at).toLocaleDateString(),
            },
          ],
        },
        ...(selectedUser._count
          ? [
              {
                title: 'Activity Statistics',
                items: [
                  {
                    label: '',
                    value: (
                      <DetailStatGrid
                        stats={[
                          {
                            icon: <FileText className="w-6 h-6" />,
                            label: 'Posts',
                            value: selectedUser._count.posts || 0,
                            color: 'text-[#6CAC73]',
                          },
                          {
                            icon: <MessageSquare className="w-6 h-6" />,
                            label: 'Comments',
                            value: selectedUser._count.comments || 0,
                            color: 'text-[#6CAC73]',
                          },
                          {
                            icon: <Trophy className="w-6 h-6" />,
                            label: 'Challenges',
                            value: selectedUser._count.userChallenges || 0,
                            color: 'text-[#6CAC73]',
                          },
                          {
                            icon: <Trophy className="w-6 h-6" />,
                            label: 'Points',
                            value: selectedUser.profile?.points || 0,
                            color: 'text-[#6CAC73]',
                          },
                        ]}
                      />
                    ),
                    fullWidth: true,
                  },
                ],
              },
            ]
          : []),
      ]
    : [];

  if (isLoading) {
    return <LoadingState message="Loading users..." />;
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="User Management"
        description="Manage platform users and permissions"
        icon={<Users className="w-6 h-6 text-white" />}
        actions={
          <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
        }
      />

      {/* Error Alert */}
      {error && <ErrorState error={error} title="Error loading users" />}

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        searchPlaceholder="Search users, emails, roles, status, dates, posts, comments..."
        onSearchChange={setGlobalFilter}
        filters={filters}
        title="All Users"
        emptyState={{
          icon: <Users className="w-12 h-12 text-gray-300" />,
          title: 'No users found',
          description: 'Try adjusting your search or filters',
        }}
      />

      {/* Detail Modal */}
      {selectedUser && (
        <DetailModal
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          title="User Details"
          description={`Complete information about ${selectedUser.username}`}
          icon={<User className="w-5 h-5" />}
          header={
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-[#2B4A2F] font-poppins">
                    {selectedUser.username}
                  </h3>
                  {selectedUser.is_email_verified && (
                    <Badge className="bg-blue-100 text-blue-800 border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 font-nunito flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {selectedUser.email}
                </p>
              </div>
            </div>
          }
          sections={detailSections}
        />
      )}

      {/* Ban/Unban Dialog */}
      {selectedUser && (
        <ConfirmDialog
          open={banDialogOpen}
          onOpenChange={setBanDialogOpen}
          onConfirm={handleConfirmToggleStatus}
          title={selectedUser.is_active ? 'Ban User' : 'Unban User'}
          description={
            selectedUser.is_active
              ? "This will prevent the user from accessing their account."
              : "This will restore the user's access to their account."
          }
          confirmText={selectedUser.is_active ? 'Ban User' : 'Unban User'}
          loading={isToggling}
          variant={selectedUser.is_active ? 'warning' : 'success'}
          icon={
            selectedUser.is_active ? (
              <Ban className="w-5 h-5" />
            ) : (
              <Unlock className="w-5 h-5" />
            )
          }
          alertMessage={
            <>
              You are about to {selectedUser.is_active ? 'ban' : 'unban'}:{' '}
              <span className="font-bold text-[#2B4A2F]">{selectedUser.username}</span>
            </>
          }
        />
      )}

      {/* Role Change Dialog */}
      {selectedUser && (
        <ConfirmDialog
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          onConfirm={handleConfirmRoleChange}
          title="Change User Role"
          description="This will change the user's permissions and access level."
          confirmText={`Change to ${selectedUser.role === 'admin' ? 'user' : 'admin'}`}
          loading={isUpdating}
          variant="info"
          icon={<UserCog className="w-5 h-5" />}
          alertMessage={
            <div className="flex flex-col gap-2">
              <p>You are about to change role for:</p>
              <p className="font-bold text-[#2B4A2F]">{selectedUser.username}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-gray-100 text-gray-800 border-0">
                  Current: {selectedUser.role}
                </Badge>
                <span className="text-gray-400">→</span>
                <Badge className="bg-purple-100 text-purple-800 border-0">
                  New: {selectedUser.role === 'admin' ? 'user' : 'admin'}
                </Badge>
              </div>
            </div>
          }
        />
      )}

      {/* Delete Dialog */}
      {selectedUser && (
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title="Delete User"
          description="This action cannot be undone and will permanently delete the user account."
          confirmText="Delete Permanently"
          loading={isDeleting}
          variant="danger"
          icon={<Trash2 className="w-5 h-5" />}
          alertMessage={
            <div className="flex flex-col gap-2">
              <p className="font-medium">You are about to delete:</p>
              <p className="font-bold">
                {selectedUser.username} ({selectedUser.email})
              </p>
            </div>
          }
        >
          <div className="bg-gradient-to-br from-[#FFF9F0] to-white p-4 rounded-xl border border-[#6CAC73]/10 flex flex-col gap-2 text-sm font-nunito">
            <p className="font-medium text-[#2B4A2F]">This will permanently:</p>
            <ul className="list-disc list-inside flex flex-col gap-1 text-gray-600">
              <li>Remove all user data</li>
              <li>Delete all associated content</li>
              <li>Cannot be recovered</li>
            </ul>
          </div>
        </ConfirmDialog>
      )}

      <Toaster />
    </PageContainer>
  );
}