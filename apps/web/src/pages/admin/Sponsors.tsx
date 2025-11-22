// apps/web/src/pages/admin/Sponsors.tsx
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
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Building2,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useSponsors, useRewards, useRedemptions } from '@/hooks/useSponsors';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWebSocketSponsorManagement } from '@/hooks/useWebSocketSponsor';

export default function AdminSponsors() {
  const { success, error: showError, info } = useToast();

  // Hooks
  const {
    sponsors,
    meta: sponsorsMeta,
    isLoading: sponsorsLoading,
    page: sponsorsPage,
    setPage: setSponsorsPage,
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

  const {
    rewards,
    meta: rewardsMeta,
    isLoading: rewardsLoading,
    page: rewardsPage,
    setPage: setRewardsPage,
    refetch: refetchRewards,
  } = useRewards();

  const {
    redemptions,
    meta: redemptionsMeta,
    stats: redemptionStats,
    isLoading: redemptionsLoading,
    page: redemptionsPage,
    setPage: setRedemptionsPage,
    refetch: refetchRedemptions,
  } = useRedemptions();

  // WebSocket listeners
  useWebSocketSponsorManagement({
    sponsors: {
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
    },
    rewards: {
      onRewardCreated: useCallback((data: any) => {
        success(data.message || 'New reward available!');
        refetchRewards();
      }, [success, refetchRewards]),
      onRewardUpdated: useCallback(() => {
        refetchRewards();
      }, [refetchRewards]),
    },
    redemptions: {
      onRedemptionCreated: useCallback(() => {
        refetchRedemptions();
      }, [refetchRedemptions]),
      onRedemptionFulfilled: useCallback(() => {
        refetchRedemptions();
      }, [refetchRedemptions]),
    },
  });

  // Dialog states
  const [createSponsorOpen, setCreateSponsorOpen] = useState(false);
  const [editSponsorOpen, setEditSponsorOpen] = useState(false);
  const [createRewardOpen, setCreateRewardOpen] = useState(false);
  const [editRewardOpen, setEditRewardOpen] = useState(false);
  const [deleteSponsorOpen, setDeleteSponsorOpen] = useState(false);
  const [deleteRewardOpen, setDeleteRewardOpen] = useState(false);
  const [fulfillRedemptionOpen, setFulfillRedemptionOpen] = useState(false);

  // Selected items
  const [selectedSponsor, setSelectedSponsor] = useState<any>(null);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [selectedRedemption, setSelectedRedemption] = useState<any>(null);

  // Form data
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

  // Statistics
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

  // Handlers
  const resetSponsorForm = () => {
    setSponsorForm({
      name: '',
      logo_url: '',
      description: '',
      contact_email: '',
    });
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

  const handleOpenCreateSponsor = () => {
    resetSponsorForm();
    setCreateSponsorOpen(true);
  };

  const handleOpenEditSponsor = (sponsor: any) => {
    setSelectedSponsor(sponsor);
    setSponsorForm({
      name: sponsor.name,
      logo_url: sponsor.logo_url || '',
      description: sponsor.description || '',
      contact_email: sponsor.contact_email || '',
    });
    setEditSponsorOpen(true);
  };

  const handleCreateSponsor = async () => {
    try {
      await createSponsor(sponsorForm);
      setCreateSponsorOpen(false);
      resetSponsorForm();
    } catch (err: any) {
      showError(err.message || 'Failed to create sponsor');
    }
  };

  const handleUpdateSponsor = async () => {
    if (!selectedSponsor) return;
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

  const handleToggleSponsorStatus = async (sponsor: any) => {
    try {
      await toggleSponsorStatus(sponsor.sponsor_id);
    } catch (err: any) {
      showError(err.message || 'Failed to toggle status');
    }
  };

  const handleOpenCreateReward = () => {
    resetRewardForm();
    if (sponsors.length > 0 && sponsors[0].is_active) {
      setRewardForm((prev) => ({ ...prev, sponsor_id: sponsors[0].sponsor_id }));
    }
    setCreateRewardOpen(true);
  };

  const handleOpenEditReward = (reward: any) => {
    setSelectedReward(reward);
    setRewardForm({
      sponsor_id: reward.sponsor_id,
      title: reward.title,
      description: reward.description || '',
      points_cost: reward.points_cost,
      quantity: reward.quantity,
      display_on_leaderboard: reward.display_on_leaderboard,
      expires_at: reward.expires_at ? new Date(reward.expires_at).toISOString().split('T')[0] : null,
    });
    setEditRewardOpen(true);
  };

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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

          {/* Sponsors Tab */}
          <TabsContent value="sponsors">
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#2B4A2F] font-poppins">Manage Sponsors</CardTitle>
                <CardDescription className="font-nunito">
                  Companies and organizations providing rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sponsorsLoading ? (
                  <div className="text-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600 mb-4" />
                    <p className="text-gray-600 font-nunito">Loading sponsors...</p>
                  </div>
                ) : sponsors.length === 0 ? (
                  <div className="text-center py-16">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-poppins text-lg mb-2">No sponsors yet</p>
                    <p className="text-sm text-gray-400 font-nunito">
                      Add your first sponsor to get started
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {sponsors.map((sponsor) => (
                        <div
                          key={sponsor.sponsor_id}
                          className="p-5 border border-[#6CAC73]/20 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/90 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-[#2B4A2F] font-poppins text-lg">
                                  {sponsor.name}
                                </h3>
                                <Badge
                                  className={`font-poppins border-0 ${
                                    sponsor.is_active
                                      ? 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]'
                                      : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700'
                                  }`}
                                >
                                  {sponsor.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              {sponsor.description && (
                                <p className="text-sm text-gray-600 font-nunito mb-2">
                                  {sponsor.description}
                                </p>
                              )}
                              <div className="flex gap-2 text-xs text-gray-500 font-nunito">
                                {sponsor.contact_email && (
                                  <span>📧 {sponsor.contact_email}</span>
                                )}
                                <span>•</span>
                                <span>{sponsor._count?.rewards || 0} rewards</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleToggleSponsorStatus(sponsor)}
                                disabled={isTogglingSponsor}
                                className="h-9 w-9 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#6CAC73]"
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
                                className="h-9 w-9 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-blue-50 text-blue-600"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedSponsor(sponsor);
                                  setDeleteSponsorOpen(true);
                                }}
                                className="h-9 w-9 p-0 border-rose-200 bg-white/80 hover:bg-rose-50 text-rose-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {sponsorsMeta && sponsorsMeta.lastPage > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#6CAC73]/20">
                        <p className="text-sm text-gray-600 font-nunito">
                          Page {sponsorsMeta.page} of {sponsorsMeta.lastPage} ({sponsorsMeta.total} total)
                        </p>
                        <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSponsorsPage((p) => Math.max(1, p - 1))}
                          disabled={!sponsorsMeta.hasPrevPage}
                          className="border-[#6CAC73]/20 bg-white/80"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setSponsorsPage((p) => p + 1)}
                          disabled={!sponsorsMeta.hasNextPage}
                          className="border-[#6CAC73]/20 bg-white/80"
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

          {/* Similar tabs for Rewards and Redemptions would go here */}
          <TabsContent value="rewards">
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#2B4A2F] font-poppins">Reward Catalog</CardTitle>
                    <CardDescription className="font-nunito">
                      Points-based rewards users can redeem
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleOpenCreateReward}
                    className="bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reward
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-poppins">Rewards management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redemptions">
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#2B4A2F] font-poppins">User Redemptions</CardTitle>
                <CardDescription className="font-nunito">
                  Track and fulfill user reward redemptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-poppins">Redemptions management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url" className="text-[#2B4A2F] font-poppins">
                  Logo URL
                </Label>
                <Input
                  id="logo_url"
                  value={sponsorForm.logo_url}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="border-[#6CAC73]/20"
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
                disabled={isCreatingSponsor || isUpdatingSponsor}
                className="border-[#6CAC73]/20 bg-white/80"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={editSponsorOpen ? handleUpdateSponsor : handleCreateSponsor}
                disabled={isCreatingSponsor || isUpdatingSponsor}
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
      </div>
    </div>
  );
}