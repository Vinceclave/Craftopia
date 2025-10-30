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
} from 'lucide-react';
import { useChallenges } from '@/hooks/useChallenges';
import { useWebSocketChallenges } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  // Normalize lists
  const challengeList = Array.isArray(challenges)
    ? challenges
    : (challenges?.data ?? []);

  const pendingList = Array.isArray(pendingVerifications)
    ? pendingVerifications
    : (pendingVerifications?.data ?? []);

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
        {/* Background Floating Elements */}
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
                onClick={() => refetch()} 
                className="border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
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

        {/* Filter */}
        <Card className="mb-6 border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2B4A2F] font-poppins">Filter Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={category || 'all'}
              onValueChange={(value) => setCategory(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-64 border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10 bg-white/50">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Challenges List */}
        <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2B4A2F] font-poppins">All Challenges ({challengeList.length})</CardTitle>
            <CardDescription className="font-nunito">
              Manage and monitor all active and AI-generated challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            {challengeList.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-poppins">No challenges found</p>
                <p className="text-sm text-gray-400 mt-2 font-nunito">
                  Create one manually or generate using AI
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {challengeList.map((challenge) => (
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
                            <span className="text-sm text-gray-600 font-nunito">{challenge.waste_kg} kg waste</span>
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
                              Expires{' '}
                              {new Date(challenge.expires_at).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 font-nunito">
                          Created{' '}
                          {new Date(challenge.created_at).toLocaleDateString()}
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
            )}
          </CardContent>
        </Card>

        {/* Pending Verifications */}
        {pendingList.length > 0 && (
          <Card className="mt-6 border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#2B4A2F] font-poppins">Pending Verifications</CardTitle>
                  <CardDescription className="font-nunito">
                    User submissions awaiting admin review
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => refetchPending()} 
                  className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isPendingLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingList.slice(0, 5).map((v: any) => (
                    <div
                      key={v.user_challenge_id}
                      className="p-3 border border-orange-300 rounded-xl bg-orange-50/80 backdrop-blur-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-[#2B4A2F] font-poppins">
                            {v.challenge?.title || 'Challenge'}
                          </p>
                          <p className="text-xs text-gray-500 font-nunito">
                            By {v.user?.username || 'Unknown'} •{' '}
                            {v.completed_at
                              ? new Date(v.completed_at).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                        <Badge className="text-orange-600 border-orange-300 bg-orange-100/80 font-poppins">
                          Pending
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}