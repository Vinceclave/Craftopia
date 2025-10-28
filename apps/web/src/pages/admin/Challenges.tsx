// apps/web/src/pages/admin/Challenges.tsx - FIXED VERSION
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Plus, Loader2, RefreshCw, Sparkles, Clock, Users, Zap, AlertCircle } from 'lucide-react';
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
    refetchPending
  } = useChallenges();

  const { toast } = useToast();

  // WebSocket handlers with proper error handling
  const handleChallengeCreated = useCallback((data: any) => {
    toast({
      title: "New Challenge Created",
      description: data.message || 'New challenge is now available!',
      variant: "default"
    });
    refetch();
  }, [refetch, toast]);

  const handleChallengeUpdated = useCallback((data: any) => {
    toast({
      title: "Challenge Updated",
      description: data.message || 'A challenge has been updated',
      variant: "default"
    });
    refetch();
  }, [refetch, toast]);

  const handleChallengeDeleted = useCallback((data: any) => {
    toast({
      title: "Challenge Deleted",
      description: data.message || 'A challenge has been removed',
      variant: "default"
    });
    refetch();
  }, [refetch, toast]);

  const handleChallengeCompleted = useCallback((data: any) => {
    toast({
      title: "New Submission",
      description: 'A challenge submission is pending verification!',
      variant: "default"
    });
    refetchPending();
  }, [refetchPending, toast]);

  const handleChallengeVerified = useCallback((data: any) => {
    toast({
      title: "Verification Complete",
      description: 'A challenge has been verified!',
      variant: "default"
    });
    refetchPending();
  }, [refetchPending, toast]);

  // Subscribe to WebSocket events
  useWebSocketChallenges({
    onCreated: handleChallengeCreated,
    onUpdated: handleChallengeUpdated,
    onDeleted: handleChallengeDeleted,
    onCompleted: handleChallengeCompleted,
    onVerified: handleChallengeVerified,
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points_reward: 25,
    waste_kg: 0,
    material_type: 'plastic',
    category: 'daily'
  });

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createChallenge(formData);
      toast({
        title: "Success",
        description: "Challenge created successfully!",
        variant: "default"
      });
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        points_reward: 25,
        waste_kg: 0,
        material_type: 'plastic',
        category: 'daily'
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || 'Failed to create challenge',
        variant: "destructive"
      });
    }
  };

  const handleGenerateAI = async (category: string) => {
    if (!window.confirm(`Generate AI challenge for ${category} category?`)) return;
    
    try {
      await generateAIChallenge(category);
      toast({
        title: "Success",
        description: "AI challenge generated successfully!",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || 'Failed to generate AI challenge',
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading challenges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Error loading challenges: {error?.message || 'Unknown error'}</span>
                <Button size="sm" variant="outline" onClick={() => refetch()}>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Challenges Management</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Real-time Updates
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Challenge
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Challenge</DialogTitle>
                    <DialogDescription>
                      Add a new eco-challenge for users to complete
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateChallenge}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Plastic Bottle Upcycling"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Transform plastic bottles into useful items"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="points">Points Reward</Label>
                          <Input
                            id="points"
                            type="number"
                            min="1"
                            value={formData.points_reward}
                            onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) || 0 })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="waste_kg">Waste (kg)</Label>
                          <Input
                            id="waste_kg"
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.waste_kg}
                            onChange={(e) => setFormData({ ...formData, waste_kg: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="material">Material Type</Label>
                        <Select 
                          value={formData.material_type}
                          onValueChange={(value) => setFormData({ ...formData, material_type: value })}
                        >
                          <SelectTrigger>
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
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily (1 day)</SelectItem>
                            <SelectItem value="weekly">Weekly (7 days)</SelectItem>
                            <SelectItem value="monthly">Monthly (30 days)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCreateDialogOpen(false)}
                        disabled={isCreating}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
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
          <p className="text-gray-600">Manage eco-challenges with real-time updates</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Challenges</p>
                <p className="text-3xl font-bold">{challenges?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {challenges?.filter(c => c.is_active).length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">AI Generated</p>
                <p className="text-3xl font-bold text-purple-600">
                  {challenges?.filter(c => c.source === 'ai').length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Pending Verification</p>
                <p className="text-3xl font-bold text-orange-600">
                  {pendingVerifications?.length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Generation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Challenge Generator
            </CardTitle>
            <CardDescription>
              Generate challenges automatically using AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleGenerateAI('daily')}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Generate Daily
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleGenerateAI('weekly')}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Generate Weekly
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleGenerateAI('monthly')}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Generate Monthly
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        {/* Filter */}
<Card className="mb-6">
  <CardHeader>
    <CardTitle>Filter Challenges</CardTitle>
  </CardHeader>
  <CardContent>
    <Select
      value={category || "all"}
      onValueChange={(value) => setCategory(value === "all" ? "" : value)}
    >
      <SelectTrigger className="w-64">
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
        <Card>
          <CardHeader>
            <CardTitle>All Challenges ({challenges?.length || 0})</CardTitle>
            <CardDescription>
              Manage and monitor all platform challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!challenges || challenges.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No challenges found</p>
                <p className="text-sm text-gray-400 mt-2">Create one or generate using AI</p>
              </div>
            ) : (
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.challenge_id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{challenge.title}</h3>
                          {challenge.source === 'ai' && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {challenge.description}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary" className="capitalize">
                            {challenge.category}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {challenge.material_type}
                          </Badge>
                          <Badge variant="outline">
                            {challenge.points_reward} points
                          </Badge>
                          {challenge.waste_kg > 0 && (
                            <Badge variant="outline">
                              {challenge.waste_kg} kg waste
                            </Badge>
                          )}
                          {challenge._count && (
                            <Badge variant="outline">
                              <Users className="w-3 h-3 mr-1" />
                              {challenge._count.participants} participants
                            </Badge>
                          )}
                          {challenge.expires_at && (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              Expires {new Date(challenge.expires_at).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Created {new Date(challenge.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={challenge.is_active ? 'default' : 'secondary'}>
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
        {pendingVerifications && pendingVerifications.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Verifications</CardTitle>
                  <CardDescription>
                    User challenge submissions awaiting review
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => refetchPending()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isPendingLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : (
                  pendingVerifications.slice(0, 5).map((verification: any) => (
                    <div key={verification.user_challenge_id} className="p-3 border rounded-lg bg-orange-50 border-orange-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            {verification.challenge?.title || 'Challenge'}
                          </p>
                          <p className="text-xs text-gray-500">
                            By {verification.user?.username || 'Unknown'} • 
                            {verification.completed_at ? new Date(verification.completed_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Pending
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}