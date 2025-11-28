// apps/web/src/pages/admin/Sponsors.tsx - COMPLETE WITH TANSTACK TABLE
import { useState, useCallback, useMemo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Gift,
  Plus,
  Loader2,
  RefreshCw,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
  Award,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Building2,
  Calendar,
  Eye,
  CheckCheck,
  Ban,
  Upload,
  Image as ImageIcon,
  Search,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useSponsors, useRewards, useRedemptions } from '@/hooks/useSponsors';
import { useWebSocketSponsors } from '@/hooks/useWebSocket';
import { uploadImageToS3, validateImageFile, createImagePreview } from '@/lib/upload';
import type { Sponsor, SponsorReward, UserRedemption } from '@/lib/api';

export default function AdminSponsors() {
  const { success, error: showError, info } = useToast();

  // ==========================================
  // HOOKS - SPONSORS
  // ==========================================
  const {
    sponsors,
    meta: sponsorsMeta,
    isLoading: sponsorsLoading,
    refetch: refetchSponsors,
    createSponsor,
    updateSponsor,
    deleteSponsor,
    toggleStatus: toggleSponsorStatus,
    isCreating: isCreatingSponsor,
    isUpdating: isUpdatingSponsor,
    isDeleting: isDeletingSponsor,
    isToggling: isTogglingSponsor,
  } = useSponsors();

  // ==========================================
  // HOOKS - REWARDS
  // ==========================================
  const {
    rewards,
    meta: rewardsMeta,
    isLoading: rewardsLoading,
    refetch: refetchRewards,
    createReward,
    updateReward,
    deleteReward,
    toggleStatus: toggleRewardStatus,
    isCreating: isCreatingReward,
    isUpdating: isUpdatingReward,
    isDeleting: isDeletingReward,
    isToggling: isTogglingReward,
  } = useRewards();

  // ==========================================
  // HOOKS - REDEMPTIONS
  // ==========================================
  const {
    redemptions,
    meta: redemptionsMeta,
    stats: redemptionStats,
    isLoading: redemptionsLoading,
    refetch: refetchRedemptions,
    fulfillRedemption,
    cancelRedemption,
    isFulfilling,
    isCancelling,
  } = useRedemptions();

  // ==========================================
  // TANSTACK TABLE STATES
  // ==========================================
  const [sponsorsGlobalFilter, setSponsorsGlobalFilter] = useState('');
  const [rewardsGlobalFilter, setRewardsGlobalFilter] = useState('');
  const [redemptionsGlobalFilter, setRedemptionsGlobalFilter] = useState('');

  const [sponsorsPagination, setSponsorsPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [rewardsPagination, setRewardsPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [redemptionsPagination, setRedemptionsPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // ==========================================
  // WEBSOCKET INTEGRATION
  // ==========================================
  useWebSocketSponsors({
    onSponsorCreated: useCallback((data: any) => {
      info(data.message || 'New sponsor added');
      refetchSponsors();
    }, [info, refetchSponsors]),

    onSponsorUpdated: useCallback((data: any) => {
      info(data.message || 'Sponsor updated');
      refetchSponsors();
    }, [info, refetchSponsors]),

    onSponsorDeleted: useCallback(() => {
      info('Sponsor deleted');
      refetchSponsors();
    }, [info, refetchSponsors]),

    onRewardCreated: useCallback((data: any) => {
      success(data.message || 'New reward available!');
      refetchRewards();
    }, [success, refetchRewards]),

    onRewardUpdated: useCallback(() => {
      refetchRewards();
    }, [refetchRewards]),

    onRewardDeleted: useCallback(() => {
      refetchRewards();
    }, [refetchRewards]),

    onRedemptionCreated: useCallback(() => {
      refetchRedemptions();
    }, [refetchRedemptions]),

    onRedemptionFulfilled: useCallback(() => {
      refetchRedemptions();
    }, [refetchRedemptions]),

    onRedemptionCancelled: useCallback(() => {
      refetchRedemptions();
    }, [refetchRedemptions]),
  });

  // ==========================================
  // STATE - DIALOGS
  // ==========================================
  const [createSponsorOpen, setCreateSponsorOpen] = useState(false);
  const [editSponsorOpen, setEditSponsorOpen] = useState(false);
  const [createRewardOpen, setCreateRewardOpen] = useState(false);
  const [editRewardOpen, setEditRewardOpen] = useState(false);
  const [deleteSponsorOpen, setDeleteSponsorOpen] = useState(false);
  const [deleteRewardOpen, setDeleteRewardOpen] = useState(false);
  const [fulfillRedemptionOpen, setFulfillRedemptionOpen] = useState(false);
  const [cancelRedemptionOpen, setCancelRedemptionOpen] = useState(false);
  const [viewRedemptionOpen, setViewRedemptionOpen] = useState(false);

  // ==========================================
  // STATE - IMAGE UPLOAD
  // ==========================================
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // STATE - SELECTED ITEMS
  // ==========================================
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [selectedReward, setSelectedReward] = useState<SponsorReward | null>(null);
  const [selectedRedemption, setSelectedRedemption] = useState<UserRedemption | null>(null);
  const [refundPoints, setRefundPoints] = useState(true);

  // ==========================================
  // STATE - FORMS
  // ==========================================
  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    logo_url: '',
    description: '',
    contact_email: '',
  });

  const [rewardForm, setRewardForm] = useState({
    sponsor_id: 0,
    title: '',
    description: '',
    points_cost: 100,
    quantity: null as number | null,
    display_on_leaderboard: true,
    expires_at: null as string | null,
  });

  // ==========================================
  // COMPUTED - STATISTICS
  // ==========================================
  const stats = useMemo(() => {
    return {
      totalSponsors: sponsorsMeta?.total || 0,
      activeSponsors: sponsors.filter((s) => s.is_active).length,
      totalRewards: rewardsMeta?.total || 0,
      activeRewards: rewards.filter((r) => r.is_active).length,
      totalRedemptions: redemptionsMeta?.total || 0,
      pendingRedemptions: redemptionStats?.redemptions?.pending || 0,
      fulfilledRedemptions: redemptionStats?.redemptions?.fulfilled || 0,
    };
  }, [sponsors, rewards, sponsorsMeta, rewardsMeta, redemptionsMeta, redemptionStats]);

  // ==========================================
  // TANSTACK TABLE COLUMN DEFINITIONS
  // ==========================================

  // Sponsors Columns
  const sponsorsColumns = useMemo<ColumnDef<Sponsor>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Sponsor',
        cell: ({ row }) => {
          const sponsor = row.original;
          return (
            <div className="flex items-center gap-3">
              {sponsor.logo_url ? (
                <img
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  className="w-10 h-10 rounded-lg object-cover border border-[#6CAC73]/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-[#2B4A2F] font-poppins text-sm">
                  {sponsor.name}
                </p>
                {sponsor.contact_email && (
                  <p className="text-xs text-gray-500 font-nunito">{sponsor.contact_email}</p>
                )}
              </div>
            </div>
          );
        },
        size: 250,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <p className="text-sm text-gray-600 font-nunito line-clamp-2">
            {row.original.description || 'No description'}
          </p>
        ),
        size: 300,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            className={`font-poppins border-0 ${
              row.original.is_active
                ? 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]'
                : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700'
            }`}
          >
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
        size: 100,
      },
      {
        accessorKey: 'rewards',
        header: 'Rewards',
        cell: ({ row }) => (
          <div className="text-sm text-gray-600 font-nunito">
            {row.original._count?.rewards || 0} rewards
          </div>
        ),
        size: 100,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const sponsor = row.original;
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => handleToggleSponsorStatus(sponsor)}
                disabled={isTogglingSponsor}
                className="h-8 w-8 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#6CAC73]"
              >
                {isTogglingSponsor ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : sponsor.is_active ? (
                  <ToggleRight className="w-4 h-4" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => handleOpenEditSponsor(sponsor)}
                className="h-8 w-8 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-blue-50 text-blue-600"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedSponsor(sponsor);
                  setDeleteSponsorOpen(true);
                }}
                className="h-8 w-8 p-0 border-rose-200 bg-white/80 hover:bg-rose-50 text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        },
        size: 120,
      },
    ],
    [isTogglingSponsor]
  );

  // Rewards Columns
  const rewardsColumns = useMemo<ColumnDef<SponsorReward>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Reward',
        cell: ({ row }) => {
          const reward = row.original;
          return (
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-[#2B4A2F] font-poppins text-sm">
                {reward.title}
              </p>
              <p className="text-xs text-gray-500 font-nunito">
                by {reward.sponsor?.name || 'Unknown'}
              </p>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <p className="text-sm text-gray-600 font-nunito line-clamp-2">
            {row.original.description || 'No description'}
          </p>
        ),
        size: 250,
      },
      {
        accessorKey: 'points_cost',
        header: 'Points',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
            <Award className="w-4 h-4" />
            {row.original.points_cost}
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: 'quantity',
        header: 'Stock',
        cell: ({ row }) => {
          const reward = row.original;
          if (reward.quantity === null) {
            return <span className="text-sm text-gray-500 font-nunito">Unlimited</span>;
          }
          return (
            <span className="text-sm text-gray-600 font-nunito">
              {reward.quantity - (reward.redeemed_count || 0)} / {reward.quantity}
            </span>
          );
        },
        size: 120,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            className={`font-poppins border-0 ${
              row.original.is_active
                ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700'
                : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700'
            }`}
          >
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
        size: 100,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const reward = row.original;
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => handleToggleRewardStatus(reward)}
                disabled={isTogglingReward}
                className="h-8 w-8 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#6CAC73]"
              >
                {isTogglingReward ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : reward.is_active ? (
                  <ToggleRight className="w-4 h-4" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => handleOpenEditReward(reward)}
                className="h-8 w-8 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-blue-50 text-blue-600"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedReward(reward);
                  setDeleteRewardOpen(true);
                }}
                className="h-8 w-8 p-0 border-rose-200 bg-white/80 hover:bg-rose-50 text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        },
        size: 120,
      },
    ],
    [isTogglingReward]
  );

  // Redemptions Columns
  const redemptionsColumns = useMemo<ColumnDef<UserRedemption>[]>(
    () => [
      {
        accessorKey: 'reward',
        header: 'Reward',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-[#2B4A2F] font-poppins text-sm">
              {row.original.reward?.title || 'Unknown Reward'}
            </p>
            <p className="text-xs text-gray-500 font-nunito">
              by {row.original.user?.username || 'Unknown User'}
            </p>
          </div>
        ),
        size: 200,
      },
      {
        accessorKey: 'user',
        header: 'User',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <p className="text-sm text-[#2B4A2F] font-poppins">
              {row.original.user?.username || 'Unknown'}
            </p>
            <p className="text-xs text-gray-500 font-nunito">
              {row.original.user?.email}
            </p>
          </div>
        ),
        size: 180,
      },
      {
        accessorKey: 'points_cost',
        header: 'Points',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
            <Award className="w-4 h-4" />
            {row.original.reward?.points_cost || 0}
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            className={`font-poppins border-0 ${
              row.original.status === 'fulfilled'
                ? 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]'
                : row.original.status === 'pending'
                ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-700'
                : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700'
            }`}
          >
            {row.original.status === 'fulfilled' && <CheckCircle className="w-3 h-3 mr-1" />}
            {row.original.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
            {row.original.status === 'cancelled' && <XCircle className="w-3 h-3 mr-1" />}
            {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
          </Badge>
        ),
        size: 120,
      },
      {
        accessorKey: 'claimed_at',
        header: 'Claimed',
        cell: ({ row }) => (
          <div className="text-sm text-gray-600 font-nunito">
            {new Date(row.original.claimed_at).toLocaleDateString()}
          </div>
        ),
        size: 120,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const redemption = row.original;
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => handleOpenViewRedemption(redemption)}
                className="h-8 w-8 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-blue-50 text-blue-600"
              >
                <Eye className="w-4 h-4" />
              </Button>
              {redemption.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedRedemption(redemption);
                      setFulfillRedemptionOpen(true);
                    }}
                    disabled={isFulfilling}
                    className="h-8 w-8 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#6CAC73]"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedRedemption(redemption);
                      setCancelRedemptionOpen(true);
                    }}
                    disabled={isCancelling}
                    className="h-8 w-8 p-0 border-rose-200 bg-white/80 hover:bg-rose-50 text-rose-600"
                  >
                    <Ban className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          );
        },
        size: 140,
      },
    ],
    [isFulfilling, isCancelling]
  );

  // ==========================================
  // TANSTACK TABLE INSTANCES
  // ==========================================

  const sponsorsTable = useReactTable({
    data: sponsors,
    columns: sponsorsColumns,
    state: {
      globalFilter: sponsorsGlobalFilter,
      pagination: sponsorsPagination,
    },
    onGlobalFilterChange: setSponsorsGlobalFilter,
    onPaginationChange: setSponsorsPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rewardsTable = useReactTable({
    data: rewards,
    columns: rewardsColumns,
    state: {
      globalFilter: rewardsGlobalFilter,
      pagination: rewardsPagination,
    },
    onGlobalFilterChange: setRewardsGlobalFilter,
    onPaginationChange: setRewardsPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const redemptionsTable = useReactTable({
    data: redemptions,
    columns: redemptionsColumns,
    state: {
      globalFilter: redemptionsGlobalFilter,
      pagination: redemptionsPagination,
    },
    onGlobalFilterChange: setRedemptionsGlobalFilter,
    onPaginationChange: setRedemptionsPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // ==========================================
  // HANDLERS - IMAGE UPLOAD
  // ==========================================
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      showError(validation.error || 'Invalid file');
      return;
    }

    try {
      setIsUploadingImage(true);
      const preview = await createImagePreview(file);
      setImagePreview(preview);
      const imageUrl = await uploadImageToS3(file);
      setSponsorForm((prev) => ({ ...prev, logo_url: imageUrl }));
      success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('❌ Image upload error:', error);
      showError(error?.message || 'Failed to upload image');
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSponsorForm((prev) => ({ ...prev, logo_url: '' }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ==========================================
  // HANDLERS - FORMS
  // ==========================================
  const resetSponsorForm = () => {
    setSponsorForm({
      name: '',
      logo_url: '',
      description: '',
      contact_email: '',
    });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetRewardForm = () => {
    setRewardForm({
      sponsor_id: 0,
      title: '',
      description: '',
      points_cost: 100,
      quantity: null,
      display_on_leaderboard: true,
      expires_at: null,
    });
  };

  // ==========================================
  // HANDLERS - SPONSORS
  // ==========================================
  const handleOpenCreateSponsor = () => {
    resetSponsorForm();
    setCreateSponsorOpen(true);
  };

  const handleOpenEditSponsor = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setSponsorForm({
      name: sponsor.name,
      logo_url: sponsor.logo_url || '',
      description: sponsor.description || '',
      contact_email: sponsor.contact_email || '',
    });
    setImagePreview(sponsor.logo_url || null);
    setEditSponsorOpen(true);
  };

  const handleCreateSponsor = async () => {
    if (!sponsorForm.name.trim()) {
      showError('Sponsor name is required');
      return;
    }

    try {
      await createSponsor(sponsorForm);
      setCreateSponsorOpen(false);
      resetSponsorForm();
    } catch (err: any) {
      showError(err.message || 'Failed to create sponsor');
    }
  };

  const handleUpdateSponsor = async () => {
    if (!selectedSponsor || !sponsorForm.name.trim()) {
      showError('Sponsor name is required');
      return;
    }

    try {
      await updateSponsor({ sponsorId: selectedSponsor.sponsor_id, data: sponsorForm });
      setEditSponsorOpen(false);
      setSelectedSponsor(null);
      resetSponsorForm();
    } catch (err: any) {
      showError(err.message || 'Failed to update sponsor');
    }
  };

  const handleDeleteSponsor = async () => {
    if (!selectedSponsor) return;
    try {
      await deleteSponsor(selectedSponsor.sponsor_id);
      setDeleteSponsorOpen(false);
      setSelectedSponsor(null);
    } catch (err: any) {
      showError(err.message || 'Failed to delete sponsor');
    }
  };

  const handleToggleSponsorStatus = async (sponsor: Sponsor) => {
    try {
      await toggleSponsorStatus(sponsor.sponsor_id);
    } catch (err: any) {
      showError(err.message || 'Failed to toggle status');
    }
  };

  // ==========================================
  // HANDLERS - REWARDS
  // ==========================================
  const handleOpenCreateReward = () => {
    resetRewardForm();
    const activeSponsors = sponsors.filter(s => s.is_active);
    if (activeSponsors.length > 0) {
      setRewardForm((prev) => ({ ...prev, sponsor_id: activeSponsors[0].sponsor_id }));
    }
    setCreateRewardOpen(true);
  };

  const handleOpenEditReward = (reward: SponsorReward) => {
    setSelectedReward(reward);
    setRewardForm({
      sponsor_id: reward.sponsor_id,
      title: reward.title,
      description: reward.description || '',
      points_cost: reward.points_cost,
      quantity: reward.quantity || null,
      display_on_leaderboard: reward.display_on_leaderboard,
      expires_at: reward.expires_at ? new Date(reward.expires_at).toISOString().split('T')[0] : null,
    });
    setEditRewardOpen(true);
  };

  const handleCreateReward = async () => {
    if (!rewardForm.title.trim() || rewardForm.sponsor_id === 0) {
      showError('Title and sponsor are required');
      return;
    }

    if (rewardForm.points_cost < 50 || rewardForm.points_cost > 10000) {
      showError('Points cost must be between 50 and 10,000');
      return;
    }

    try {
      await createReward(rewardForm);
      setCreateRewardOpen(false);
      resetRewardForm();
    } catch (err: any) {
      showError(err.message || 'Failed to create reward');
    }
  };

  const handleUpdateReward = async () => {
    if (!selectedReward || !rewardForm.title.trim()) {
      showError('Title is required');
      return;
    }

    if (rewardForm.points_cost < 50 || rewardForm.points_cost > 10000) {
      showError('Points cost must be between 50 and 10,000');
      return;
    }

    try {
      await updateReward({ rewardId: selectedReward.reward_id, data: rewardForm });
      setEditRewardOpen(false);
      setSelectedReward(null);
      resetRewardForm();
    } catch (err: any) {
      showError(err.message || 'Failed to update reward');
    }
  };

  const handleDeleteReward = async () => {
    if (!selectedReward) return;
    try {
      await deleteReward(selectedReward.reward_id);
      setDeleteRewardOpen(false);
      setSelectedReward(null);
    } catch (err: any) {
      showError(err.message || 'Failed to delete reward');
    }
  };

  const handleToggleRewardStatus = async (reward: SponsorReward) => {
    try {
      await toggleRewardStatus(reward.reward_id);
    } catch (err: any) {
      showError(err.message || 'Failed to toggle status');
    }
  };

  // ==========================================
  // HANDLERS - REDEMPTIONS
  // ==========================================
  const handleOpenViewRedemption = (redemption: UserRedemption) => {
    setSelectedRedemption(redemption);
    setViewRedemptionOpen(true);
  };

  const handleFulfillRedemption = async () => {
    if (!selectedRedemption) return;
    try {
      await fulfillRedemption(selectedRedemption.redemption_id);
      setFulfillRedemptionOpen(false);
      setSelectedRedemption(null);
    } catch (err: any) {
      showError(err.message || 'Failed to fulfill redemption');
    }
  };

  const handleCancelRedemption = async () => {
    if (!selectedRedemption) return;
    try {
      await cancelRedemption({ 
        redemptionId: selectedRedemption.redemption_id, 
        refundPoints 
      });
      setCancelRedemptionOpen(false);
      setSelectedRedemption(null);
      setRefundPoints(true);
    } catch (err: any) {
      showError(err.message || 'Failed to cancel redemption');
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-6 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#6CAC73] rounded-full opacity-20 animate-float"
            style={{
              left: `${10 + i * 18}%`,
              top: `${8 + (i % 3) * 20}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: '5s',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2B4A2F] font-poppins flex items-center gap-3">
                Sponsorships & Rewards
                <Badge className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-700 border border-purple-300 font-poppins animate-pulse">
                  <Wifi className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </h1>
              <p className="text-gray-600 mt-1 font-nunito">
                Manage sponsors, rewards, and user redemptions
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                refetchSponsors();
                refetchRewards();
                refetchRedemptions();
              }}
              disabled={sponsorsLoading || rewardsLoading || redemptionsLoading}
              className="border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
            >
              {sponsorsLoading || rewardsLoading || redemptionsLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleOpenCreateSponsor}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sponsor
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Sponsors', value: stats.totalSponsors, icon: Building2, color: 'text-purple-600' },
            { label: 'Active Rewards', value: stats.activeRewards, icon: Gift, color: 'text-blue-600' },
            { label: 'Pending Redemptions', value: stats.pendingRedemptions, icon: Clock, color: 'text-orange-600' },
            { label: 'Fulfilled', value: stats.fulfilledRedemptions, icon: CheckCircle, color: 'text-[#6CAC73]' },
          ].map((stat, i) => (
            <Card
              key={i}
              className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-[#6CAC73]/10 to-[#2B4A2F]/5 flex items-center justify-center mb-3">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2 font-nunito">{stat.label}</p>
                  <p className={`text-4xl font-bold font-poppins ${stat.color}`}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="sponsors" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/80 border border-[#6CAC73]/20">
            <TabsTrigger
              value="sponsors"
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white font-poppins"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Sponsors ({stats.totalSponsors})
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white font-poppins"
            >
              <Gift className="w-4 h-4 mr-2" />
              Rewards ({stats.totalRewards})
            </TabsTrigger>
            <TabsTrigger
              value="redemptions"
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-600 data-[state=active]:to-orange-700 data-[state=active]:text-white font-poppins"
            >
              <Package className="w-4 h-4 mr-2" />
              Redemptions ({stats.totalRedemptions})
            </TabsTrigger>
          </TabsList>

          {/* ==========================================
              SPONSORS TAB - WITH TANSTACK TABLE
              ========================================== */}
          <TabsContent value="sponsors">
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <CardTitle className="text-[#2B4A2F] font-poppins">Manage Sponsors</CardTitle>
                    <CardDescription className="font-nunito">
                      Companies and organizations providing rewards
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search sponsors..."
                        value={sponsorsGlobalFilter}
                        onChange={(e) => setSponsorsGlobalFilter(e.target.value)}
                        className="pl-10 border-[#6CAC73]/20 focus:border-[#6CAC73] w-64"
                      />
                    </div>
                    <Select
                      value={String(sponsorsTable.getState().pagination.pageSize)}
                      onValueChange={(value) => {
                        sponsorsTable.setPageSize(Number(value));
                      }}
                    >
                      <SelectTrigger className="w-32 border-[#6CAC73]/20">
                        <SelectValue placeholder="Page size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="20">20 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {sponsorsLoading ? (
                  <div className="text-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600 mb-4" />
                    <p className="text-gray-600 font-nunito">Loading sponsors...</p>
                  </div>
                ) : sponsors.length === 0 ? (
                  <div className="text-center py-16">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-poppins text-lg mb-2">No sponsors yet</p>
                    <p className="text-sm text-gray-400 font-nunito mb-4">
                      Add your first sponsor to get started
                    </p>
                    <Button
                      onClick={handleOpenCreateSponsor}
                      className="bg-gradient-to-br from-purple-600 to-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Sponsor
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border border-[#6CAC73]/20 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          {sponsorsTable.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="border-b border-[#6CAC73]/20 bg-gray-50/50">
                              {headerGroup.headers.map(header => (
                                <th 
                                  key={header.id} 
                                  className="text-left p-4 font-semibold text-[#2B4A2F] font-poppins"
                                  style={{ width: header.getSize() }}
                                >
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                              ))}
                            </tr>
                          ))}
                        </thead>
                        <tbody>
                          {sponsorsTable.getRowModel().rows.length === 0 ? (
                            <tr>
                              <td colSpan={sponsorsColumns.length} className="p-8 text-center">
                                <div className="flex flex-col items-center gap-3">
                                  <Building2 className="w-12 h-12 text-gray-300" />
                                  <p className="text-gray-500 font-medium font-poppins">No sponsors found</p>
                                  <p className="text-gray-400 text-sm font-nunito">Try adjusting your search</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            sponsorsTable.getRowModel().rows.map(row => (
                              <tr 
                                key={row.id} 
                                className="border-b border-[#6CAC73]/10 hover:bg-gray-50/50 transition-colors last:border-0"
                              >
                                {row.getVisibleCells().map(cell => (
                                  <td key={cell.id} className="p-4">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#6CAC73]/20">
                      <div className="text-sm text-gray-500 font-nunito">
                        Showing{' '}
                        <span className="font-semibold text-[#2B4A2F]">
                          {sponsorsTable.getRowModel().rows.length > 0 
                            ? (sponsorsTable.getState().pagination.pageIndex * sponsorsTable.getState().pagination.pageSize) + 1 
                            : 0
                          }
                        </span>{' '}
                        to{' '}
                        <span className="font-semibold text-[#2B4A2F]">
                          {Math.min(
                            (sponsorsTable.getState().pagination.pageIndex + 1) * sponsorsTable.getState().pagination.pageSize,
                            sponsors.length
                          )}
                        </span>{' '}
                        of <span className="font-semibold text-[#2B4A2F]">{sponsors.length}</span> sponsors
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500 font-nunito hidden sm:block">
                          Page <span className="font-semibold text-[#2B4A2F]">{sponsorsTable.getState().pagination.pageIndex + 1}</span>{' '}
                          of <span className="font-semibold text-[#2B4A2F]">{sponsorsTable.getPageCount()}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sponsorsTable.previousPage()}
                            disabled={!sponsorsTable.getCanPreviousPage()}
                            className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                          </Button>
                          
                          <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, sponsorsTable.getPageCount()) }, (_, i) => {
                              let pageIndex;
                              if (sponsorsTable.getPageCount() <= 5) {
                                pageIndex = i;
                              } else {
                                const startPage = Math.max(0, Math.min(sponsorsTable.getPageCount() - 5, sponsorsTable.getState().pagination.pageIndex - 2));
                                pageIndex = startPage + i;
                              }
                              
                              return (
                                <Button
                                  key={pageIndex}
                                  variant={sponsorsTable.getState().pagination.pageIndex === pageIndex ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => sponsorsTable.setPageIndex(pageIndex)}
                                  className={`min-w-9 h-9 p-0 ${
                                    sponsorsTable.getState().pagination.pageIndex === pageIndex
                                      ? 'bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] text-white border-0'
                                      : 'border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10'
                                  }`}
                                >
                                  {pageIndex + 1}
                                </Button>
                              );
                            })}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sponsorsTable.nextPage()}
                            disabled={!sponsorsTable.getCanNextPage()}
                            className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==========================================
              REWARDS TAB - WITH TANSTACK TABLE
              ========================================== */}
          <TabsContent value="rewards">
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <CardTitle className="text-[#2B4A2F] font-poppins">Reward Catalog</CardTitle>
                    <CardDescription className="font-nunito">
                      Points-based rewards users can redeem
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search rewards..."
                        value={rewardsGlobalFilter}
                        onChange={(e) => setRewardsGlobalFilter(e.target.value)}
                        className="pl-10 border-[#6CAC73]/20 focus:border-[#6CAC73] w-64"
                      />
                    </div>
                    <Select
                      value={String(rewardsTable.getState().pagination.pageSize)}
                      onValueChange={(value) => {
                        rewardsTable.setPageSize(Number(value));
                      }}
                    >
                      <SelectTrigger className="w-32 border-[#6CAC73]/20">
                        <SelectValue placeholder="Page size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="20">20 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={handleOpenCreateReward}
                      disabled={sponsors.filter(s => s.is_active).length === 0}
                      className="bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Reward
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {rewardsLoading ? (
                  <div className="text-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
                    <p className="text-gray-600 font-nunito">Loading rewards...</p>
                  </div>
                ) : rewards.length === 0 ? (
                  <div className="text-center py-16">
                    <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-poppins text-lg mb-2">No rewards yet</p>
                    <p className="text-sm text-gray-400 font-nunito mb-4">
                      {sponsors.length === 0 
                        ? 'Add a sponsor first before creating rewards' 
                        : 'Create your first reward to get started'}
                    </p>
                    {sponsors.filter(s => s.is_active).length > 0 && (
                      <Button
                        onClick={handleOpenCreateReward}
                        className="bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Reward
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border border-[#6CAC73]/20 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          {rewardsTable.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="border-b border-[#6CAC73]/20 bg-gray-50/50">
                              {headerGroup.headers.map(header => (
                                <th 
                                  key={header.id} 
                                  className="text-left p-4 font-semibold text-[#2B4A2F] font-poppins"
                                  style={{ width: header.getSize() }}
                                >
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                              ))}
                            </tr>
                          ))}
                        </thead>
                        <tbody>
                          {rewardsTable.getRowModel().rows.length === 0 ? (
                            <tr>
                              <td colSpan={rewardsColumns.length} className="p-8 text-center">
                                <div className="flex flex-col items-center gap-3">
                                  <Gift className="w-12 h-12 text-gray-300" />
                                  <p className="text-gray-500 font-medium font-poppins">No rewards found</p>
                                  <p className="text-gray-400 text-sm font-nunito">Try adjusting your search</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            rewardsTable.getRowModel().rows.map(row => (
                              <tr 
                                key={row.id} 
                                className="border-b border-[#6CAC73]/10 hover:bg-gray-50/50 transition-colors last:border-0"
                              >
                                {row.getVisibleCells().map(cell => (
                                  <td key={cell.id} className="p-4">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#6CAC73]/20">
                      <div className="text-sm text-gray-500 font-nunito">
                        Showing{' '}
                        <span className="font-semibold text-[#2B4A2F]">
                          {rewardsTable.getRowModel().rows.length > 0 
                            ? (rewardsTable.getState().pagination.pageIndex * rewardsTable.getState().pagination.pageSize) + 1 
                            : 0
                          }
                        </span>{' '}
                        to{' '}
                        <span className="font-semibold text-[#2B4A2F]">
                          {Math.min(
                            (rewardsTable.getState().pagination.pageIndex + 1) * rewardsTable.getState().pagination.pageSize,
                            rewards.length
                          )}
                        </span>{' '}
                        of <span className="font-semibold text-[#2B4A2F]">{rewards.length}</span> rewards
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500 font-nunito hidden sm:block">
                          Page <span className="font-semibold text-[#2B4A2F]">{rewardsTable.getState().pagination.pageIndex + 1}</span>{' '}
                          of <span className="font-semibold text-[#2B4A2F]">{rewardsTable.getPageCount()}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rewardsTable.previousPage()}
                            disabled={!rewardsTable.getCanPreviousPage()}
                            className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                          </Button>
                          
                          <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, rewardsTable.getPageCount()) }, (_, i) => {
                              let pageIndex;
                              if (rewardsTable.getPageCount() <= 5) {
                                pageIndex = i;
                              } else {
                                const startPage = Math.max(0, Math.min(rewardsTable.getPageCount() - 5, rewardsTable.getState().pagination.pageIndex - 2));
                                pageIndex = startPage + i;
                              }
                              
                              return (
                                <Button
                                  key={pageIndex}
                                  variant={rewardsTable.getState().pagination.pageIndex === pageIndex ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => rewardsTable.setPageIndex(pageIndex)}
                                  className={`min-w-9 h-9 p-0 ${
                                    rewardsTable.getState().pagination.pageIndex === pageIndex
                                      ? 'bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] text-white border-0'
                                      : 'border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10'
                                  }`}
                                >
                                  {pageIndex + 1}
                                </Button>
                              );
                            })}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rewardsTable.nextPage()}
                            disabled={!rewardsTable.getCanNextPage()}
                            className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==========================================
              REDEMPTIONS TAB - WITH TANSTACK TABLE
              ========================================== */}
          <TabsContent value="redemptions">
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <CardTitle className="text-[#2B4A2F] font-poppins">User Redemptions</CardTitle>
                    <CardDescription className="font-nunito">
                      Track and fulfill user reward redemptions
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search redemptions..."
                        value={redemptionsGlobalFilter}
                        onChange={(e) => setRedemptionsGlobalFilter(e.target.value)}
                        className="pl-10 border-[#6CAC73]/20 focus:border-[#6CAC73] w-64"
                      />
                    </div>
                    <Select
                      value={String(redemptionsTable.getState().pagination.pageSize)}
                      onValueChange={(value) => {
                        redemptionsTable.setPageSize(Number(value));
                      }}
                    >
                      <SelectTrigger className="w-32 border-[#6CAC73]/20">
                        <SelectValue placeholder="Page size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="20">20 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {redemptionsLoading ? (
                  <div className="text-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-orange-600 mb-4" />
                    <p className="text-gray-600 font-nunito">Loading redemptions...</p>
                  </div>
                ) : redemptions.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-poppins text-lg mb-2">No redemptions yet</p>
                    <p className="text-sm text-gray-400 font-nunito">
                      Redemptions will appear here when users redeem rewards
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border border-[#6CAC73]/20 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          {redemptionsTable.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="border-b border-[#6CAC73]/20 bg-gray-50/50">
                              {headerGroup.headers.map(header => (
                                <th 
                                  key={header.id} 
                                  className="text-left p-4 font-semibold text-[#2B4A2F] font-poppins"
                                  style={{ width: header.getSize() }}
                                >
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                              ))}
                            </tr>
                          ))}
                        </thead>
                        <tbody>
                          {redemptionsTable.getRowModel().rows.length === 0 ? (
                            <tr>
                              <td colSpan={redemptionsColumns.length} className="p-8 text-center">
                                <div className="flex flex-col items-center gap-3">
                                  <Package className="w-12 h-12 text-gray-300" />
                                  <p className="text-gray-500 font-medium font-poppins">No redemptions found</p>
                                  <p className="text-gray-400 text-sm font-nunito">Try adjusting your search</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            redemptionsTable.getRowModel().rows.map(row => (
                              <tr 
                                key={row.id} 
                                className="border-b border-[#6CAC73]/10 hover:bg-gray-50/50 transition-colors last:border-0"
                              >
                                {row.getVisibleCells().map(cell => (
                                  <td key={cell.id} className="p-4">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#6CAC73]/20">
                      <div className="text-sm text-gray-500 font-nunito">
                        Showing{' '}
                        <span className="font-semibold text-[#2B4A2F]">
                          {redemptionsTable.getRowModel().rows.length > 0 
                            ? (redemptionsTable.getState().pagination.pageIndex * redemptionsTable.getState().pagination.pageSize) + 1 
                            : 0
                          }
                        </span>{' '}
                        to{' '}
                        <span className="font-semibold text-[#2B4A2F]">
                          {Math.min(
                            (redemptionsTable.getState().pagination.pageIndex + 1) * redemptionsTable.getState().pagination.pageSize,
                            redemptions.length
                          )}
                        </span>{' '}
                        of <span className="font-semibold text-[#2B4A2F]">{redemptions.length}</span> redemptions
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500 font-nunito hidden sm:block">
                          Page <span className="font-semibold text-[#2B4A2F]">{redemptionsTable.getState().pagination.pageIndex + 1}</span>{' '}
                          of <span className="font-semibold text-[#2B4A2F]">{redemptionsTable.getPageCount()}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => redemptionsTable.previousPage()}
                            disabled={!redemptionsTable.getCanPreviousPage()}
                            className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                          </Button>
                          
                          <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, redemptionsTable.getPageCount()) }, (_, i) => {
                              let pageIndex;
                              if (redemptionsTable.getPageCount() <= 5) {
                                pageIndex = i;
                              } else {
                                const startPage = Math.max(0, Math.min(redemptionsTable.getPageCount() - 5, redemptionsTable.getState().pagination.pageIndex - 2));
                                pageIndex = startPage + i;
                              }
                              
                              return (
                                <Button
                                  key={pageIndex}
                                  variant={redemptionsTable.getState().pagination.pageIndex === pageIndex ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => redemptionsTable.setPageIndex(pageIndex)}
                                  className={`min-w-9 h-9 p-0 ${
                                    redemptionsTable.getState().pagination.pageIndex === pageIndex
                                      ? 'bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] text-white border-0'
                                      : 'border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10'
                                  }`}
                                >
                                  {pageIndex + 1}
                                </Button>
                              );
                            })}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => redemptionsTable.nextPage()}
                            disabled={!redemptionsTable.getCanNextPage()}
                            className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ==========================================
            DIALOGS - COMPLETE SET
            ========================================== */}

        {/* Create/Edit Sponsor Dialog */}
        <Dialog
          open={createSponsorOpen || editSponsorOpen}
          onOpenChange={(open) => {
            if (!open) {
              setCreateSponsorOpen(false);
              setEditSponsorOpen(false);
              setSelectedSponsor(null);
              resetSponsorForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-[#2B4A2F] font-poppins">
                {editSponsorOpen ? 'Edit Sponsor' : 'Add New Sponsor'}
              </DialogTitle>
              <DialogDescription className="font-nunito">
                {editSponsorOpen ? 'Update sponsor details' : 'Add a new sponsoring organization'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label className="text-[#2B4A2F] font-poppins">
                  Sponsor Logo
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {imagePreview || sponsorForm.logo_url ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-[#6CAC73]/20">
                        <img
                          src={imagePreview || sponsorForm.logo_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={handleRemoveImage}
                          disabled={isUploadingImage}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 hover:bg-rose-700 disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center border-2 border-dashed border-purple-300">
                        <ImageIcon className="w-8 h-8 text-purple-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full border-[#6CAC73]/20 bg-white/80 hover:bg-purple-50 text-purple-600"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading to S3...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {imagePreview || sponsorForm.logo_url ? 'Change Logo' : 'Upload Logo'}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WEBP up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#2B4A2F] font-poppins">
                  Sponsor Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={sponsorForm.name}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                  placeholder="e.g., EcoTech Solutions"
                  className="border-[#6CAC73]/20"
                  disabled={isUploadingImage}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#2B4A2F] font-poppins">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={sponsorForm.description}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, description: e.target.value })}
                  placeholder="Brief description of the sponsor..."
                  rows={3}
                  className="border-[#6CAC73]/20"
                  disabled={isUploadingImage}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email" className="text-[#2B4A2F] font-poppins">
                  Contact Email
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={sponsorForm.contact_email}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, contact_email: e.target.value })}
                  placeholder="contact@sponsor.com"
                  className="border-[#6CAC73]/20"
                  disabled={isUploadingImage}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                onClick={() => {
                  setCreateSponsorOpen(false);
                  setEditSponsorOpen(false);
                  resetSponsorForm();
                }}
                disabled={isCreatingSponsor || isUpdatingSponsor || isUploadingImage}
                className="border-[#6CAC73]/20 bg-white/80"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={editSponsorOpen ? handleUpdateSponsor : handleCreateSponsor}
                disabled={isCreatingSponsor || isUpdatingSponsor || isUploadingImage}
                className="bg-gradient-to-br from-purple-600 to-purple-700 text-white"
              >
                {isCreatingSponsor || isUpdatingSponsor ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editSponsorOpen ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editSponsorOpen ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create/Edit Reward Dialog */}
        <Dialog
          open={createRewardOpen || editRewardOpen}
          onOpenChange={(open) => {
            if (!open) {
              setCreateRewardOpen(false);
              setEditRewardOpen(false);
              setSelectedReward(null);
              resetRewardForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-[#2B4A2F] font-poppins">
                {editRewardOpen ? 'Edit Reward' : 'Add New Reward'}
              </DialogTitle>
              <DialogDescription className="font-nunito">
                {editRewardOpen ? 'Update reward details' : 'Create a new points-based reward'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reward-sponsor" className="text-[#2B4A2F] font-poppins">
                  Sponsor <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={rewardForm.sponsor_id.toString()}
                  onValueChange={(value) => setRewardForm({ ...rewardForm, sponsor_id: parseInt(value) })}
                  disabled={editRewardOpen}
                >
                  <SelectTrigger className="border-[#6CAC73]/20">
                    <SelectValue placeholder="Select sponsor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sponsors.filter(s => s.is_active).map((sponsor) => (
                      <SelectItem key={sponsor.sponsor_id} value={sponsor.sponsor_id.toString()}>
                        {sponsor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-title" className="text-[#2B4A2F] font-poppins">
                  Reward Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reward-title"
                  value={rewardForm.title}
                  onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                  placeholder="e.g., $10 Gift Card"
                  className="border-[#6CAC73]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-description" className="text-[#2B4A2F] font-poppins">
                  Description
                </Label>
                <Textarea
                  id="reward-description"
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                  placeholder="Brief description of the reward..."
                  rows={3}
                  className="border-[#6CAC73]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reward-points" className="text-[#2B4A2F] font-poppins">
                    Points Cost <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reward-points"
                    type="number"
                    min="50"
                    max="10000"
                    value={rewardForm.points_cost}
                    onChange={(e) => setRewardForm({ ...rewardForm, points_cost: parseInt(e.target.value) || 100 })}
                    className="border-[#6CAC73]/20"
                  />
                  <p className="text-xs text-gray-500">Between 50 and 10,000 points</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reward-quantity" className="text-[#2B4A2F] font-poppins">
                    Quantity (Optional)
                  </Label>
                  <Input
                    id="reward-quantity"
                    type="number"
                    min="1"
                    value={rewardForm.quantity || ''}
                    onChange={(e) => setRewardForm({ ...rewardForm, quantity: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Unlimited"
                    className="border-[#6CAC73]/20"
                  />
                  <p className="text-xs text-gray-500">Leave empty for unlimited</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-expires" className="text-[#2B4A2F] font-poppins">
                  Expiration Date (Optional)
                </Label>
                <Input
                  id="reward-expires"
                  type="date"
                  value={rewardForm.expires_at || ''}
                  onChange={(e) => setRewardForm({ ...rewardForm, expires_at: e.target.value || null })}
                  className="border-[#6CAC73]/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reward-leaderboard"
                  checked={rewardForm.display_on_leaderboard}
                  onChange={(e) => setRewardForm({ ...rewardForm, display_on_leaderboard: e.target.checked })}
                  className="rounded border-[#6CAC73]/20"
                />
                <Label htmlFor="reward-leaderboard" className="text-[#2B4A2F] font-poppins cursor-pointer">
                  Display on leaderboard
                </Label>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                onClick={() => {
                  setCreateRewardOpen(false);
                  setEditRewardOpen(false);
                  resetRewardForm();
                }}
                disabled={isCreatingReward || isUpdatingReward}
                className="border-[#6CAC73]/20 bg-white/80"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={editRewardOpen ? handleUpdateReward : handleCreateReward}
                disabled={isCreatingReward || isUpdatingReward}
                className="bg-gradient-to-br from-blue-600 to-blue-700 text-white"
              >
                {isCreatingReward || isUpdatingReward ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editRewardOpen ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editRewardOpen ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Sponsor Confirmation */}
        <AlertDialog open={deleteSponsorOpen} onOpenChange={setDeleteSponsorOpen}>
          <AlertDialogContent className="border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#2B4A2F] font-poppins">
                Delete Sponsor?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-nunito">
                Are you sure you want to delete "{selectedSponsor?.name}"? This action cannot be undone.
                All associated rewards will also be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#6CAC73]/20">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSponsor}
                disabled={isDeletingSponsor}
                className="bg-gradient-to-br from-rose-600 to-rose-700 text-white"
              >
                {isDeletingSponsor ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Reward Confirmation */}
        <AlertDialog open={deleteRewardOpen} onOpenChange={setDeleteRewardOpen}>
          <AlertDialogContent className="border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#2B4A2F] font-poppins">
                Delete Reward?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-nunito">
                Are you sure you want to delete "{selectedReward?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#6CAC73]/20">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteReward}
                disabled={isDeletingReward}
                className="bg-gradient-to-br from-rose-600 to-rose-700 text-white"
              >
                {isDeletingReward ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Fulfill Redemption Confirmation */}
        <AlertDialog open={fulfillRedemptionOpen} onOpenChange={setFulfillRedemptionOpen}>
          <AlertDialogContent className="border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#2B4A2F] font-poppins">
                Fulfill Redemption?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-nunito">
                Mark this redemption as fulfilled? The user will be notified.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#6CAC73]/20">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleFulfillRedemption}
                disabled={isFulfilling}
                className="bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] text-white"
              >
                {isFulfilling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fulfilling...
                  </>
                ) : (
                  'Fulfill'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Redemption Dialog */}
        <AlertDialog open={cancelRedemptionOpen} onOpenChange={setCancelRedemptionOpen}>
          <AlertDialogContent className="border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#2B4A2F] font-poppins">
                Cancel Redemption?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-nunito space-y-3">
                <p>Are you sure you want to cancel this redemption?</p>
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="refund-points-check"
                    checked={refundPoints}
                    onChange={(e) => setRefundPoints(e.target.checked)}
                    className="rounded border-blue-300"
                  />
                  <label htmlFor="refund-points-check" className="text-sm text-blue-800 font-medium cursor-pointer">
                    Refund {selectedRedemption?.reward?.points_cost || 0} points to user
                  </label>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className="border-[#6CAC73]/20"
                onClick={() => setRefundPoints(true)}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelRedemption}
                disabled={isCancelling}
                className="bg-gradient-to-br from-rose-600 to-rose-700 text-white"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Redemption'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Redemption Dialog */}
        <Dialog open={viewRedemptionOpen} onOpenChange={setViewRedemptionOpen}>
          <DialogContent className="max-w-2xl border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-[#2B4A2F] font-poppins">Redemption Details</DialogTitle>
            </DialogHeader>
            {selectedRedemption && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600 text-xs">Reward</Label>
                    <p className="font-semibold text-[#2B4A2F]">{selectedRedemption.reward?.title}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-xs">Status</Label>
                    <Badge className={`font-poppins border-0 mt-1 ${
                      selectedRedemption.status === 'fulfilled'
                        ? 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]'
                        : selectedRedemption.status === 'pending'
                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-700'
                        : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700'
                    }`}>
                      {selectedRedemption.status.charAt(0).toUpperCase() + selectedRedemption.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-xs">User</Label>
                    <p className="font-semibold text-[#2B4A2F]">{selectedRedemption.user?.username}</p>
                    <p className="text-sm text-gray-500">{selectedRedemption.user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-xs">Points Cost</Label>
                    <p className="font-semibold text-blue-600 flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {selectedRedemption.reward?.points_cost || 0} points
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-xs">Claimed At</Label>
                    <p className="text-sm text-gray-700">
                      {new Date(selectedRedemption.claimed_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedRedemption.fulfilled_at && (
                    <div>
                      <Label className="text-gray-600 text-xs">Fulfilled At</Label>
                      <p className="text-sm text-[#6CAC73]">
                        {new Date(selectedRedemption.fulfilled_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                {selectedRedemption.reward?.description && (
                  <div>
                    <Label className="text-gray-600 text-xs">Reward Description</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedRedemption.reward.description}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setViewRedemptionOpen(false)} className="border-[#6CAC73]/20 bg-white/80">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}