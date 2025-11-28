// apps/web/src/pages/admin/Sponsors.tsx 
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Building2, Package, Coins } from 'lucide-react';
import { useSponsors, useRewards, useRedemptions } from '@/hooks/useSponsors';
import { useWebSocketSponsors } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
import { PageContainer, PageHeader, StatsGrid } from '@/components/shared';

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
  // Sponsors
  const totalSponsors = sponsors.length;
  const activeSponsors = sponsors.filter((s) => s.is_active).length;
  const inactiveSponsors = totalSponsors - activeSponsors;

  // Rewards
  const totalRewards = rewards.length;
  const activeRewards = rewards.filter((r) => r.is_active).length;
  const expiredRewards = rewards.filter((r) => 
    r.expires_at && new Date(r.expires_at) <= new Date()
  ).length;

  // Redemptions
  const totalRedemptions = redemptions.length;
  const pendingRedemptions = redemptions.filter((r) => r.status === 'pending').length;
  const fulfilledRedemptions = redemptions.filter((r) => r.status === 'fulfilled').length;

  // Points calculations
  const totalPointsRedeemed = redemptions
    .filter((r) => r.status === 'fulfilled' || r.status === 'pending')
    .reduce((sum, r) => sum + (r.reward?.points_cost || 0), 0);

  return [
    {
      label: 'Total Sponsors',
      value: totalSponsors,
      icon: <Building2 className="w-5 h-5" />,
      color: 'text-purple-600',
      subtitle: `${activeSponsors} active, ${inactiveSponsors} inactive`,
    },
    {
      label: 'Total Rewards',
      value: totalRewards,
      icon: <Gift className="w-5 h-5" />,
      color: 'text-blue-600',
      subtitle: `${activeRewards} active, ${expiredRewards} expired`,
    },
    {
      label: 'Pending Redemptions',
      value: pendingRedemptions,
      icon: <Package className="w-5 h-5" />,
      color: 'text-orange-600',
      subtitle: `${fulfilledRedemptions} fulfilled`,
    },
    {
      label: 'Points Redeemed',
      value: totalPointsRedeemed.toLocaleString(),
      icon: <Coins className="w-5 h-5" />,
      color: 'text-[#6CAC73]',
      subtitle: `${totalRedemptions} total redemptions`,
    },
  ];
}, [sponsors, rewards, redemptions]);
  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Sponsorships & Rewards"
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