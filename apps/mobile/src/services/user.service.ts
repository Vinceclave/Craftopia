import { API_ENDPOINTS, User } from '~/config/api';
import { apiService } from './base.service';

interface UpdateProfileData {
  full_name?: string;
  bio?: string;
  profile_picture_url?: string;
  home_dashboard_layout?: object;
}

interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  role: string;
  is_email_verified: boolean;
  created_at: string;
  profile?: {
    user_id: number;
    full_name?: string;
    bio?: string;
    profile_picture_url?: string;
    points: number;
    home_dashboard_layout?: object;
    location?: string;
  };
}

interface UserStats {
  points: number;
  crafts_created: number;
  posts_created: number;
  challenges_completed: number;
  total_points_earned: number;
}

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  points: number;
  profile_picture_url?: string;
  member_since: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

class UserService {
  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    const response = await apiService.request<{ data: UserProfile }>(
      API_ENDPOINTS.USER.PROFILE,
      { method: 'GET' }
    );
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: UpdateProfileData): Promise<UserProfile> {
    const response = await apiService.request<{ data: UserProfile }>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      {
        method: 'PUT',
        data: updates,
      }
    );
    return response.data;
  }

  /**
   * Get user stats
   */
  async getUserStats(): Promise<UserStats> {
    const response = await apiService.request<{ data: UserStats }>(
      API_ENDPOINTS.USER.STATS,
      { method: 'GET' }
    );
    return response.data;
  }

  /**
   * Get public user profile by ID
   */
  async getUserById(userId: number): Promise<UserProfile> {
    const response = await apiService.request<{ data: UserProfile }>(
      API_ENDPOINTS.USER.PROFILE.replace('/profile', `/${userId}`),
      { method: 'GET' }
    );
    return response.data;
  }

  /**
   * Get points leaderboard
   */
  async getLeaderboard(page: number = 1, limit: number = 10): Promise<PaginatedResponse<LeaderboardEntry>> {
    const response = await apiService.request<PaginatedResponse<LeaderboardEntry>>(
      `${API_ENDPOINTS.USER.LEADERBOARD}?page=${page}&limit=${limit}`,
      { method: 'GET' }
    );
    return response;
  }

  /**
   * Upload profile picture (placeholder for future implementation)
   */
  async uploadProfilePicture(imageFile: any): Promise<{ url: string }> {
    // This would typically upload to a cloud storage service
    // For now, return a placeholder
    return { url: '🧑‍🎨' };
  }

  /**
   * Update specific profile fields
   */
  async updateProfileField(field: keyof UpdateProfileData, value: any): Promise<UserProfile> {
    const updates = { [field]: value };
    return this.updateProfile(updates);
  }

  /**
   * Validate profile data before updating
   */
  validateProfileData(data: UpdateProfileData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.full_name !== undefined) {
      if (data.full_name.length > 100) {
        errors.push('Full name cannot exceed 100 characters');
      }
    }

    if (data.bio !== undefined) {
      if (data.bio.length > 500) {
        errors.push('Bio cannot exceed 500 characters');
      }
    }

    if (data.profile_picture_url !== undefined) {
      if (data.profile_picture_url && !this.isValidUrl(data.profile_picture_url) && !data.profile_picture_url.startsWith('🧑‍🎨')) {
        errors.push('Profile picture must be a valid URL');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper method to validate URLs
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get user achievements/badges (placeholder for future implementation)
   */
  async getUserAchievements(): Promise<any[]> {
    // Placeholder for achievements system
    return [];
  }

  /**
   * Update user preferences
   */
  async updateDashboardLayout(layout: object): Promise<UserProfile> {
    return this.updateProfile({ home_dashboard_layout: layout });
  }
}

export const userService = new UserService();