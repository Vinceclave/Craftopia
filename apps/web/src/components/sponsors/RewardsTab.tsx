// apps/web/src/components/sponsors/RewardsTab.tsx - FIXED
import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Gift,
  Plus,
  Loader2,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Trash2,
  Calendar,
  Coins,
  Package,
} from 'lucide-react';
import { useRewards } from '@/hooks/useSponsors';
import { useToast } from '@/components/ui/use-toast';
import type { SponsorReward, Sponsor } from '@/lib/api';
import {
  DataTable,
  ConfirmDialog,
  ActionButtons,
  ActionButton,
  FilterOption,
} from '@/components/shared';
import { format } from 'date-fns';

interface RewardsTabProps {
  sponsors: Sponsor[];
}

export function RewardsTab({ sponsors }: RewardsTabProps) {
  const { toast } = useToast();
  const {
    rewards,
    createReward,
    updateReward,
    deleteReward,
    toggleStatus,
    isCreating,
    isUpdating,
    isDeleting,
  } = useRewards();

  // State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<SponsorReward | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sponsorFilter, setSponsorFilter] = useState('all');

  const [formData, setFormData] = useState({
    sponsor_id: '',
    title: '',
    description: '',
    points_cost: '',
    quantity: '',
    expiration_date: '',
  });

  // Reset Form
  const resetForm = () => {
    setFormData({
      sponsor_id: '',
      title: '',
      description: '',
      points_cost: '',
      quantity: '',
      expiration_date: '',
    });
  };

  // Filters
  const filters: FilterOption[] = [
    {
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Expired', value: 'expired' },
        { label: 'Out of Stock', value: 'out_of_stock' },
      ],
    },
    {
      label: 'Sponsor',
      value: sponsorFilter,
      onChange: setSponsorFilter,
      options: [
        { label: 'All Sponsors', value: 'all' },
        ...sponsors.map((s) => ({ label: s.name, value: s.sponsor_id.toString() })),
      ],
    },
  ];

  // Filtered Data
  const filteredData = useMemo(() => {
    return rewards.filter((reward) => {
      const matchesSearch =
        !globalFilter ||
        reward.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
        reward.description?.toLowerCase().includes(globalFilter.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && reward.is_active && (reward.quantity ?? 0) > 0 && (!reward.expires_at || new Date(reward.expires_at) > new Date())) ||
        (statusFilter === 'inactive' && !reward.is_active) ||
        (statusFilter === 'expired' && reward.expires_at && new Date(reward.expires_at) <= new Date()) ||
        (statusFilter === 'out_of_stock' && reward.quantity === 0);

      const matchesSponsor =
        sponsorFilter === 'all' || reward.sponsor_id.toString() === sponsorFilter;

      return matchesSearch && matchesStatus && matchesSponsor;
    });
  }, [rewards, globalFilter, statusFilter, sponsorFilter]);

  // Get reward status
  const getRewardStatus = (reward: SponsorReward) => {
    if (!reward.is_active) return { label: 'Inactive', color: 'gray' as const };
    if (reward.quantity === 0) return { label: 'Out of Stock', color: 'orange' as const };
    if (reward.expires_at && new Date(reward.expires_at) <= new Date()) {
      return { label: 'Expired', color: 'red' as const };
    }
    return { label: 'Active', color: 'green' as const };
  };

  // Columns
  const columns = useMemo<ColumnDef<SponsorReward>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Reward',
        cell: ({ row }) => {
          const reward = row.original;
          const sponsor = sponsors.find((s) => s.sponsor_id === reward.sponsor_id);
          return (
            <div className="flex items-center gap-3">
              {sponsor?.logo_url ? (
                <img
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  className="w-10 h-10 rounded-lg object-cover border border-[#6CAC73]/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-blue-600" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-[#2B4A2F] font-poppins text-sm">
                  {reward.title}
                </p>
                <p className="text-xs text-gray-500 font-nunito">{sponsor?.name}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <p className="text-sm text-gray-600 font-nunito line-clamp-2">
            {row.original.description || 'No description'}
          </p>
        ),
      },
      {
        accessorKey: 'points_cost',
        header: 'Points',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 font-poppins">
            <Coins className="w-4 h-4" />
            {row.original.points_cost}
          </div>
        ),
      },
      {
        accessorKey: 'quantity',
        header: 'Stock',
        cell: ({ row }) => {
          const qty = row.original.quantity;
          return (
            <div className="flex items-center gap-1">
              <Package className={`w-4 h-4 ${qty === 0 ? 'text-red-600' : 'text-gray-600'}`} />
              <span className={`text-sm font-nunito ${qty === 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                {qty}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'expires_at',
        header: 'Expires',
        cell: ({ row }) => {
          const date = row.original.expires_at;
          if (!date) return <span className="text-sm text-gray-400 font-nunito">No expiry</span>;
          const isExpired = new Date(date) <= new Date();
          return (
            <div className="flex items-center gap-1">
              <Calendar className={`w-4 h-4 ${isExpired ? 'text-red-600' : 'text-gray-600'}`} />
              <span className={`text-sm font-nunito ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
                {format(new Date(date), 'MMM dd, yyyy')}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = getRewardStatus(row.original);
          const colorMap: Record<'green' | 'gray' | 'orange' | 'red', string> = {
            green: 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]',
            gray: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700',
            orange: 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-700',
            red: 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-700',
          };
          return (
            <Badge className={`font-poppins border-0 ${colorMap[status.color]}`}>
              {status.label}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const reward = row.original;
          const actions: ActionButton[] = [
            {
              icon: reward.is_active ? (
                <ToggleRight className="w-4 h-4" />
              ) : (
                <ToggleLeft className="w-4 h-4" />
              ),
              label: reward.is_active ? 'Deactivate' : 'Activate',
              onClick: () => handleToggleStatus(reward),
              variant: 'success',
            },
            {
              icon: <Edit2 className="w-4 h-4" />,
              label: 'Edit',
              onClick: () => handleOpenEdit(reward),
              variant: 'default',
            },
            {
              icon: <Trash2 className="w-4 h-4" />,
              label: 'Delete',
              onClick: () => handleOpenDelete(reward),
              variant: 'danger',
            },
          ];

          return <ActionButtons actions={actions} />;
        },
      },
    ],
    [sponsors]
  );

  // Handlers
  const handleOpenEdit = (reward: SponsorReward) => {
    setSelectedReward(reward);
    setFormData({
      sponsor_id: reward.sponsor_id.toString(),
      title: reward.title,
      description: reward.description || '',
      points_cost: reward.points_cost.toString(),
      quantity: reward.quantity?.toString() || '0',
      expiration_date: reward.expires_at
        ? format(new Date(reward.expires_at), 'yyyy-MM-dd')
        : '',
    });
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (reward: SponsorReward) => {
    setSelectedReward(reward);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (reward: SponsorReward) => {
    try {
      await toggleStatus(reward.reward_id);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to toggle status',
        variant: 'destructive',
      });
    }
  };

  const handleCreate = async () => {
    if (!formData.sponsor_id || !formData.title.trim() || !formData.points_cost || !formData.quantity) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate points cost
    const pointsCost = parseInt(formData.points_cost);
    if (pointsCost < 50 || pointsCost > 10000) {
      toast({
        title: 'Validation Error',
        description: 'Points cost must be between 50 and 10,000',
        variant: 'destructive',
      });
      return;
    }

    // Validate quantity
    const quantity = parseInt(formData.quantity);
    if (quantity < 0) {
      toast({
        title: 'Validation Error',
        description: 'Quantity cannot be negative',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createReward({
        sponsor_id: parseInt(formData.sponsor_id),
        title: formData.title,
        description: formData.description,
        points_cost: pointsCost,
        quantity: quantity,
        expires_at: formData.expiration_date || undefined,
      });
      setCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Reward created successfully!',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create reward',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedReward || !formData.title.trim() || !formData.points_cost || !formData.quantity) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate points cost
    const pointsCost = parseInt(formData.points_cost);
    if (pointsCost < 50 || pointsCost > 10000) {
      toast({
        title: 'Validation Error',
        description: 'Points cost must be between 50 and 10,000',
        variant: 'destructive',
      });
      return;
    }

    // Validate quantity
    const quantity = parseInt(formData.quantity);
    if (quantity < 0) {
      toast({
        title: 'Validation Error',
        description: 'Quantity cannot be negative',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateReward({
        rewardId: selectedReward.reward_id,
        data: {
          sponsor_id: parseInt(formData.sponsor_id),
          title: formData.title,
          description: formData.description,
          points_cost: pointsCost,
          quantity: quantity,
          expires_at: formData.expiration_date || undefined,
        },
      });
      setEditDialogOpen(false);
      setSelectedReward(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Reward updated successfully!',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update reward',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedReward) return;
    try {
      await deleteReward(selectedReward.reward_id);
      setDeleteDialogOpen(false);
      setSelectedReward(null);
      toast({
        title: 'Success',
        description: 'Reward deleted successfully!',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete reward',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <DataTable
        data={filteredData}
        columns={columns}
        searchPlaceholder="Search rewards..."
        onSearchChange={setGlobalFilter}
        filters={filters}
        title="Manage Rewards"
        showPagination={true}
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        action={
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-br from-blue-600 to-blue-700 text-white"
            disabled={sponsors.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Reward
          </Button>
        }
        emptyState={{
          icon: <Gift className="w-16 h-16 text-gray-400" />,
          title: 'No rewards yet',
          description: sponsors.length === 0
            ? 'Add a sponsor first before creating rewards'
            : 'Add your first reward to get started',
          action: sponsors.length > 0 ? (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-br from-blue-600 to-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Reward
            </Button>
          ) : undefined,
        }}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            setSelectedReward(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2B4A2F] font-poppins">
              {editDialogOpen ? 'Edit Reward' : 'Add New Reward'}
            </DialogTitle>
            <DialogDescription className="font-nunito">
              {editDialogOpen ? 'Update reward details' : 'Create a new reward for users to redeem'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sponsor" className="text-[#2B4A2F] font-poppins">
                Sponsor <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.sponsor_id}
                onValueChange={(value) => setFormData({ ...formData, sponsor_id: value })}
                disabled={editDialogOpen}
              >
                <SelectTrigger className="border-[#6CAC73]/20">
                  <SelectValue placeholder="Select a sponsor" />
                </SelectTrigger>
                <SelectContent>
                  {sponsors.map((sponsor) => (
                    <SelectItem key={sponsor.sponsor_id} value={sponsor.sponsor_id.toString()}>
                      {sponsor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sponsors.length === 0 && (
                <p className="text-sm text-amber-600 font-nunito">
                  No sponsors available. Please add a sponsor first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#2B4A2F] font-poppins">
                Reward Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., $10 Gift Card"
                className="border-[#6CAC73]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#2B4A2F] font-poppins">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the reward..."
                rows={3}
                className="border-[#6CAC73]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points_cost" className="text-[#2B4A2F] font-poppins">
                  Points Cost <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="points_cost"
                  type="number"
                  min="50"
                  max="10000"
                  value={formData.points_cost}
                  onChange={(e) => setFormData({ ...formData, points_cost: e.target.value })}
                  placeholder="100"
                  className="border-[#6CAC73]/20"
                />
                <p className="text-xs text-gray-500">Between 50 and 10,000 points</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-[#2B4A2F] font-poppins">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="10"
                  className="border-[#6CAC73]/20"
                />
                <p className="text-xs text-gray-500">Set to 0 for out of stock</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration_date" className="text-[#2B4A2F] font-poppins">
                Expiration Date (Optional)
              </Label>
              <Input
                id="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                className="border-[#6CAC73]/20"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
              <p className="text-xs text-gray-500">Leave empty for no expiration</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => {
                setCreateDialogOpen(false);
                setEditDialogOpen(false);
                resetForm();
              }}
              disabled={isCreating || isUpdating}
              className="border-[#6CAC73]/20 bg-white/80"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={editDialogOpen ? handleUpdate : handleCreate}
              disabled={isCreating || isUpdating || sponsors.length === 0}
              className="bg-gradient-to-br from-blue-600 to-blue-700 text-white"
            >
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editDialogOpen ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editDialogOpen ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      {selectedReward && (
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Delete Reward?"
          description="This action cannot be undone. Users will no longer be able to redeem this reward."
          confirmText="Delete"
          loading={isDeleting}
          variant="danger"
          icon={<Trash2 className="w-5 h-5" />}
          alertMessage={
            <>
              You are about to delete: <span className="font-bold">"{selectedReward.title}"</span>
            </>
          }
        />
      )}
    </>
  );
}