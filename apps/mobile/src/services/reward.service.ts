// apps/mobile/src/services/reward.service.ts
import { apiService } from './base.service';
import { ApiResponse, PaginatedResponse } from '~/config/api';

export interface Sponsor {
  sponsor_id: number;
  name: string;
  logo_url?: string;
  description?: string;
  contact_email?: string;
  is_active: boolean;
  created_at: string;
}

export interface Reward {
  reward_id: number;
  sponsor_id: number;
  title: string;
  description?: string;
  points_cost: number;
  quantity?: number;
  redeemed_count: number;
  is_active: boolean;
  display_on_leaderboard: boolean;
  expires_at?: string;
  created_at: string;
  sponsor: Sponsor;
}

export interface Redemption {
  redemption_id: number;
  user_id: number;
  reward_id: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  claimed_at: string;
  fulfilled_at?: string;
  reward: Reward;
}

export interface RedeemRewardPayload {
  reward_id: number;
}

export interface RedeemRewardResponse {
  redemption: Redemption;
  newPoints: number;
}

class RewardService {
  /**
   * Get available rewards
   */
  async getRewards(
    page: number = 1,
    limit: number = 20,
    filters?: {
      sponsor_id?: number;
      activeOnly?: boolean;
      availableOnly?: boolean;
    }
  ): Promise<PaginatedResponse<Reward>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));

      if (filters?.sponsor_id) queryParams.append('sponsor_id', String(filters.sponsor_id));
      if (filters?.activeOnly) queryParams.append('activeOnly', 'true');
      if (filters?.availableOnly) queryParams.append('availableOnly', 'true');

      return await apiService.get<PaginatedResponse<Reward>>(
        `/api/v1/sponsors/rewards?${queryParams.toString()}`
      );
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      throw error;
    }
  }

  /**
   * Get single reward
   */
  async getRewardById(rewardId: number): Promise<ApiResponse<Reward>> {
    try {
      return await apiService.get<ApiResponse<Reward>>(
        `/api/v1/sponsors/rewards/${rewardId}`
      );
    } catch (error) {
      console.error(`Failed to fetch reward ${rewardId}:`, error);
      throw error;
    }
  }

  /**
   * Redeem a reward
   */
  async redeemReward(rewardId: number): Promise<ApiResponse<RedeemRewardResponse>> {
    try {
      return await apiService.post<ApiResponse<RedeemRewardResponse>>(
        '/api/v1/sponsors/redemptions',
        { reward_id: rewardId }
      );
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      throw error;
    }
  }

  /**
   * Get user's redemption history
   */
  async getMyRedemptions(
    page: number = 1,
    limit: number = 20,
    status?: 'pending' | 'fulfilled' | 'cancelled'
  ): Promise<PaginatedResponse<Redemption>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));
      if (status) queryParams.append('status', status);

      return await apiService.get<PaginatedResponse<Redemption>>(
        `/api/v1/sponsors/redemptions?${queryParams.toString()}`
      );
    } catch (error) {
      console.error('Failed to fetch redemptions:', error);
      throw error;
    }
  }

  /**
   * Get sponsors
   */
  async getSponsors(
    page: number = 1,
    limit: number = 10,
    activeOnly: boolean = true
  ): Promise<PaginatedResponse<Sponsor>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));
      if (activeOnly) queryParams.append('activeOnly', 'true');

      return await apiService.get<PaginatedResponse<Sponsor>>(
        `/api/v1/sponsors/sponsors?${queryParams.toString()}`
      );
    } catch (error) {
      console.error('Failed to fetch sponsors:', error);
      throw error;
    }
  }
}

export const rewardService = new RewardService();
