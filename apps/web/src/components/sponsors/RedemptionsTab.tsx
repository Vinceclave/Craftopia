// apps/web/src/pages/admin/sponsors/RedemptionsTab.tsx
import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Gift,
  Coins,
  Calendar,
  Eye,
} from 'lucide-react';
import { useRedemptions } from '@/hooks/useSponsors';
import { useToast } from '@/hooks/useToast';
import type { UserRedemption } from '@/lib/api';
import {
  DataTable,
  DetailModal,
  DetailSection,
  DetailStatGrid,
  ConfirmDialog,
  ActionButtons,
  ActionButton,
  EmptyState,
  FilterOption,
} from '@/components/shared';
import { format } from 'date-fns';

export function RedemptionsTab() {
  const { success, error: showError } = useToast();
  const {
    redemptions,
    isLoading,
    fulfillRedemption,
    cancelRedemption,
    isFulfilling,
    isCancelling,
  } = useRedemptions();

  // Helper function to safely format dates
  const formatSafeDate = (date: string | null | undefined, formatString: string = 'MMM dd, yyyy'): string => {
    if (!date) return 'N/A';
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return 'Invalid date';
      }
      return format(parsedDate, formatString);
    } catch (error) {
      return 'Invalid date';
    }
  };

  // State
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState<UserRedemption | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refundPoints, setRefundPoints] = useState(false);

  // Filters
  const filters: FilterOption[] = [
    {
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Fulfilled', value: 'fulfilled' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
  ];

  // Filtered Data
  const filteredData = useMemo(() => {
    return redemptions.filter((redemption) => {
      const matchesSearch =
        !globalFilter ||
        redemption.reward?.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        redemption.user?.username.toLowerCase().includes(globalFilter.toLowerCase()) ||
        redemption.user?.email.toLowerCase().includes(globalFilter.toLowerCase());

      const matchesStatus = statusFilter === 'all' || redemption.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [redemptions, globalFilter, statusFilter]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: {
        label: 'Pending',
        color: 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-700',
      },
      fulfilled: {
        label: 'Fulfilled',
        color: 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]',
      },
      cancelled: {
        label: 'Cancelled',
        color: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700',
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  // Columns
  const columns = useMemo<ColumnDef<UserRedemption>[]>(
    () => [
      {
        accessorKey: 'user',
        header: 'User',
        cell: ({ row }) => {
          const user = row.original.user;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-[#6CAC73]/20">
                <AvatarImage src={user?.profile_picture} alt={user?.username} />
                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 font-poppins">
                  {user?.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-[#2B4A2F] font-poppins text-sm">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 font-nunito">{user?.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'reward',
        header: 'Reward',
        cell: ({ row }) => {
          const reward = row.original.reward;
          const sponsor = reward?.sponsor;
          return (
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-[#2B4A2F] font-poppins text-sm">
                {reward?.name}
              </p>
              <p className="text-xs text-gray-500 font-nunito">{sponsor?.name}</p>
            </div>
          );
        },
      },
      {
        accessorKey: 'points_spent',
        header: 'Points',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 font-poppins">
            <Coins className="w-4 h-4" />
            {row.original.points_spent}
          </div>
        ),
      },
      {
        accessorKey: 'redeemed_at',
        header: 'Redeemed',
        cell: ({ row }) => {
          const formattedDate = formatSafeDate(row.original.redeemed_at);
          if (formattedDate === 'N/A' || formattedDate === 'Invalid date') {
            return <span className="text-sm text-gray-400 font-nunito">{formattedDate}</span>;
          }
          return (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600 font-nunito">{formattedDate}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = getStatusBadge(row.original.status);
          return (
            <Badge className={`font-poppins border-0 ${status.color}`}>{status.label}</Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const redemption = row.original;
          const actions: ActionButton[] = [
            {
              icon: <Eye className="w-4 h-4" />,
              label: 'View Details',
              onClick: () => handleOpenView(redemption),
              variant: 'default',
            },
          ];

          if (redemption.status === 'pending') {
            actions.push(
              {
                icon: <CheckCircle className="w-4 h-4" />,
                label: 'Fulfill',
                onClick: () => handleOpenFulfill(redemption),
                variant: 'success',
              },
              {
                icon: <XCircle className="w-4 h-4" />,
                label: 'Cancel',
                onClick: () => handleOpenCancel(redemption),
                variant: 'danger',
              }
            );
          }

          return <ActionButtons actions={actions} />;
        },
      },
    ],
    []
  );

  // Handlers
  const handleOpenView = (redemption: UserRedemption) => {
    setSelectedRedemption(redemption);
    setViewDialogOpen(true);
  };

  const handleOpenFulfill = (redemption: UserRedemption) => {
    setSelectedRedemption(redemption);
    setFulfillDialogOpen(true);
  };

  const handleOpenCancel = (redemption: UserRedemption) => {
    setSelectedRedemption(redemption);
    setRefundPoints(false);
    setCancelDialogOpen(true);
  };

  const handleFulfill = async () => {
    if (!selectedRedemption) return;
    try {
      await fulfillRedemption(selectedRedemption.redemption_id);
      setFulfillDialogOpen(false);
      setSelectedRedemption(null);
    } catch (err: any) {
      showError(err.message || 'Failed to fulfill redemption');
    }
  };

  const handleCancel = async () => {
    if (!selectedRedemption) return;
    try {
      await cancelRedemption({
        redemptionId: selectedRedemption.redemption_id,
        refundPoints,
      });
      setCancelDialogOpen(false);
      setSelectedRedemption(null);
      setRefundPoints(false);
    } catch (err: any) {
      showError(err.message || 'Failed to cancel redemption');
    }
  };

  // Detail sections for modal
  const getDetailSections = (redemption: UserRedemption): DetailSection[] => {
    const sections: DetailSection[] = [
      {
        title: 'User Information',
        items: [
          {
            label: 'Username',
            value: redemption.user?.username,
            icon: <User className="w-4 h-4" />,
          },
          {
            label: 'Email',
            value: redemption.user?.email,
            icon: <User className="w-4 h-4" />,
          },
        ],
      },
      {
        title: 'Reward Information',
        items: [
          {
            label: 'Reward Name',
            value: redemption.reward?.name,
            icon: <Gift className="w-4 h-4" />,
          },
          {
            label: 'Sponsor',
            value: redemption.reward?.sponsor?.name,
            icon: <Package className="w-4 h-4" />,
          },
          {
            label: 'Description',
            value: redemption.reward?.description || 'No description',
            icon: <Gift className="w-4 h-4" />,
            fullWidth: true,
          },
        ],
      },
      {
        title: 'Redemption Details',
        items: [
          {
            label: 'Points Spent',
            value: `${redemption.points_spent} points`,
            icon: <Coins className="w-4 h-4" />,
          },
          {
            label: 'Redeemed At',
            value: formatSafeDate(redemption.redeemed_at, 'PPpp'),
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            label: 'Status',
            value: (
              <Badge className={`${getStatusBadge(redemption.status).color} border-0`}>
                {getStatusBadge(redemption.status).label}
              </Badge>
            ),
            icon: <Clock className="w-4 h-4" />,
          },
        ],
      },
    ];

    if (redemption.status === 'fulfilled' && redemption.fulfilled_at) {
      const fulfilledDate = formatSafeDate(redemption.fulfilled_at, 'PPpp');
      if (fulfilledDate !== 'N/A' && fulfilledDate !== 'Invalid date') {
        sections[2].items.push({
          label: 'Fulfilled At',
          value: fulfilledDate,
          icon: <CheckCircle className="w-4 h-4" />,
        });
      }
    }

    if (redemption.status === 'cancelled' && redemption.cancelled_at) {
      const cancelledDate = formatSafeDate(redemption.cancelled_at, 'PPpp');
      if (cancelledDate !== 'N/A' && cancelledDate !== 'Invalid date') {
        sections[2].items.push({
          label: 'Cancelled At',
          value: cancelledDate,
          icon: <XCircle className="w-4 h-4" />,
        });
      }
    }

    return sections;
  };

  return (
    <>
      <DataTable
        data={filteredData}
        columns={columns}
        searchPlaceholder="Search redemptions..."
        onSearchChange={setGlobalFilter}
        filters={filters}
        title="Manage Redemptions"
        emptyState={{
          icon: <Package className="w-16 h-16 text-gray-400" />,
          title: 'No redemptions yet',
          description: 'User redemptions will appear here',
        }}
      />

      {/* View Detail Modal */}
      {selectedRedemption && (
        <DetailModal
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          title={`Redemption Details`}
          sections={getDetailSections(selectedRedemption)}
        />
      )}

      {/* Fulfill Confirmation */}
      {selectedRedemption && (
        <ConfirmDialog
          open={fulfillDialogOpen}
          onOpenChange={setFulfillDialogOpen}
          onConfirm={handleFulfill}
          title="Fulfill Redemption?"
          description="Mark this redemption as fulfilled. The user will be notified."
          confirmText="Fulfill"
          loading={isFulfilling}
          variant="success"
          icon={<CheckCircle className="w-5 h-5" />}
          alertMessage={
            <div className="space-y-2">
              <p>
                <span className="font-semibold">{selectedRedemption.user?.username}</span> will
                receive:
              </p>
              <p className="font-bold text-[#2B4A2F]">{selectedRedemption.reward?.name}</p>
            </div>
          }
        />
      )}

      {/* Cancel Confirmation */}
      {selectedRedemption && (
        <ConfirmDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          onConfirm={handleCancel}
          title="Cancel Redemption?"
          description="This will cancel the redemption. You can optionally refund the points to the user."
          confirmText="Cancel Redemption"
          loading={isCancelling}
          variant="danger"
          icon={<XCircle className="w-5 h-5" />}
        >
          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Checkbox
              id="refund"
              checked={refundPoints}
              onCheckedChange={(checked) => setRefundPoints(checked as boolean)}
            />
            <label
              htmlFor="refund"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Refund {selectedRedemption.points_spent} points to{' '}
              {selectedRedemption.user?.username}
            </label>
          </div>
        </ConfirmDialog>
      )}
    </>
  );
}