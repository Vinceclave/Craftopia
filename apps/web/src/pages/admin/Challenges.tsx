import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Plus,
  Loader2,
  RefreshCw,
  Sparkles,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Wifi,
  Image as ImageIcon,
  User,
  Calendar,
  Award,
} from 'lucide-react';
import {
  DataTable,
  PageHeader,
  StatsGrid,
  PageContainer,
  LoadingState,
  ErrorState,
  ActionButtons,
  DetailModal,
  ConfirmDialog,
  type DetailSection,
  type ActionButton,
} from '@/components/shared';
import { useChallenges } from '@/hooks/useChallenges';
import { useWebSocketChallenges } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
import { challengesAPI, type Challenge, type UserChallenge } from '@/lib/api';

type ChallengeCategory = 'daily' | 'weekly' | 'monthly';
type ChallengeStatusFilter = 'all' | 'active' | 'inactive';
type UserChallengeStatusFilter = 'all' | 'in_progress' | 'pending_verification' | 'completed' | 'rejected';

// Helper function to get full image URL
const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const backendUrl = 'http://localhost:3001';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${backendUrl}/${cleanPath}`;
};

// Status badge helper for user challenges
const UserChallengeStatusBadge = ({ status }: { status: string }) => {
  const config = {
    in_progress: {
      icon: Clock,
      label: 'In Progress',
      className: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    pending_verification: {
      icon: AlertCircle,
      label: 'Pending',
      className: 'bg-orange-100 text-orange-700 border-orange-200',
    },
    completed: {
      icon: CheckCircle,
      label: 'Completed',
      className: 'bg-green-100 text-green-700 border-green-200',
    },
    rejected: {
      icon: XCircle,
      label: 'Rejected',
      className: 'bg-red-100 text-red-700 border-red-200',
    },
  }[status] || {
    icon: AlertCircle,
    label: status,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const Icon = config.icon;

  return (
    <Badge className={`${config.className} border font-nunito`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

// Validation helper
const validateChallengeForm = (data: any) => {
  const errors: Record<string, string> = {};
  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length < 5) {
    errors.title = 'Title must be at least 5 characters';
  } else if (data.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }
  if (!data.description?.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  } else if (data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }
  if (!data.points_reward || data.points_reward < 5) {
    errors.points_reward = 'Points must be at least 5';
  } else if (data.points_reward > 100) {
    errors.points_reward = 'Points cannot exceed 100';
  }
  if (data.waste_kg && (data.waste_kg < 0 || data.waste_kg > 50)) {
    errors.waste_kg = 'Waste must be between 0 and 50 kg';
  }
  return errors;
};

export default function AdminChallenges() {
  const {
    challenges,
    isLoading,
    error,
    category,
    setCategory,
    refetch,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    toggleStatus,
    generateAIChallenge,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
    isGenerating,
    stats: challengeStats,
  } = useChallenges();

  const { success, error: showError, info } = useToast();

  // Separate filters for each tab
  const [challengeStatusFilter, setChallengeStatusFilter] = useState<ChallengeStatusFilter>('all');
  const [userChallengeStatusFilter, setUserChallengeStatusFilter] = useState<UserChallengeStatusFilter>('pending_verification');
  const [challengeSearchQuery, setChallengeSearchQuery] = useState('');
  const [userChallengeSearchQuery, setUserChallengeSearchQuery] = useState('');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [challengeDetailsOpen, setChallengeDetailsOpen] = useState(false);
  const [userChallengeDetailsOpen, setUserChallengeDetailsOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [aiConfirmDialogOpen, setAiConfirmDialogOpen] = useState(false);

  // Selected items
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [selectedUserChallenge, setSelectedUserChallenge] = useState<UserChallenge | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points_reward: 25,
    waste_kg: 0,
    material_type: 'plastic',
    category: 'daily',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiCategory, setAiCategory] = useState<ChallengeCategory>('daily');

  // ✅ FIX: Fetch user challenges with proper caching
  const {
    data: userChallengesData,
    isLoading: isUserChallengesLoading,
    refetch: refetchUserChallenges,
  } = useQuery({
    queryKey: ['admin-user-challenges', userChallengeStatusFilter],
    queryFn: async () => {
      const filters: any = {};
      if (userChallengeStatusFilter !== 'all') {
        filters.status = userChallengeStatusFilter;
      }
      const response = await challengesAPI.getAllUserChallenges(1, 100, filters);
      return response?.data || [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // ✅ 5 minutes - data stays fresh longer
    gcTime: 10 * 60 * 1000, // ✅ 10 minutes - cache persists
    refetchOnWindowFocus: false, // ✅ Don't refetch when window regains focus
    refetchOnMount: false, // ✅ Don't refetch on component mount if data exists
    refetchOnReconnect: true,
  });

  // WebSocket handlers
  const handleChallengeCreated = useCallback(
    (data: any) => {
      info(data?.message || 'New challenge available!');
      refetch();
    },
    [refetch, info]
  );

  const handleChallengeUpdated = useCallback(
    (data: any) => {
      info(data?.message || 'A challenge was updated');
      refetch();
    },
    [refetch, info]
  );

  const handleChallengeDeleted = useCallback(
    (data: any) => {
      info(data?.message || 'A challenge was removed');
      refetch();
    },
    [refetch, info]
  );

  const handleChallengeCompleted = useCallback(() => {
    info('New submission needs verification!');
    refetchUserChallenges();
  }, [refetchUserChallenges, info]);

  const handleChallengeVerified = useCallback(() => {
    success('A challenge has been verified!');
    refetchUserChallenges();
  }, [refetchUserChallenges, success]);

  useWebSocketChallenges({
    onCreated: handleChallengeCreated,
    onUpdated: handleChallengeUpdated,
    onDeleted: handleChallengeDeleted,
    onCompleted: handleChallengeCompleted,
    onVerified: handleChallengeVerified,
  });

  // Form management
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      points_reward: 25,
      waste_kg: 0,
      material_type: 'plastic',
      category: 'daily',
    });
    setFormErrors({});
  };

  const handleOpenCreate = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  // ✅ FIX: Edit functionality - removed AI check restriction
  const handleOpenEdit = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      points_reward: challenge.points_reward,
      waste_kg: challenge.waste_kg || 0,
      material_type: challenge.material_type,
      category: challenge.category,
    });
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setDeleteDialogOpen(true);
  };

  const handleOpenToggle = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setToggleDialogOpen(true);
  };

  const handleViewChallengeDetails = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setChallengeDetailsOpen(true);
  };

  const handleViewUserChallengeDetails = (userChallenge: UserChallenge) => {
    setSelectedUserChallenge(userChallenge);
    setUserChallengeDetailsOpen(true);
  };

  const handleOpenVerify = (userChallenge: UserChallenge) => {
    setSelectedUserChallenge(userChallenge);
    setVerificationNotes('');
    setVerifyDialogOpen(true);
  };

  // CRUD operations
  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateChallengeForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      await createChallenge({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
      });
      success('Challenge created successfully!');
      setCreateDialogOpen(false);
      resetForm();
    } catch (err: any) {
      showError(err?.message || 'Failed to create challenge');
    }
  };

  // ✅ FIX: Update challenge functionality
  const handleUpdateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge) return;
    
    const errors = validateChallengeForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      await updateChallenge({
        challengeId: selectedChallenge.challenge_id,
        data: {
          ...formData,
          title: formData.title.trim(),
          description: formData.description.trim(),
        },
      });
      success('Challenge updated successfully!');
      setEditDialogOpen(false);
      setSelectedChallenge(null);
      resetForm();
    } catch (err: any) {
      showError(err?.message || 'Failed to update challenge');
    }
  };

  // ✅ FIX: Delete challenge functionality
  const handleConfirmDelete = async () => {
    if (!selectedChallenge) return;
    try {
      await deleteChallenge(selectedChallenge.challenge_id);
      success('Challenge deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedChallenge(null);
    } catch (err: any) {
      showError(err?.message || 'Failed to delete challenge');
    }
  };

  // ✅ FIX: Toggle status functionality
  const handleConfirmToggle = async () => {
    if (!selectedChallenge) return;
    try {
      await toggleStatus(selectedChallenge.challenge_id);
      const newStatus = !selectedChallenge.is_active;
      success(`Challenge ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      setToggleDialogOpen(false);
      setSelectedChallenge(null);
    } catch (err: any) {
      showError(err?.message || 'Failed to toggle status');
    }
  };

  const handleGenerateAI = async () => {
    try {
      await generateAIChallenge(aiCategory);
      success(`AI challenge for ${aiCategory} category generated!`);
      setAiConfirmDialogOpen(false);
    } catch (err: any) {
      showError(err?.message || 'Failed to generate AI challenge');
    }
  };

  const handleManualVerify = async (approved: boolean) => {
    if (!selectedUserChallenge) return;
    try {
      setIsVerifying(true);
      const response = await challengesAPI.manualVerify(
        selectedUserChallenge.user_challenge_id,
        approved,
        verificationNotes.trim() || undefined
      );
      if (response.success) {
        success(approved ? 'Challenge approved!' : 'Challenge rejected');
        setVerifyDialogOpen(false);
        setSelectedUserChallenge(null);
        setVerificationNotes('');
        refetchUserChallenges();
      }
    } catch (err: any) {
      showError(err?.message || 'Failed to verify challenge');
    } finally {
      setIsVerifying(false);
    }
  };

  // Data normalization
  const challengeList = useMemo(() => {
    if (Array.isArray(challenges)) return challenges;
    if (challenges && typeof challenges === 'object' && 'data' in challenges) {
      return (challenges as any).data ?? [];
    }
    return [];
  }, [challenges]);

  const userChallengeList = useMemo(() => {
    if (Array.isArray(userChallengesData)) return userChallengesData;
    if (userChallengesData && typeof userChallengesData === 'object' && 'data' in userChallengesData) {
      return (userChallengesData as any).data ?? [];
    }
    return [];
  }, [userChallengesData]);

  // Filtered challenges
  const filteredChallenges = useMemo(() => {
    let filtered = challengeList;

    // Status filter
    if (challengeStatusFilter === 'active') {
      filtered = filtered.filter((c: Challenge) => c.is_active);
    } else if (challengeStatusFilter === 'inactive') {
      filtered = filtered.filter((c: Challenge) => !c.is_active);
    }

    // Search filter
    if (challengeSearchQuery.trim()) {
      const query = challengeSearchQuery.toLowerCase();
      filtered = filtered.filter((c: Challenge) =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.material_type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [challengeList, challengeStatusFilter, challengeSearchQuery]);

  // Filtered user challenges
  const filteredUserChallenges = useMemo(() => {
    if (!userChallengeSearchQuery.trim()) return userChallengeList;
    const query = userChallengeSearchQuery.toLowerCase();
    return userChallengeList.filter((uc: UserChallenge) =>
      uc.challenge?.title?.toLowerCase().includes(query) ||
      uc.user?.username?.toLowerCase().includes(query) ||
      uc.user?.email?.toLowerCase().includes(query)
    );
  }, [userChallengeList, userChallengeSearchQuery]);

  // User challenge stats
  const userChallengeStats = useMemo(() => {
    return {
      total: userChallengeList.length,
      inProgress: userChallengeList.filter((uc: UserChallenge) => uc.status === 'in_progress').length,
      pending: userChallengeList.filter((uc: UserChallenge) => uc.status === 'pending_verification').length,
      completed: userChallengeList.filter((uc: UserChallenge) => uc.status === 'completed').length,
      rejected: userChallengeList.filter((uc: UserChallenge) => uc.status === 'rejected').length,
    };
  }, [userChallengeList]);

  // Challenge table columns
  const challengeColumns: ColumnDef<Challenge>[] = [
    {
      accessorKey: 'title',
      header: 'Challenge',
      cell: ({ row }) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#2B4A2F] font-poppins">{row.original.title}</span>
            {row.original.source === 'ai' && (
              <Badge className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-700 border-0 font-poppins">
                <Sparkles className="w-3 h-3 mr-1" />
                AI
              </Badge>
            )}
            {row.original.source === 'admin' && (
              <Badge className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border-0 font-poppins">
                <Users className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className="capitalize text-xs border-0 bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] font-poppins">
              <TrendingUp className="w-3 h-3 mr-1" />
              {row.original.category}
            </Badge>
            <Badge className="capitalize text-xs border-0 bg-white/80 border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
              {row.original.material_type}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          className={`font-poppins border-0 ${
            row.original.is_active
              ? 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]'
              : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700'
          }`}
        >
          {row.original.is_active ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Inactive
            </>
          )}
        </Badge>
      ),
    },
    {
      accessorKey: 'points_reward',
      header: 'Points',
      cell: ({ row }) => (
        <Badge className="text-xs bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0 font-poppins">
          <Trophy className="w-3 h-3 mr-1" />
          {row.original.points_reward}
        </Badge>
      ),
    },
    {
      accessorKey: 'waste_kg',
      header: 'Waste (kg)',
      cell: ({ row }) => (
        <span className="text-[#2B4A2F] font-nunito">
          {row.original.waste_kg > 0 ? `${row.original.waste_kg} kg` : '—'}
        </span>
      ),
    },
    {
      accessorKey: '_count.participants',
      header: 'Participants',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-[#6CAC73]" />
          <span className="text-[#2B4A2F] font-nunito">{row.original._count?.participants || 0}</span>
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
            onClick: () => handleViewChallengeDetails(row.original),
            variant: 'info',
          },
          {
            icon: row.original.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />,
            label: row.original.is_active ? 'Deactivate' : 'Activate',
            onClick: () => handleOpenToggle(row.original),
            variant: row.original.is_active ? 'warning' : 'success',
            disabled: isToggling,
          },
          {
            icon: <Edit2 className="w-4 h-4" />,
            label: 'Edit',
            onClick: () => handleOpenEdit(row.original),
            variant: 'default',
            disabled: isUpdating, // ✅ Only disable while updating
          },
          {
            icon: <Trash2 className="w-4 h-4" />,
            label: 'Delete',
            onClick: () => handleOpenDelete(row.original),
            variant: 'danger',
            disabled: isDeleting,
          },
        ];
        return <ActionButtons actions={actions} />;
      },
    },
  ];

  // User challenge table columns
  const userChallengeColumns: ColumnDef<UserChallenge>[] = [
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#6CAC73]" />
            <span className="font-semibold text-[#2B4A2F] font-poppins">
              {row.original.user?.username || 'Unknown'}
            </span>
          </div>
          <span className="text-xs text-gray-500 font-nunito">{row.original.user?.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'challenge',
      header: 'Challenge',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[#2B4A2F] font-poppins">
            {row.original.challenge?.title || 'N/A'}
          </span>
          <div className="flex gap-2 flex-wrap">
            <Badge className="text-xs capitalize bg-white border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
              {row.original.challenge?.category}
            </Badge>
            <Badge className="text-xs bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0 font-nunito">
              {row.original.challenge?.material_type}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <UserChallengeStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'points_awarded',
      header: 'Points',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#6CAC73]" />
          <span className="font-semibold text-[#2B4A2F] font-poppins">
            {row.original.points_awarded || 0}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'waste_kg_saved',
      header: 'Waste Saved',
      cell: ({ row }) => (
        <span className="text-[#2B4A2F] font-nunito">
          {row.original.waste_kg_saved ? `${row.original.waste_kg_saved} kg` : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Started',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 font-nunito">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
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
            onClick: () => handleViewUserChallengeDetails(row.original),
            variant: 'info',
          },
        ];
        if (row.original.status === 'pending_verification') {
          actions.push({
            icon: <CheckCircle className="w-4 h-4" />,
            label: 'Verify',
            onClick: () => handleOpenVerify(row.original),
            variant: 'success',
          });
        }
        return <ActionButtons actions={actions} />;
      },
    },
  ];

  // Challenge detail sections
  const challengeDetailSections: DetailSection[] = useMemo(() => {
    if (!selectedChallenge) return [];
    return [
      {
        title: 'Challenge Information',
        items: [
          { label: 'Title', value: selectedChallenge.title, fullWidth: true },
          { label: 'Description', value: selectedChallenge.description, fullWidth: true },
          { label: 'Category', value: <Badge className="capitalize">{selectedChallenge.category}</Badge> },
          { label: 'Material Type', value: <Badge className="capitalize">{selectedChallenge.material_type}</Badge> },
          { label: 'Points Reward', value: `${selectedChallenge.points_reward} points`, icon: <Trophy className="w-4 h-4" /> },
          { label: 'Waste to Save', value: `${selectedChallenge.waste_kg} kg` },
          { label: 'Source', value: <Badge className="capitalize">{selectedChallenge.source}</Badge> },
          { label: 'Status', value: selectedChallenge.is_active ? 'Active' : 'Inactive' },
          { label: 'Participants', value: selectedChallenge._count?.participants || 0, icon: <Users className="w-4 h-4" /> },
          { label: 'Created', value: new Date(selectedChallenge.created_at).toLocaleString(), icon: <Calendar className="w-4 h-4" /> },
          ...(selectedChallenge.created_by_admin ? [{ label: 'Created By', value: selectedChallenge.created_by_admin.username }] : []),
        ],
      },
    ];
  }, [selectedChallenge]);

  // User challenge detail sections
  const userChallengeDetailSections: DetailSection[] = useMemo(() => {
    if (!selectedUserChallenge) return [];
    return [
      {
        title: 'User Information',
        items: [
          { label: 'Username', value: selectedUserChallenge.user?.username || 'N/A', icon: <User className="w-4 h-4" /> },
          { label: 'Email', value: selectedUserChallenge.user?.email || 'N/A' },
          { label: 'User Points', value: selectedUserChallenge.user?.profile?.points || 0, icon: <Trophy className="w-4 h-4" /> },
        ],
      },
      {
        title: 'Challenge Information',
        items: [
          { label: 'Title', value: selectedUserChallenge.challenge?.title || 'N/A', fullWidth: true },
          { label: 'Description', value: selectedUserChallenge.challenge?.description || 'N/A', fullWidth: true },
          { label: 'Category', value: <Badge className="capitalize">{selectedUserChallenge.challenge?.category}</Badge> },
          { label: 'Material Type', value: <Badge className="capitalize">{selectedUserChallenge.challenge?.material_type}</Badge> },
          { label: 'Points Reward', value: `${selectedUserChallenge.challenge?.points_reward || 0} points`, icon: <Trophy className="w-4 h-4" /> },
          { label: 'Waste to Save', value: `${selectedUserChallenge.challenge?.waste_kg || 0} kg` },
        ],
      },
      {
        title: 'Submission Details',
        items: [
          { label: 'Status', value: <UserChallengeStatusBadge status={selectedUserChallenge.status} /> },
          { label: 'Started', value: new Date(selectedUserChallenge.created_at).toLocaleString(), icon: <Calendar className="w-4 h-4" /> },
          { label: 'Completed', value: selectedUserChallenge.completed_at ? new Date(selectedUserChallenge.completed_at).toLocaleString() : 'Not completed', icon: <Clock className="w-4 h-4" /> },
          { label: 'Verified', value: selectedUserChallenge.verified_at ? new Date(selectedUserChallenge.verified_at).toLocaleString() : 'Not verified', icon: <CheckCircle className="w-4 h-4" /> },
          { label: 'Points Awarded', value: selectedUserChallenge.points_awarded || 0, icon: <Award className="w-4 h-4" /> },
          { label: 'Waste Saved', value: `${selectedUserChallenge.waste_kg_saved || 0} kg` },
          ...(selectedUserChallenge.verification_type ? [{ label: 'Verification Type', value: <Badge className="capitalize">{selectedUserChallenge.verification_type}</Badge> }] : []),
          ...(selectedUserChallenge.ai_confidence_score ? [{ label: 'AI Confidence', value: `${(selectedUserChallenge.ai_confidence_score * 100).toFixed(1)}%` }] : []),
          ...(selectedUserChallenge.verified_by ? [{ label: 'Verified By', value: selectedUserChallenge.verified_by.username }] : []),
          ...(selectedUserChallenge.admin_notes ? [{ label: 'Admin Notes', value: selectedUserChallenge.admin_notes, fullWidth: true }] : []),
        ],
      },
    ];
  }, [selectedUserChallenge]);

  // Loading state
  if (isLoading || isUserChallengesLoading) {
    return <LoadingState message="Loading challenges..." />;
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <ErrorState error={error as Error} title="Failed to Load Challenges" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            Challenges Management
            <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border border-[#6CAC73]/30 font-poppins animate-pulse">
              <Wifi className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </span>
        }
        description="Create, manage challenges and verify user submissions with real-time updates"
        icon={<Trophy className="w-6 h-6 text-white" />}
        actions={
          <>
            <Button
              size="sm"
              onClick={() => {
                refetch();
                refetchUserChallenges();
              }}
              className="border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </>
        }
      />

      {/* AI Generator Card */}
      <Card className="border border-purple-200 bg-gradient-to-br from-purple-50/80 to-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2B4A2F] font-poppins">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Challenge Generator
          </CardTitle>
          <CardDescription className="font-nunito">
            Automatically create challenges powered by AI. Select a category and generate!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={aiCategory} onValueChange={(value) => setAiCategory(value as ChallengeCategory)}>
              <SelectTrigger className="w-48 border-purple-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Challenge</SelectItem>
                <SelectItem value="weekly">Weekly Challenge</SelectItem>
                <SelectItem value="monthly">Monthly Challenge</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setAiConfirmDialogOpen(true)}
              disabled={isGenerating}
              className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate {aiCategory.charAt(0).toUpperCase() + aiCategory.slice(1)}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/80 border border-[#6CAC73]/20">
          <TabsTrigger
            value="challenges"
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#2B4A2F] data-[state=active]:to-[#6CAC73] data-[state=active]:text-white font-poppins"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Challenges ({challengeStats.total})
          </TabsTrigger>
          <TabsTrigger
            value="submissions"
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-poppins"
          >
            <Clock className="w-4 h-4 mr-2" />
            Submissions ({userChallengeStats.pending} Pending)
          </TabsTrigger>
        </TabsList>

        {/* Challenges Tab */}
        <TabsContent value="challenges">
          <StatsGrid
            stats={[
              { label: 'Total', value: challengeStats.total, icon: <Trophy className="w-6 h-6" />, color: 'text-[#2B4A2F]' },
              { label: 'Active', value: challengeStats.active, icon: <CheckCircle className="w-6 h-6" />, color: 'text-[#6CAC73]' },
              { label: 'Admin Created', value: challengeStats.adminCreated, icon: <Users className="w-6 h-6" />, color: 'text-blue-600' },
              { label: 'AI Generated', value: challengeStats.aiGenerated, icon: <Sparkles className="w-6 h-6" />, color: 'text-purple-600' },
              { label: 'Pending Review', value: challengeStats.pending, icon: <Clock className="w-6 h-6" />, color: 'text-orange-600' },
            ]}
          />

          <DataTable
            data={filteredChallenges}
            columns={challengeColumns}
            searchPlaceholder="Search challenges..."
            searchValue={challengeSearchQuery}
            onSearchChange={setChallengeSearchQuery}
            filters={[
              {
                label: 'Category',
                value: category || 'all',
                options: [
                  { label: 'All Categories', value: 'all' },
                  { label: 'Daily', value: 'daily' },
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Monthly', value: 'monthly' },
                ],
                onChange: (value) => setCategory(value === 'all' ? '' : value),
              },
              {
                label: 'Status',
                value: challengeStatusFilter,
                options: [
                  { label: 'All Status', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ],
                onChange: (value) => setChallengeStatusFilter(value as ChallengeStatusFilter),
              },
            ]}
            emptyState={{
              icon: <Trophy className="w-16 h-16 text-gray-400" />,
              title: 'No Challenges Found',
              description: 'Create one manually or generate using AI',
            }}
          />
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions">
          <StatsGrid
            stats={[
              { label: 'Total', value: userChallengeStats.total, icon: <Trophy className="w-6 h-6" />, color: 'text-[#2B4A2F]' },
              { label: 'In Progress', value: userChallengeStats.inProgress, icon: <Clock className="w-6 h-6" />, color: 'text-blue-600' },
              { label: 'Pending', value: userChallengeStats.pending, icon: <AlertCircle className="w-6 h-6" />, color: 'text-orange-600' },
              { label: 'Completed', value: userChallengeStats.completed, icon: <CheckCircle className="w-6 h-6" />, color: 'text-green-600' },
              { label: 'Rejected', value: userChallengeStats.rejected, icon: <XCircle className="w-6 h-6" />, color: 'text-red-600' },
            ]}
          />

          <DataTable
            data={filteredUserChallenges}
            columns={userChallengeColumns}
            searchPlaceholder="Search by user or challenge..."
            searchValue={userChallengeSearchQuery}
            onSearchChange={setUserChallengeSearchQuery}
            filters={[
              {
                label: 'Status',
                value: userChallengeStatusFilter,
                options: [
                  { label: 'All Status', value: 'all' },
                  { label: 'In Progress', value: 'in_progress' },
                  { label: 'Pending Verification', value: 'pending_verification' },
                  { label: 'Completed', value: 'completed' },
                  { label: 'Rejected', value: 'rejected' },
                ],
                onChange: (value) => setUserChallengeStatusFilter(value as UserChallengeStatusFilter),
              },
            ]}
            emptyState={{
              icon: <CheckCircle className="w-16 h-16 text-gray-400" />,
              title: 'No Submissions Found',
              description: 'No challenges match your current filters',
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <ConfirmDialog
        open={createDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            setSelectedChallenge(null);
            resetForm();
          }
        }}
        onConfirm={editDialogOpen ? handleUpdateChallenge : handleCreateChallenge}
        title={editDialogOpen ? 'Edit Challenge' : 'Create New Challenge'}
        description={editDialogOpen ? 'Update challenge details' : 'Create a new eco-challenge'}
        confirmText={editDialogOpen ? 'Update' : 'Create'}
        loading={isCreating || isUpdating}
        variant="default"
        icon={<Trophy className="w-5 h-5" />}
      >
        <form onSubmit={editDialogOpen ? handleUpdateChallenge : handleCreateChallenge} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
              }}
              placeholder="e.g., Plastic Bottle Upcycling Challenge"
              className={formErrors.title ? 'border-red-300' : ''}
            />
            {formErrors.title && <p className="text-xs text-red-600">{formErrors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
              }}
              placeholder="Describe the challenge..."
              rows={4}
              className={formErrors.description ? 'border-red-300' : ''}
            />
            {formErrors.description && <p className="text-xs text-red-600">{formErrors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Points Reward *</Label>
              <Input
                id="points"
                type="number"
                min="5"
                max="100"
                value={formData.points_reward}
                onChange={(e) => {
                  setFormData({ ...formData, points_reward: parseInt(e.target.value) || 0 });
                  if (formErrors.points_reward) setFormErrors({ ...formErrors, points_reward: '' });
                }}
                className={formErrors.points_reward ? 'border-red-300' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waste">Waste Saved (kg)</Label>
              <Input
                id="waste"
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={formData.waste_kg}
                onChange={(e) => setFormData({ ...formData, waste_kg: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Material Type</Label>
            <Select value={formData.material_type} onValueChange={(value) => setFormData({ ...formData, material_type: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="plastic">Plastic</SelectItem>
                <SelectItem value="paper">Paper</SelectItem>
                <SelectItem value="glass">Glass</SelectItem>
                <SelectItem value="metal">Metal</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="organic">Organic</SelectItem>
                <SelectItem value="textile">Textile</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </ConfirmDialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Challenge?"
        description="This action cannot be undone"
        confirmText="Delete"
        loading={isDeleting}
        variant="danger"
        icon={<Trash2 className="w-5 h-5" />}
        alertMessage={selectedChallenge && `You are about to delete: "${selectedChallenge.title}"`}
      />

      {/* Toggle Dialog */}
      <ConfirmDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        onConfirm={handleConfirmToggle}
        title={selectedChallenge?.is_active ? 'Deactivate Challenge?' : 'Activate Challenge?'}
        description={selectedChallenge?.is_active ? 'Hide challenge from users' : 'Make challenge visible'}
        confirmText={selectedChallenge?.is_active ? 'Deactivate' : 'Activate'}
        loading={isToggling}
        variant={selectedChallenge?.is_active ? 'warning' : 'success'}
        icon={selectedChallenge?.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
        alertMessage={selectedChallenge && `"${selectedChallenge.title}"`}
      />

      {/* AI Confirm Dialog */}
      <ConfirmDialog
        open={aiConfirmDialogOpen}
        onOpenChange={setAiConfirmDialogOpen}
        onConfirm={handleGenerateAI}
        title="Generate AI Challenge?"
        description={`Create a new ${aiCategory} challenge using AI`}
        confirmText="Generate"
        loading={isGenerating}
        variant="info"
        icon={<Sparkles className="w-5 h-5" />}
      />

      {/* Challenge Details Modal */}
      {selectedChallenge && (
        <DetailModal
          open={challengeDetailsOpen}
          onOpenChange={setChallengeDetailsOpen}
          title="Challenge Details"
          description="Complete challenge information"
          icon={<Trophy className="w-5 h-5 text-[#6CAC73]" />}
          sections={challengeDetailSections}
        />
      )}

      {/* User Challenge Details Modal */}
      {selectedUserChallenge && (
        <DetailModal
          open={userChallengeDetailsOpen}
          onOpenChange={setUserChallengeDetailsOpen}
          title="Submission Details"
          description="Complete submission information"
          icon={<Trophy className="w-5 h-5 text-[#6CAC73]" />}
          header={
            selectedUserChallenge.proof_url && (
              <div className="p-4 bg-gray-50/80 rounded-lg border border-gray-200/40">
                <h4 className="font-semibold text-[#2B4A2F] mb-3 font-poppins flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Proof of Completion
                </h4>
                <a
                  href={getImageUrl(selectedUserChallenge.proof_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6CAC73] hover:underline flex items-center gap-2 mb-3 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View full-size image
                </a>
                <div className="border border-[#6CAC73]/20 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(selectedUserChallenge.proof_url)}
                    alt="Proof"
                    className="w-full h-auto max-h-96 object-contain bg-white"
                  />
                </div>
              </div>
            )
          }
          sections={userChallengeDetailSections}
          footer={
            selectedUserChallenge.status === 'pending_verification' && (
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setUserChallengeDetailsOpen(false);
                    handleOpenVerify(selectedUserChallenge);
                  }}
                  className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Challenge
                </Button>
              </div>
            )
          }
        />
      )}

      {/* Verification Dialog */}
      {selectedUserChallenge && (
        <ConfirmDialog
          open={verifyDialogOpen}
          onOpenChange={setVerifyDialogOpen}
          onConfirm={() => {}}
          title="Review Submission"
          description="Verify completion and provide feedback"
          variant="info"
          icon={<CheckCircle className="w-5 h-5" />}
          alertMessage={
            <div className="space-y-2">
              <p className="font-semibold text-[#2B4A2F]">Challenge: {selectedUserChallenge.challenge?.title}</p>
              <p className="text-sm">User: <span className="font-semibold">{selectedUserChallenge.user?.username}</span></p>
              <p className="text-sm">Points: <span className="font-semibold">{selectedUserChallenge.challenge?.points_reward}</span></p>
            </div>
          }
        >
          <div className="space-y-4">
            {selectedUserChallenge.proof_url && (
              <div className="border border-[#6CAC73]/20 rounded-lg overflow-hidden">
                <img src={getImageUrl(selectedUserChallenge.proof_url)} alt="Proof" className="w-full h-auto max-h-64 object-contain bg-white" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="verify-notes">Admin Notes (Optional)</Label>
              <Textarea
                id="verify-notes"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Provide feedback..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                onClick={() => handleManualVerify(false)}
                disabled={isVerifying}
                className="bg-gradient-to-br from-rose-500 to-rose-600 text-white"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                Reject
              </Button>
              <Button
                onClick={() => handleManualVerify(true)}
                disabled={isVerifying}
                className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] text-white"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Approve
              </Button>
            </div>
          </div>
        </ConfirmDialog>
      )}
    </PageContainer>
  );
}


