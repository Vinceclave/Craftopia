// apps/web/src/pages/admin/Sponsors.tsx - CORRECT IMPLEMENTATION
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Building2, Package, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSponsors, useRewards, useRedemptions } from '@/hooks/useSponsors';
import { useWebSocketSponsors } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
import { PageContainer, PageHeader, StatsGrid } from '@/components/shared';

// Import the CORRECT components from your original implementation
import { SponsorsTab } from '@/components/sponsors/SponsorsTab';
import { RewardsTab } from '@/components/sponsors/RewardsTab';
import { RedemptionsTab } from '@/components/sponsors/RedemptionsTab';

export default function AdminSponsors() {
  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useState('sponsors');

  // Hooks
  const {
    sponsors,
    refetch: refetchSponsors,
  } = useSponsors();

  const {
    rewards,
    refetch: refetchRewards,
  } = useRewards();

  const {
    redemptions,
    stats: redemptionStats,
    refetch: refetchRedemptions,
  } = useRedemptions();

  // WebSocket Integration
  useWebSocketSponsors({
    onSponsorCreated: (data: any) => {
      info(data.message || 'New sponsor added');
      refetchSponsors();
    },
    onSponsorUpdated: (data: any) => {
      info(data.message || 'Sponsor updated');
      refetchSponsors();
    },
    onSponsorDeleted: () => {
      info('Sponsor deleted');
      refetchSponsors();
    },
    onRewardCreated: (data: any) => {
      success(data.message || 'New reward available!');
      refetchRewards();
    },
    onRewardUpdated: () => refetchRewards(),
    onRewardDeleted: () => refetchRewards(),
    onRedemptionCreated: () => refetchRedemptions(),
    onRedemptionFulfilled: () => refetchRedemptions(),
    onRedemptionCancelled: () => refetchRedemptions(),
  });

  // Stats
  const stats = useMemo(() => {
    const totalSponsors = sponsors.length;
    const activeRewards = rewards.filter((r) => r.is_active).length;
    const pendingRedemptions = redemptionStats?.redemptions?.pending || 0;
    const fulfilledRedemptions = redemptionStats?.redemptions?.fulfilled || 0;

    return [
      {
        label: 'Total Sponsors',
        value: totalSponsors,
        icon: <Building2 className="w-5 h-5" />,
        color: 'text-purple-600',
      },
      {
        label: 'Active Rewards',
        value: activeRewards,
        icon: <Gift className="w-5 h-5" />,
        color: 'text-blue-600',
      },
      {
        label: 'Pending Redemptions',
        value: pendingRedemptions,
        icon: <Package className="w-5 h-5" />,
        color: 'text-orange-600',
      },
      {
        label: 'Fulfilled',
        value: fulfilledRedemptions,
        icon: <Gift className="w-5 h-5" />,
        color: 'text-[#6CAC73]',
      },
    ];
  }, [sponsors, rewards, redemptions, redemptionStats]);

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            Sponsorships & Rewards
            <Badge className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-700 border border-purple-300 font-poppins animate-pulse">
              <Wifi className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
        }
        description="Manage sponsors, rewards, and user redemptions"
        icon={<Gift className="w-6 h-6 text-white" />}
      />

      {/* Stats Grid */}
      <StatsGrid stats={stats} columns={{ base: 2, lg: 4 }} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/80 border border-[#6CAC73]/20">
          <TabsTrigger
            value="sponsors"
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white font-poppins"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Sponsors ({sponsors.length})
          </TabsTrigger>
          <TabsTrigger
            value="rewards"
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white font-poppins"
          >
            <Gift className="w-4 h-4 mr-2" />
            Rewards ({rewards.length})
          </TabsTrigger>
          <TabsTrigger
            value="redemptions"
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-600 data-[state=active]:to-orange-700 data-[state=active]:text-white font-poppins"
          >
            <Package className="w-4 h-4 mr-2" />
            Redemptions ({redemptions.length})
          </TabsTrigger>
        </TabsList>

        {/* Use the CORRECT SponsorsTab component with the proper adding functionality */}
        <TabsContent value="sponsors">
          <SponsorsTab />
        </TabsContent>

        {/* Use the CORRECT RewardsTab component */}
        <TabsContent value="rewards">
          <RewardsTab sponsors={sponsors} />
        </TabsContent>

        {/* Use the CORRECT RedemptionsTab component */}
        <TabsContent value="redemptions">
          <RedemptionsTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}