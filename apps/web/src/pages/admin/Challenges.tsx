import { useState, useCallback } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useChallenges } from '@/hooks/useChallenges';
import { useWebSocketChallenges } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { challengesAPI } from '@/lib/api';

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

  // Pagination state
  const [challengesPage, setChallengesPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const itemsPerPage = 10;

  // Verification dialog state
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

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

  // WebSocket event handlers
  const handleChallengeCreated = useCallback(
    (data: any) => {
      notify('New Challenge Created', data?.message || 'New challenge available!', 'info');
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
    notify('New Submission', 'A challenge submission is pending verification!', 'info');
    refetchPending();
  }, [refetchPending]);

  const handleChallengeVerified = useCallback(() => {
    notify('Verification Complete', 'A challenge has been verified!', 'success');
    refetchPending();
  }, [refetchPending]);

  // Subscribe to real-time challenge events
  useWebSocketChallenges({
    onCreated: handleChallengeCreated,
    onUpdated: handleChallengeUpdated,
    onDeleted: handleChallengeDeleted,
    onCompleted: handleChallengeCompleted,
    onVerified: handleChallengeVerified,
  });

  // Create challenge dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points_reward: 25,
    waste_kg: 0,
    material_type: 'plastic',
    category: 'daily',
  });

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createChallenge(formData);
      notify('Success', 'Challenge created successfully!', 'success');
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        points_reward: 25,
        waste_kg: 0,
        material_type: 'plastic',
        category: 'daily',
      });
    } catch (err: any) {
      notify('Error', err?.message || 'Failed to create challenge', 'error');
    }
  };

  const handleGenerateAI = async (category: string) => {
    if (!window.confirm(`Generate AI challenge for ${category} category?`)) return;
    try {
      await generateAIChallenge(category);
      notify('Success', 'AI challenge generated successfully!', 'success');
    } catch (err: any) {
      notify('Error', err?.message || 'Failed to generate AI challenge', 'error');
    }
  };

  // Manual verification handler
  const handleManualVerify = async (approved: boolean) => {
    if (!selectedVerification) return;

    try {
      setIsVerifying(true);
      const response = await challengesAPI.manualVerify(
        selectedVerification.user_challenge_id,
        approved,
        verificationNotes
      );

      if (response.success) {
        notify(
          'Success',
          approved ? 'Challenge approved successfully!' : 'Challenge rejected',
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
    console.log('Opening verification dialog for:', verification);
    setSelectedVerification(verification);
    setVerificationNotes('');
    setVerifyDialogOpen(true);
  };

  // Normalize lists
  const challengeList = Array.isArray(challenges)
    ? challenges
    : (challenges?.data ?? []);

  const pendingList = Array.isArray(pendingVerifications)
    ? pendingVerifications
    : (pendingVerifications?.data ?? []);

  // Pagination calculations
  const totalChallengesPages = Math.ceil(challengeList.length / itemsPerPage);
  const totalPendingPages = Math.ceil(pendingList.length / itemsPerPage);

  const paginatedChallenges = challengeList.slice(
    (challengesPage - 1) * itemsPerPage,
    challengesPage * itemsPerPage
  );

  const paginatedPending = pendingList.slice(
    (pendingPage - 1) * itemsPerPage,
    pendingPage * itemsPerPage
  );

  // Loading UI
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#6CAC73] mx-auto mb-4" />
          <p className="text-[#2B4A2F] font-poppins">Loading challenges...</p>
        </div>
      </div>
    );
  }

  // Error UI
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
                animationDelay: `${i * 1.2}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Alert className="border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-[#6CAC73]" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <span className="text-[#2B4A2F] font-nunito">
                Error loading challenges: {error?.message || 'Unknown error'}
              </span>
              <Button 
                size="sm" 
                onClick={() => refetch()} 
                className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-6 relative">
      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#6CAC73] rounded-full opacity-20 animate-float"
            style={{
              left: `${15 + i * 20}%`,
              top: `${10 + (i % 3) * 25}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#2B4A2F] font-poppins">
                  Challenges Management
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border border-[#6CAC73]/30 text-xs font-poppins">
                    <Zap className="w-3 h-3 mr-1" />
                    Real-time Updates
                  </Badge>
                </div>
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
                Refresh All
              </Button>

              {/* Create Challenge Dialog */}
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0 shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Challenge
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="text-[#2B4A2F] font-poppins">Create New Challenge</DialogTitle>
                    <DialogDescription className="font-nunito">
                      Add a new eco-challenge for users to complete.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateChallenge}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-[#2B4A2F] font-poppins">Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="Plastic Bottle Upcycling"
                          required
                          className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-[#2B4A2F] font-poppins">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Transform plastic bottles into useful items"
                          rows={3}
                          required
                          className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="points" className="text-[#2B4A2F] font-poppins">Points Reward</Label>
                          <Input
                            id="points"
                            type="number"
                            min="1"
                            value={formData.points_reward}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                points_reward: parseInt(e.target.value) || 0,
                              })
                            }
                            required
                            className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="waste_kg" className="text-[#2B4A2F] font-poppins">Waste (kg)</Label>
                          <Input
                            id="waste_kg"
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.waste_kg}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                waste_kg: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="material" className="text-[#2B4A2F] font-poppins">Material Type</Label>
                        <Select
                          value={formData.material_type}
                          onValueChange={(value) =>
                            setFormData({ ...formData, material_type: value })
                          }
                        >
                          <SelectTrigger className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10">
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
                        <Label htmlFor="category" className="text-[#2B4A2F] font-poppins">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                        >
                          <SelectTrigger className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10">
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

                    <DialogFooter>
                      <Button
                        type="button"
                        onClick={() => setCreateDialogOpen(false)}
                        disabled={isCreating}
                        className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isCreating}
                        className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                          </>
                        ) : (
                          'Create Challenge'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <p className="text-gray-600 font-nunito">
            Manage eco-challenges with real-time updates
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Challenges', value: challengeList.length, color: 'text-[#2B4A2F]' },
            {
              label: 'Active',
              value: challengeList.filter((c) => c.is_active).length,
              color: 'text-[#6CAC73]',
            },
            {
              label: 'AI Generated',
              value: challengeList.filter((c) => c.source === 'ai').length,
              color: 'text-purple-600',
            },
            {
              label: 'Pending Verification',
              value: pendingList.length,
              color: 'text-orange-600',
            },
          ].map((stat) => (
            <Card key={stat.label} className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-nunito mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold font-poppins ${stat.color}`}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Challenge Generator */}
        <Card className="mb-6 border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#2B4A2F] font-poppins">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Challenge Generator
            </CardTitle>
            <CardDescription className="font-nunito">
              Automatically create new eco-challenges powered by AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {['daily', 'weekly', 'monthly'].map((cat) => (
                <Button
                  key={cat}
                  onClick={() => handleGenerateAI(cat)}
                  disabled={isGenerating}
                  className="border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm hover:bg-[#6CAC73]/10 text-[#2B4A2F] font-poppins"
                >
                  {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Generate {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
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
              All Challenges ({challengeList.length})
            </TabsTrigger>
            <TabsTrigger 
              value="pending"
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-poppins"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending Verifications ({pendingList.length})
            </TabsTrigger>
          </TabsList>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#2B4A2F] font-poppins">All Challenges</CardTitle>
                    <CardDescription className="font-nunito">
                      Manage and monitor all active and AI-generated challenges
                    </CardDescription>
                  </div>
                  <Select
                    value={category || 'all'}
                    onValueChange={(value) => {
                      setCategory(value === 'all' ? '' : value);
                      setChallengesPage(1);
                    }}
                  >
                    <SelectTrigger className="w-48 border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10 bg-white/50">
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
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-poppins">No challenges found</p>
                    <p className="text-sm text-gray-400 mt-2 font-nunito">
                      Create one manually or generate using AI
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedChallenges.map((challenge) => (
                        <div
                          key={challenge.challenge_id}
                          className="p-4 border border-[#6CAC73]/20 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-[#2B4A2F] font-poppins">{challenge.title}</h3>
                                {challenge.source === 'ai' && (
                                  <Badge className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-700 border-0 font-poppins">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 font-nunito mb-3">
                                {challenge.description}
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                <Badge className="capitalize bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0 font-poppins">
                                  {challenge.category}
                                </Badge>
                                <Badge className="capitalize bg-white/80 border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                                  {challenge.material_type}
                                </Badge>
                                <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0 font-poppins">
                                  {challenge.points_reward} points
                                </Badge>
                                {(challenge.waste_kg ?? 0) > 0 && (
                                  <Badge className="bg-white/80 border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                                    {challenge.waste_kg} kg waste
                                  </Badge>
                                )}
                                {challenge._count && (
                                  <Badge className="bg-white/80 border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                                    <Users className="w-3 h-3 mr-1" />
                                    {challenge._count.participants} participants
                                  </Badge>
                                )}
                                {challenge.expires_at && (
                                  <Badge className="bg-white/80 border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Expires {new Date(challenge.expires_at).toLocaleDateString()}
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
                            <Badge
                              className={`font-poppins border-0 ${
                                challenge.is_active 
                                  ? 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]' 
                                  : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700'
                              }`}
                            >
                              {challenge.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalChallengesPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#6CAC73]/20">
                        <p className="text-sm text-gray-600 font-nunito">
                          Showing {(challengesPage - 1) * itemsPerPage + 1} to{' '}
                          {Math.min(challengesPage * itemsPerPage, challengeList.length)} of{' '}
                          {challengeList.length} challenges
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
                          <div className="flex items-center gap-1">
                            {[...Array(totalChallengesPages)].map((_, i) => (
                              <Button
                                key={i}
                                size="sm"
                                onClick={() => setChallengesPage(i + 1)}
                                className={`${
                                  challengesPage === i + 1
                                    ? 'bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] text-white'
                                    : 'border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]'
                                }`}
                              >
                                {i + 1}
                              </Button>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setChallengesPage((p) => Math.min(totalChallengesPages, p + 1))}
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#2B4A2F] font-poppins flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      Pending Verifications
                    </CardTitle>
                    <CardDescription className="font-nunito">
                      User submissions awaiting admin review and approval
                    </CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => refetchPending()} 
                    className="border-orange-300/40 bg-white/80 hover:bg-orange-50 text-orange-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isPendingLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600 mb-4" />
                    <p className="text-gray-600 font-nunito">Loading pending verifications...</p>
                  </div>
                ) : paginatedPending.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-poppins">No pending verifications</p>
                    <p className="text-sm text-gray-400 mt-2 font-nunito">
                      All challenge submissions are up to date!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedPending.map((verification: any) => (
                        <div
                          key={verification.user_challenge_id}
                          className="p-4 border border-orange-300 rounded-xl bg-orange-50/80 backdrop-blur-sm hover:bg-orange-50 transition-all duration-300"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-[#2B4A2F] font-poppins">
                                  {verification.challenge?.title || 'Challenge'}
                                </h3>
                                <Badge className="bg-orange-200 text-orange-700 border-0 font-poppins">
                                  Pending
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 text-sm font-nunito">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Users className="w-4 h-4" />
                                  <span>User: <strong>{verification.user?.username || 'Unknown'}</strong></span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    Submitted:{' '}
                                    {verification.completed_at
                                      ? new Date(verification.completed_at).toLocaleString()
                                      : 'N/A'}
                                  </span>
                                </div>

                                {verification.challenge?.points_reward && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Trophy className="w-4 h-4" />
                                    <span>Reward: <strong>{verification.challenge.points_reward} points</strong></span>
                                  </div>
                                )}

                                {verification.proof_url && (
                                  <div className="mt-2">
                                    <a
                                      href={verification.proof_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#6CAC73] hover:underline flex items-center gap-1"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View proof image
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              size="sm"
                              onClick={() => openVerifyDialog(verification)}
                              className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPendingPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-orange-300/40">
                        <p className="text-sm text-gray-600 font-nunito">
                          Showing {(pendingPage - 1) * itemsPerPage + 1} to{' '}
                          {Math.min(pendingPage * itemsPerPage, pendingList.length)} of{' '}
                          {pendingList.length} pending
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                            disabled={pendingPage === 1}
                            className="border-orange-300/40 bg-white/80 hover:bg-orange-50 text-orange-600"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <div className="flex items-center gap-1">
                            {[...Array(totalPendingPages)].map((_, i) => (
                              <Button
                                key={i}
                                size="sm"
                                onClick={() => setPendingPage(i + 1)}
                                className={`${
                                  pendingPage === i + 1
                                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                                    : 'border-orange-300/40 bg-white/80 hover:bg-orange-50 text-orange-600'
                                }`}
                              >
                                {i + 1}
                              </Button>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setPendingPage((p) => Math.min(totalPendingPages, p + 1))}
                            disabled={pendingPage === totalPendingPages}
                            className="border-orange-300/40 bg-white/80 hover:bg-orange-50 text-orange-600"
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

        {/* Manual Verification Dialog */}
        <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-[#2B4A2F] font-poppins">Review Challenge Submission</DialogTitle>
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
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold text-lg text-[#2B4A2F]">
                        {selectedVerification.challenge?.title || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 font-nunito">
                        {selectedVerification.challenge?.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap mt-3">
                      <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0 font-poppins">
                        <Trophy className="w-3 h-3 mr-1" />
                        {selectedVerification.challenge?.points_reward || 0} points
                      </Badge>
                      {selectedVerification.challenge?.waste_kg > 0 && (
                        <Badge className="bg-white border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                          {selectedVerification.challenge?.waste_kg} kg waste
                        </Badge>
                      )}
                      <Badge className="capitalize bg-white border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                        {selectedVerification.challenge?.material_type || 'N/A'}
                      </Badge>
                      <Badge className="capitalize bg-white border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                        {selectedVerification.challenge?.category || 'N/A'}
                      </Badge>
                    </div>
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
                        {selectedVerification.user?.username || 'Unknown User'}
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
                          ? new Date(selectedVerification.completed_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </span>
                    </div>
                    {selectedVerification.user?.profile?.points !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold min-w-[80px]">User Points:</span>
                        <span className="text-[#2B4A2F] font-semibold">
                          {selectedVerification.user.profile.points} points
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Proof Image */}
                {selectedVerification.proof_url ? (
                  <div className="p-4 bg-gray-50/80 rounded-lg border border-gray-200/40">
                    <h4 className="font-semibold text-[#2B4A2F] mb-3 font-poppins flex items-center gap-2">
                      <Eye className="w-5 h-5 text-gray-600" />
                      Proof of Completion
                    </h4>
                    <a
                      href={selectedVerification.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6CAC73] hover:text-[#2B4A2F] hover:underline flex items-center gap-2 mb-3 font-nunito text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View full-size proof image in new tab
                    </a>
                    <div className="border border-[#6CAC73]/20 rounded-lg overflow-hidden">
                      <img
                        src={selectedVerification.proof_url}
                        alt="Proof of completion"
                        className="w-full h-auto max-h-96 object-contain bg-white"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = 
                            '<p class="text-red-600 p-4 text-center">Failed to load image</p>';
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50/80 rounded-lg border border-yellow-200/40">
                    <p className="text-yellow-700 font-nunito text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      No proof image provided
                    </p>
                  </div>
                )}

                {/* Admin Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-[#2B4A2F] font-poppins flex items-center gap-2">
                    Admin Notes (Optional)
                    <span className="text-xs text-gray-500 font-normal font-nunito">
                      Provide feedback to the user
                    </span>
                  </Label>
                  <Textarea
                    id="notes"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add feedback or reason for approval/rejection..."
                    rows={4}
                    className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10 font-nunito"
                  />
                  <p className="text-xs text-gray-500 font-nunito">
                    This message will be sent to the user along with the verification result.
                  </p>
                </div>

                {/* Summary Box */}
                <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200/40">
                  <p className="text-sm font-nunito text-gray-700">
                    <strong className="text-[#2B4A2F]">Review Summary:</strong> You are about to{' '}
                    <strong className="text-green-600">approve</strong> or{' '}
                    <strong className="text-red-600">reject</strong> this challenge submission for{' '}
                    <strong>{selectedVerification.user?.username || 'Unknown'}</strong>.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                onClick={() => {
                  setVerifyDialogOpen(false);
                  setSelectedVerification(null);
                  setVerificationNotes('');
                }}
                disabled={isVerifying}
                className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleManualVerify(false)}
                disabled={isVerifying}
                className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
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