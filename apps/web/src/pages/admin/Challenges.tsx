// apps/web/src/pages/admin/Challenges.tsx - FULLY SYNCED DESIGN
import { useState, useCallback, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Save,
  X,
  Wifi,
  Image as ImageIcon,
} from 'lucide-react';
import { useChallenges } from '@/hooks/useChallenges';
import { useWebSocketChallenges } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { challengesAPI } from '@/lib/api';

type ChallengeCategory = 'daily' | 'weekly' | 'monthly';

// Helper function to get full image URL
const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const backendUrl = 'http://localhost:3001';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${backendUrl}/${cleanPath}`;
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
    generateAIChallenge,
    isCreating,
    isGenerating,
    pendingVerifications,
    isPendingLoading,
    refetchPending,
  } = useChallenges();

  const { success, error: showError, info, warning } = useToast();

  // State management
  const [challengesPage, setChallengesPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [aiConfirmDialogOpen, setAiConfirmDialogOpen] = useState(false);
  
  // Selected items
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // AI Generation state
const [aiCategory, setAiCategory] = useState<ChallengeCategory>('daily');

  // Toast notifications
  const notify = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    if (type === 'success') success(`${title}: ${message}`);
    else if (type === 'error') showError(`${title}: ${message}`);
    else if (type === 'warning') warning(`${title}: ${message}`);
    else info(`${title}: ${message}`);
  };

  const handleAiCategoryChange = (value: string) => {
  setAiCategory(value as ChallengeCategory);
};

  // WebSocket handlers
  const handleChallengeCreated = useCallback(
    (data: any) => {
      notify('New Challenge', data?.message || 'New challenge available!', 'info');
      refetch();
    },
    [refetch]
  );

  const handleChallengeUpdated = useCallback(
    (data: any) => {
      notify('Challenge Updated', data?.message || 'A challenge was updated', 'info');
      refetch();
    },
    [refetch]
  );

  const handleChallengeDeleted = useCallback(
    (data: any) => {
      notify('Challenge Deleted', data?.message || 'A challenge was removed', 'warning');
      refetch();
    },
    [refetch]
  );

  const handleChallengeCompleted = useCallback(() => {
    notify('New Submission', 'A challenge submission needs verification!', 'info');
    refetchPending();
  }, [refetchPending]);

  const handleChallengeVerified = useCallback(() => {
    notify('Verified', 'A challenge has been verified!', 'success');
    refetchPending();
  }, [refetchPending]);

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

  const handleOpenEdit = (challenge: any) => {
    if (challenge.source === 'ai') {
      notify(
        'Cannot Edit AI Challenge',
        'AI-generated challenges cannot be edited. Create a new challenge instead.',
        'warning'
      );
      return;
    }

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

  const handleOpenDelete = (challenge: any) => {
    setSelectedChallenge(challenge);
    setDeleteDialogOpen(true);
  };

  const handleOpenToggle = (challenge: any) => {
    setSelectedChallenge(challenge);
    setToggleDialogOpen(true);
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
      notify('Success', 'Challenge created successfully!', 'success');
      setCreateDialogOpen(false);
      resetForm();
    } catch (err: any) {
      notify('Error', err?.message || 'Failed to create challenge', 'error');
    }
  };

  const handleUpdateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChallenge) return;

    const errors = validateChallengeForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsUpdating(true);
      const response = await challengesAPI.update(selectedChallenge.challenge_id, {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      if (response.success) {
        notify('Success', 'Challenge updated successfully!', 'success');
        setEditDialogOpen(false);
        setSelectedChallenge(null);
        resetForm();
        refetch();
      }
    } catch (err: any) {
      notify('Error', err?.message || 'Failed to update challenge', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedChallenge) return;

    try {
      setIsDeleting(true);
      const response = await challengesAPI.delete(selectedChallenge.challenge_id);

      if (response.success) {
        notify('Success', 'Challenge deleted successfully!', 'success');
        setDeleteDialogOpen(false);
        setSelectedChallenge(null);
        refetch();
      }
    } catch (err: any) {
      notify('Error', err?.message || 'Failed to delete challenge', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!selectedChallenge) return;

    try {
      setIsToggling(true);
      const response = await challengesAPI.toggleStatus(selectedChallenge.challenge_id);

      if (response.success) {
        const newStatus = !selectedChallenge.is_active;
        notify(
          'Status Updated',
          `Challenge ${newStatus ? 'activated' : 'deactivated'} successfully!`,
          'success'
        );
        setToggleDialogOpen(false);
        setSelectedChallenge(null);
        refetch();
      }
    } catch (err: any) {
      notify('Error', err?.message || 'Failed to toggle status', 'error');
    } finally {
      setIsToggling(false);
    }
  };

  // AI Generation
  const handleGenerateAI = async () => {
    try {
      await generateAIChallenge(aiCategory);
      notify('Success', `AI challenge for ${aiCategory} category generated!`, 'success');
      setAiConfirmDialogOpen(false);
    } catch (err: any) {
      notify('Error', err?.message || 'Failed to generate AI challenge', 'error');
    }
  };

  // Manual verification
  const handleManualVerify = async (approved: boolean) => {
    if (!selectedVerification) return;

    try {
      setIsVerifying(true);
      const response = await challengesAPI.manualVerify(
        selectedVerification.user_challenge_id,
        approved,
        verificationNotes.trim() || undefined
      );

      if (response.success) {
        notify(
          'Success',
          approved ? 'Challenge approved!' : 'Challenge rejected',
          approved ? 'success' : 'warning'
        );
        setVerifyDialogOpen(false);
        setSelectedVerification(null);
        setVerificationNotes('');
        refetchPending();
      }
    } catch (err: any) {
      notify('Error', err?.message || 'Failed to verify challenge', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const openVerifyDialog = (verification: any) => {
    setSelectedVerification(verification);
    setVerificationNotes('');
    setVerifyDialogOpen(true);
  };

  // Data normalization
  const challengeList = useMemo(() => {
    // Handle different possible response structures
    if (Array.isArray(challenges)) {
      return challenges;
    } else if (challenges && typeof challenges === 'object' && 'data' in challenges) {
      return (challenges as any).data ?? [];
    }
    return [];
  }, [challenges]);


  const pendingList = useMemo(() => {
    // Handle different possible response structures
    if (Array.isArray(pendingVerifications)) {
      return pendingVerifications;
    } else if (pendingVerifications && typeof pendingVerifications === 'object' && 'data' in pendingVerifications) {
      return (pendingVerifications as any).data ?? [];
    }
    return [];
  }, [pendingVerifications]);
  // Statistics
  const stats = useMemo(() => {
    return {
      total: challengeList.length,
      active: challengeList.filter((c: any) => c.is_active).length,
      aiGenerated: challengeList.filter((c: any) => c.source === 'ai').length,
      adminCreated: challengeList.filter((c: any) => c.source === 'admin').length,
      pending: pendingList.length,
    };
  }, [challengeList, pendingList]);

  // Pagination
  const totalChallengesPages = Math.ceil(challengeList.length / itemsPerPage);
  const totalPendingPages = Math.ceil(pendingList.length / itemsPerPage);

  const paginatedChallenges = useMemo(() => {
    return challengeList.slice(
      (challengesPage - 1) * itemsPerPage,
      challengesPage * itemsPerPage
    );
  }, [challengeList, challengesPage, itemsPerPage]);

  const paginatedPending = useMemo(() => {
    return pendingList.slice(
      (pendingPage - 1) * itemsPerPage,
      pendingPage * itemsPerPage
    );
  }, [pendingList, pendingPage, itemsPerPage]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#6CAC73] mx-auto mb-4" />
          <p className="text-[#2B4A2F] font-poppins text-lg">Loading challenges...</p>
          <p className="text-gray-500 font-nunito text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#6CAC73] rounded-full opacity-20 animate-float"
              style={{
                left: `${20 + i * 25}%`,
                top: `${15 + (i % 2) * 30}%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Alert className="border-rose-200 bg-rose-50/80 backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <AlertDescription>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-rose-900 font-poppins mb-1">Failed to Load Challenges</p>
                  <p className="text-rose-700 font-nunito text-sm">{error?.message || 'An unexpected error occurred'}</p>
                </div>
                <Button
                  size="sm"
                  onClick={refetch}
                  className="bg-gradient-to-br from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white border-0"
                >
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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#2B4A2F] font-poppins flex items-center gap-3">
                  Challenges Management
                  <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border border-[#6CAC73]/30 font-poppins animate-pulse">
                    <Wifi className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </h1>
                <p className="text-gray-600 mt-1 font-nunito">
                  Create, manage, and verify eco-challenges with real-time updates
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  refetch();
                  refetchPending();
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
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: Trophy, color: 'text-[#2B4A2F]' },
            { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-[#6CAC73]' },
            { label: 'Admin Created', value: stats.adminCreated, icon: Users, color: 'text-blue-600' },
            { label: 'AI Generated', value: stats.aiGenerated, icon: Sparkles, color: 'text-purple-600' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-orange-600' },
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

        {/* AI Generator Card */}
        <Card className="mb-6 border border-purple-200 bg-gradient-to-br from-purple-50/80 to-white/80 backdrop-blur-sm shadow-lg">
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
            <Select value={aiCategory} onValueChange={handleAiCategoryChange}>  
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
              All Challenges ({stats.total})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-poppins"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending ({stats.pending})
            </TabsTrigger>
          </TabsList>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-[#2B4A2F] font-poppins">All Challenges</CardTitle>
                    <CardDescription className="font-nunito">
                      Manage admin-created and AI-generated challenges
                    </CardDescription>
                  </div>
                  <Select
                    value={category || 'all'}
                    onValueChange={(value) => {
                      setCategory(value === 'all' ? '' : value);
                      setChallengesPage(1);
                    }}
                  >
                    <SelectTrigger className="w-48 border-[#6CAC73]/20">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {paginatedChallenges.length === 0 ? (
                  <div className="text-center py-16">
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-poppins text-lg mb-2">No challenges found</p>
                    <p className="text-sm text-gray-400 font-nunito">
                      Create one manually or generate using AI
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedChallenges.map((challenge: any) => (
                        <div
                          key={challenge.challenge_id}
                          className="p-5 border border-[#6CAC73]/20 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/90 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="font-semibold text-[#2B4A2F] font-poppins text-lg">
                                  {challenge.title}
                                </h3>
                                {challenge.source === 'ai' && (
                                  <Badge className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-700 border-0 font-poppins">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI Generated
                                  </Badge>
                                )}
                                {challenge.source === 'admin' && (
                                  <Badge className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border-0 font-poppins">
                                    <Users className="w-3 h-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                                <Badge
                                  className={`font-poppins border-0 ${
                                    challenge.is_active
                                      ? 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]'
                                      : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700'
                                  }`}
                                >
                                  {challenge.is_active ? (
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
                              </div>
                              <p className="text-sm text-gray-600 font-nunito mb-3 line-clamp-2">
                                {challenge.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Badge className="capitalize text-xs border-0 bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] font-poppins">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  {challenge.category}
                                </Badge>
                                <Badge className="capitalize text-xs border-0 bg-white/80 border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                                  {challenge.material_type}
                                </Badge>
                                <Badge className="text-xs bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0 font-poppins">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  {challenge.points_reward} pts
                                </Badge>
                                {(challenge.waste_kg ?? 0) > 0 && (
                                  <Badge className="text-xs bg-white/80 border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                                    ♻️ {challenge.waste_kg} kg
                                  </Badge>
                                )}
                                {challenge._count?.participants > 0 && (
                                  <Badge className="text-xs bg-white/80 border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                                    <Users className="w-3 h-3 mr-1" />
                                    {challenge._count.participants}
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 font-nunito">
                                <span>
                                  Created {new Date(challenge.created_at).toLocaleDateString()}
                                </span>
                                {challenge.created_by_admin && (
                                  <span className="flex items-center gap-1">
                                    <span>•</span>
                                    <span>By {challenge.created_by_admin.username}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                size="sm"
                                onClick={() => handleOpenToggle(challenge)}
                                disabled={isToggling}
                                className={`h-9 w-9 p-0 transition-all ${
                                  challenge.is_active
                                    ? 'border-orange-200 bg-white/80 hover:bg-orange-50 text-orange-600'
                                    : 'border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#6CAC73]'
                                }`}
                                title={challenge.is_active ? 'Deactivate' : 'Activate'}
                              >
                                {isToggling ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : challenge.is_active ? (
                                  <ToggleRight className="w-4 h-4" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleOpenEdit(challenge)}
                                disabled={challenge.source === 'ai' || isUpdating}
                                className="h-9 w-9 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-blue-50 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={
                                  challenge.source === 'ai'
                                    ? 'Cannot edit AI-generated challenges'
                                    : 'Edit challenge'
                                }
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleOpenDelete(challenge)}
                                disabled={isDeleting}
                                className="h-9 w-9 p-0 border-rose-200 bg-white/80 hover:bg-rose-50 text-rose-600"
                                title="Delete challenge"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Synced Pagination */}
                    {totalChallengesPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#6CAC73]/20">
                        <p className="text-sm text-gray-600 font-nunito">
                          Showing {(challengesPage - 1) * itemsPerPage + 1} to{' '}
                          {Math.min(challengesPage * itemsPerPage, challengeList.length)} of{' '}
                          {challengeList.length}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setChallengesPage((p) => Math.max(1, p - 1))}
                            disabled={challengesPage === 1}
                            className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-sm text-[#2B4A2F] font-poppins min-w-[100px] text-center flex items-center">
                            Page {challengesPage} of {totalChallengesPages}
                          </span>
                          <Button
                            size="sm"
                            onClick={() =>
                              setChallengesPage((p) => Math.min(totalChallengesPages, p + 1))
                            }
                            disabled={challengesPage === totalChallengesPages}
                            className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Verifications Tab */}
          <TabsContent value="pending">
            <Card className="border border-orange-300/40 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-[#2B4A2F] font-poppins flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      Pending Verifications
                    </CardTitle>
                    <CardDescription className="font-nunito">
                      User submissions awaiting admin review
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isPendingLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600 mb-4" />
                    <p className="text-gray-600 font-nunito">Loading...</p>
                  </div>
                ) : paginatedPending.length === 0 ? (
                  <div className="text-center py-16">
                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-poppins text-lg mb-2">All caught up!</p>
                    <p className="text-sm text-gray-400 font-nunito">
                      No pending verifications at the moment
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedPending.map((verification: any) => (
                        <div
                          key={verification.user_challenge_id}
                          className="p-4 border border-orange-300 rounded-xl bg-orange-50/80 backdrop-blur-sm hover:bg-orange-50 transition-all"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-[#2B4A2F] font-poppins">
                                  {verification.challenge?.title || 'Challenge'}
                                </h3>
                                <Badge className="bg-orange-200 text-orange-700 border-0">
                                  Pending
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm font-nunito text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  <span>{verification.user?.username || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {verification.completed_at
                                      ? new Date(verification.completed_at).toLocaleString()
                                      : 'N/A'}
                                  </span>
                                </div>
                                {verification.challenge?.points_reward && (
                                  <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4" />
                                    <span>{verification.challenge.points_reward} points</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => openVerifyDialog(verification)}
                              className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] text-white hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Synced Pagination for Pending */}
                    {totalPendingPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-orange-300/40">
                        <p className="text-sm text-gray-600 font-nunito">
                          Showing {(pendingPage - 1) * itemsPerPage + 1} to{' '}
                          {Math.min(pendingPage * itemsPerPage, pendingList.length)} of{' '}
                          {pendingList.length}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                            disabled={pendingPage === 1}
                            className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-sm text-[#2B4A2F] font-poppins min-w-[100px] text-center flex items-center">
                            Page {pendingPage} of {totalPendingPages}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => setPendingPage((p) => Math.min(totalPendingPages, p + 1))}
                            disabled={pendingPage === totalPendingPages}
                            className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialog */}
        <Dialog
          open={createDialogOpen || editDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
              setSelectedChallenge(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-[#2B4A2F] font-poppins text-xl">
                {editDialogOpen ? 'Edit Challenge' : 'Create New Challenge'}
              </DialogTitle>
              <DialogDescription className="font-nunito">
                {editDialogOpen
                  ? 'Update challenge details. Changes will be reflected immediately.'
                  : 'Create a new eco-challenge for users to complete.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editDialogOpen ? handleUpdateChallenge : handleCreateChallenge}>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#2B4A2F] font-poppins">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (formErrors.title) {
                        setFormErrors({ ...formErrors, title: '' });
                      }
                    }}
                    placeholder="e.g., Plastic Bottle Upcycling Challenge"
                    className={`border-[#6CAC73]/20 ${
                      formErrors.title ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                  />
                  {formErrors.title && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {formErrors.title}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">{formData.title.length}/100 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#2B4A2F] font-poppins">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (formErrors.description) {
                        setFormErrors({ ...formErrors, description: '' });
                      }
                    }}
                    placeholder="Describe the challenge in detail..."
                    rows={4}
                    className={`border-[#6CAC73]/20 resize-none ${
                      formErrors.description ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                  />
                  {formErrors.description && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {formErrors.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="points" className="text-[#2B4A2F] font-poppins">
                      Points Reward <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="points"
                      type="number"
                      min="5"
                      max="100"
                      value={formData.points_reward}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          points_reward: parseInt(e.target.value) || 0,
                        });
                        if (formErrors.points_reward) {
                          setFormErrors({ ...formErrors, points_reward: '' });
                        }
                      }}
                      className={`border-[#6CAC73]/20 ${
                        formErrors.points_reward ? 'border-red-300' : ''
                      }`}
                    />
                    {formErrors.points_reward && (
                      <p className="text-xs text-red-600">{formErrors.points_reward}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waste" className="text-[#2B4A2F] font-poppins">
                      Waste Saved (kg)
                    </Label>
                    <Input
                      id="waste"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={formData.waste_kg}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          waste_kg: parseFloat(e.target.value) || 0,
                        });
                        if (formErrors.waste_kg) {
                          setFormErrors({ ...formErrors, waste_kg: '' });
                        }
                      }}
                      className={`border-[#6CAC73]/20 ${formErrors.waste_kg ? 'border-red-300' : ''}`}
                    />
                    {formErrors.waste_kg && (
                      <p className="text-xs text-red-600">{formErrors.waste_kg}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#2B4A2F] font-poppins">Material Type</Label>
                  <Select
                    value={formData.material_type}
                    onValueChange={(value) => setFormData({ ...formData, material_type: value })}
                  >
                    <SelectTrigger className="border-[#6CAC73]/20">
                      <SelectValue />
                    </SelectTrigger>
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
                  <Label className="text-[#2B4A2F] font-poppins">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="border-[#6CAC73]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setEditDialogOpen(false);
                    setSelectedChallenge(null);
                    resetForm();
                  }}
                  disabled={isCreating || isUpdating}
                  className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editDialogOpen ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editDialogOpen ? 'Update Challenge' : 'Create Challenge'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation AlertDialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-rose-600 font-poppins">
                <Trash2 className="w-5 h-5 inline mr-2" />
                Delete Challenge?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-nunito">
                This action cannot be undone and will affect all participants.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {selectedChallenge && (
              <Alert className="bg-gradient-to-br from-[#FFF9F0] to-white border-[#6CAC73]/20">
                <AlertCircle className="h-4 w-4 text-[#6CAC73]" />
                <AlertDescription className="font-nunito">
                  <p className="font-medium mb-2 text-[#2B4A2F]">You are about to delete:</p>
                  <p className="font-bold text-[#2B4A2F]">"{selectedChallenge.title}"</p>
                </AlertDescription>
              </Alert>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedChallenge(null);
                }}
                className="border-[#6CAC73]/20"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-gradient-to-br from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white border-0"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Challenge
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Toggle Status AlertDialog */}
        <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
          <AlertDialogContent className="border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className={`font-poppins ${
                selectedChallenge?.is_active ? 'text-orange-600' : 'text-[#6CAC73]'
              }`}>
                {selectedChallenge?.is_active ? (
                  <>
                    <ToggleRight className="w-5 h-5 inline mr-2" />
                    Deactivate Challenge?
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5 inline mr-2" />
                    Activate Challenge?
                  </>
                )}
              </AlertDialogTitle>
              <AlertDialogDescription className="font-nunito">
                {selectedChallenge?.is_active
                  ? 'This will hide the challenge from users and prevent new participations.'
                  : 'This will make the challenge visible to users and allow participations.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {selectedChallenge && (
              <Alert className="bg-gradient-to-br from-[#FFF9F0] to-white border-[#6CAC73]/20">
                <AlertCircle className="h-4 w-4 text-[#6CAC73]" />
                <AlertDescription className="font-nunito">
                  <p className="font-medium mb-2 text-[#2B4A2F]">
                    {selectedChallenge.is_active ? 'Deactivating:' : 'Activating:'}
                  </p>
                  <p className="font-bold text-[#2B4A2F]">"{selectedChallenge.title}"</p>
                </AlertDescription>
              </Alert>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setToggleDialogOpen(false);
                  setSelectedChallenge(null);
                }}
                className="border-[#6CAC73]/20"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmToggle}
                disabled={isToggling}
                className={`border-0 ${
                  selectedChallenge?.is_active
                    ? 'bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                    : 'bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90'
                } text-white`}
              >
                {isToggling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : selectedChallenge?.is_active ? (
                  <>
                    <ToggleRight className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AI Generation Confirmation AlertDialog */}
        <AlertDialog open={aiConfirmDialogOpen} onOpenChange={setAiConfirmDialogOpen}>
          <AlertDialogContent className="border-purple-200 bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-purple-600 font-poppins flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate AI Challenge?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-nunito">
                This will create a new <strong>{aiCategory}</strong> challenge using AI. The
                challenge will be automatically activated and available to users.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <Alert className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <AlertDescription className="font-nunito">
                <p className="font-medium text-purple-900 mb-2">AI will generate:</p>
                <ul className="list-disc list-inside text-sm text-purple-800 space-y-1">
                  <li>Creative challenge title</li>
                  <li>Detailed description</li>
                  <li>Appropriate points reward</li>
                  <li>Relevant material type</li>
                </ul>
              </AlertDescription>
            </Alert>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setAiConfirmDialogOpen(false)}
                className="border-[#6CAC73]/20"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Challenge
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Verification Dialog */}
        <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-[#2B4A2F] font-poppins text-xl">
                Review Submission
              </DialogTitle>
              <DialogDescription className="font-nunito">
                Verify the user's challenge completion and provide feedback
              </DialogDescription>
            </DialogHeader>

            {selectedVerification && (
              <div className="space-y-4 py-4">
                {/* Challenge Info */}
                <div className="p-4 bg-gradient-to-r from-[#6CAC73]/10 to-[#2B4A2F]/5 rounded-lg border border-[#6CAC73]/20">
                  <h4 className="font-semibold text-[#2B4A2F] mb-2 font-poppins flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#6CAC73]" />
                    Challenge Details
                  </h4>
                  <p className="font-semibold text-lg text-[#2B4A2F]">
                    {selectedVerification.challenge?.title || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedVerification.challenge?.description || 'No description'}
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0">
                      {selectedVerification.challenge?.points_reward || 0} points
                    </Badge>
                    {selectedVerification.challenge?.waste_kg > 0 && (
                      <Badge className="bg-white border border-[#6CAC73]/20 text-[#2B4A2F]">
                        {selectedVerification.challenge?.waste_kg} kg waste
                      </Badge>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="p-4 bg-blue-50/80 rounded-lg border border-blue-200/40">
                  <h4 className="font-semibold text-[#2B4A2F] mb-3 font-poppins flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Submitted By
                  </h4>
                  <div className="space-y-2 text-sm font-nunito">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-semibold min-w-[80px]">User:</span>
                      <span className="text-[#2B4A2F] font-semibold">
                        {selectedVerification.user?.username || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-semibold min-w-[80px]">Email:</span>
                      <span className="text-[#2B4A2F]">
                        {selectedVerification.user?.email || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-semibold min-w-[80px]">Submitted:</span>
                      <span className="text-[#2B4A2F]">
                        {selectedVerification.completed_at
                          ? new Date(selectedVerification.completed_at).toLocaleString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Proof Image */}
                {selectedVerification.proof_url && (
                  <div className="p-4 bg-gray-50/80 rounded-lg border border-gray-200/40">
                    <h4 className="font-semibold text-[#2B4A2F] mb-3 font-poppins flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Proof of Completion
                    </h4>
                    <a
                      href={getImageUrl(selectedVerification.proof_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6CAC73] hover:underline flex items-center gap-2 mb-3 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View full-size image
                    </a>
                    <div className="border border-[#6CAC73]/20 rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(selectedVerification.proof_url)}
                        alt="Proof"
                        className="w-full h-auto max-h-96 object-contain bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-[#2B4A2F] font-poppins">
                    Admin Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Provide feedback..."
                    rows={4}
                    className="border-[#6CAC73]/20"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                onClick={() => {
                  setVerifyDialogOpen(false);
                  setSelectedVerification(null);
                  setVerificationNotes('');
                }}
                disabled={isVerifying}
                className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={() => handleManualVerify(false)}
                disabled={isVerifying}
                className="bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white border-0"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleManualVerify(true)}
                disabled={isVerifying}
                className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
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