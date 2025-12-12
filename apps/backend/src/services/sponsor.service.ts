// apps/backend/src/services/sponsor.service.ts
import { BaseService } from "./base.service";
import { ValidationError, NotFoundError, ConflictError } from '../utils/error';
import { logger } from "../utils/logger";
import prisma from "../config/prisma";
import { WebSocketEmitter } from "../websocket/events";
import { sendEmail } from "../utils/mailer";

class SponsorService extends BaseService {
  // ==========================================
  // SPONSOR MANAGEMENT
  // ==========================================

  async createSponsor(data: {
    name: string;
    logo_url?: string;
    description?: string;
    contact_email?: string;
    created_by_admin_id: number;
  }) {
    this.validateId(data.created_by_admin_id, 'Admin ID');
    this.validateRequiredString(data.name, 'Sponsor name', 3, 100);

    // Check for duplicate sponsor name
    const existing = await prisma.sponsor.findFirst({
      where: {
        name: data.name.trim(),
        deleted_at: null
      }
    });

    if (existing) {
      throw new ConflictError('Sponsor with this name already exists');
    }

    logger.info('Creating sponsor', { adminId: data.created_by_admin_id, name: data.name });

    const sponsor = await prisma.sponsor.create({
      data: {
        name: data.name.trim(),
        logo_url: data.logo_url?.trim() || null,
        description: data.description?.trim() || null,
        contact_email: data.contact_email?.trim() || null,
        created_by_admin_id: data.created_by_admin_id,
      },
      include: {
        created_by_admin: {
          select: { user_id: true, username: true }
        }
      }
    });

    logger.info('Sponsor created', { sponsorId: sponsor.sponsor_id });

    // 🔥 WEBSOCKET: Notify admins
    WebSocketEmitter.emitToAdmins('sponsor:created', {
      sponsor_id: sponsor.sponsor_id,
      name: sponsor.name,
      message: `New sponsor "${sponsor.name}" added`
    });

    return sponsor;
  }

  async getSponsors(page = 1, limit = 10, activeOnly = false) {
    const where: any = {
      deleted_at: null
    };

    if (activeOnly) {
      where.is_active = true;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.sponsor.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          created_by_admin: {
            select: { user_id: true, username: true }
          },
          _count: {
            select: {
              rewards: true
            }
          }
        }
      }),
      prisma.sponsor.count({ where })
    ]);

    const lastPage = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage,
        hasNextPage: page < lastPage,
        hasPrevPage: page > 1
      }
    };
  }

  async getSponsorById(sponsorId: number) {
    this.validateId(sponsorId, 'Sponsor ID');

    const sponsor = await this.checkNotDeleted(
      prisma.sponsor,
      { sponsor_id: sponsorId },
      'Sponsor'
    );

    return sponsor;
  }

  async updateSponsor(
    sponsorId: number,
    data: {
      name?: string;
      logo_url?: string;
      description?: string;
      contact_email?: string;
      is_active?: boolean;
    }
  ) {
    this.validateId(sponsorId, 'Sponsor ID');

    await this.checkNotDeleted(
      prisma.sponsor,
      { sponsor_id: sponsorId },
      'Sponsor'
    );

    // Check for duplicate name if updating
    if (data.name) {
      const existing = await prisma.sponsor.findFirst({
        where: {
          name: data.name.trim(),
          sponsor_id: { not: sponsorId },
          deleted_at: null
        }
      });

      if (existing) {
        throw new ConflictError('Another sponsor with this name already exists');
      }
    }

    logger.info('Updating sponsor', { sponsorId });

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url?.trim() || null;
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.contact_email !== undefined) updateData.contact_email = data.contact_email?.trim() || null;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const updated = await prisma.sponsor.update({
      where: { sponsor_id: sponsorId },
      data: updateData,
      include: {
        created_by_admin: {
          select: { user_id: true, username: true }
        }
      }
    });

    logger.info('Sponsor updated', { sponsorId });

    // 🔥 WEBSOCKET: Notify admins
    WebSocketEmitter.emitToAdmins('sponsor:updated', {
      sponsor_id: updated.sponsor_id,
      name: updated.name,
      is_active: updated.is_active
    });

    return updated;
  }

  async deleteSponsor(sponsorId: number) {
    this.validateId(sponsorId, 'Sponsor ID');

    await this.checkNotDeleted(
      prisma.sponsor,
      { sponsor_id: sponsorId },
      'Sponsor'
    );

    logger.info('Deleting sponsor', { sponsorId });

    const result = await this.softDelete(prisma.sponsor, sponsorId, 'sponsor_id');

    // 🔥 WEBSOCKET: Notify admins
    WebSocketEmitter.emitToAdmins('sponsor:deleted', {
      sponsor_id: sponsorId
    });

    return result;
  }

  async toggleSponsorStatus(sponsorId: number) {
    this.validateId(sponsorId, 'Sponsor ID');

    const sponsor = await this.checkNotDeleted(
      prisma.sponsor,
      { sponsor_id: sponsorId },
      'Sponsor'
    );

    logger.info('Toggling sponsor status', { sponsorId, currentStatus: sponsor.is_active });

    const updated = await prisma.sponsor.update({
      where: { sponsor_id: sponsorId },
      data: { is_active: !sponsor.is_active },
      include: {
        created_by_admin: {
          select: { user_id: true, username: true }
        }
      }
    });

    // 🔥 WEBSOCKET: Notify admins
    WebSocketEmitter.emitToAdmins('sponsor:updated', {
      sponsor_id: updated.sponsor_id,
      name: updated.name,
      is_active: updated.is_active
    });

    return updated;
  }

  // ==========================================
  // REWARD MANAGEMENT
  // ==========================================

  async createReward(data: {
    sponsor_id: number;
    title: string;
    description?: string;
    points_cost: number;
    quantity?: number;
    display_on_leaderboard?: boolean;
    expires_at?: Date;
  }) {
    this.validateId(data.sponsor_id, 'Sponsor ID');
    this.validateRequiredString(data.title, 'Reward title', 5, 150);

    if (data.points_cost < 50 || data.points_cost > 10000) {
      throw new ValidationError('Points cost must be between 50 and 10000');
    }

    // Check sponsor exists and is active
    const sponsor = await this.checkNotDeleted(
      prisma.sponsor,
      { sponsor_id: data.sponsor_id },
      'Sponsor'
    );

    if (!sponsor.is_active) {
      throw new ValidationError('Cannot add rewards to inactive sponsor');
    }

    logger.info('Creating reward', { sponsorId: data.sponsor_id, title: data.title });

    const reward = await prisma.sponsorReward.create({
      data: {
        sponsor_id: data.sponsor_id,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        points_cost: data.points_cost,
        quantity: data.quantity || null,
        display_on_leaderboard: data.display_on_leaderboard ?? true,
        expires_at: data.expires_at || null,
      },
      include: {
        sponsor: true
      }
    });

    logger.info('Reward created', { rewardId: reward.reward_id });

    // 🔥 WEBSOCKET: Notify all users
    WebSocketEmitter.broadcast('reward:created', {
      reward_id: reward.reward_id,
      title: reward.title,
      points_cost: reward.points_cost,
      sponsor_name: sponsor.name,
      message: `New reward available: ${reward.title}!`
    });

    return reward;
  }

  async getRewards(
    page = 1,
    limit = 20,
    filters: {
      sponsor_id?: number;
      active_only?: boolean;
      available_only?: boolean;
    } = {}
  ) {
    const where: any = {
      deleted_at: null
    };

    if (filters.sponsor_id) {
      where.sponsor_id = filters.sponsor_id;
    }

    if (filters.active_only) {
      where.is_active = true;
      where.sponsor = {
        is_active: true
      };
    }

    if (filters.available_only) {
      where.OR = [
        { quantity: null },
        { quantity: { gt: prisma.sponsorReward.fields.redeemed_count } }
      ];
      where.OR.push({
        expires_at: null
      });
      where.OR.push({
        expires_at: { gte: new Date() }
      });
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.sponsorReward.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          sponsor: true,
          _count: {
            select: {
              claims: true
            }
          }
        }
      }),
      prisma.sponsorReward.count({ where })
    ]);

    const lastPage = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage,
        hasNextPage: page < lastPage,
        hasPrevPage: page > 1
      }
    };
  }

  async getRewardById(rewardId: number) {
    this.validateId(rewardId, 'Reward ID');

    const reward = await this.checkNotDeleted(
      prisma.sponsorReward,
      { reward_id: rewardId },
      'Reward'
    );

    return reward;
  }

  async updateReward(
    rewardId: number,
    data: {
      title?: string;
      description?: string;
      points_cost?: number;
      quantity?: number;
      is_active?: boolean;
      display_on_leaderboard?: boolean;
      expires_at?: Date | null;
    }
  ) {
    this.validateId(rewardId, 'Reward ID');

    await this.checkNotDeleted(
      prisma.sponsorReward,
      { reward_id: rewardId },
      'Reward'
    );

    if (data.points_cost !== undefined && (data.points_cost < 50 || data.points_cost > 10000)) {
      throw new ValidationError('Points cost must be between 50 and 10000');
    }

    logger.info('Updating reward', { rewardId });

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.points_cost !== undefined) updateData.points_cost = data.points_cost;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.display_on_leaderboard !== undefined) updateData.display_on_leaderboard = data.display_on_leaderboard;
    if (data.expires_at !== undefined) updateData.expires_at = data.expires_at;

    const updated = await prisma.sponsorReward.update({
      where: { reward_id: rewardId },
      data: updateData,
      include: {
        sponsor: true
      }
    });

    logger.info('Reward updated', { rewardId });

    // 🔥 WEBSOCKET: Notify all users
    WebSocketEmitter.broadcast('reward:updated', {
      reward_id: updated.reward_id,
      title: updated.title,
      points_cost: updated.points_cost,
      is_active: updated.is_active
    });

    return updated;
  }

  async deleteReward(rewardId: number) {
    this.validateId(rewardId, 'Reward ID');

    await this.checkNotDeleted(
      prisma.sponsorReward,
      { reward_id: rewardId },
      'Reward'
    );

    logger.info('Deleting reward', { rewardId });

    const result = await this.softDelete(prisma.sponsorReward, rewardId, 'reward_id');

    // 🔥 WEBSOCKET: Notify all users
    WebSocketEmitter.broadcast('reward:deleted', {
      reward_id: rewardId
    });

    return result;
  }

  async toggleRewardStatus(rewardId: number) {
    this.validateId(rewardId, 'Reward ID');

    const reward = await this.checkNotDeleted(
      prisma.sponsorReward,
      { reward_id: rewardId },
      'Reward'
    );

    logger.info('Toggling reward status', { rewardId, currentStatus: reward.is_active });

    const updated = await prisma.sponsorReward.update({
      where: { reward_id: rewardId },
      data: { is_active: !reward.is_active },
      include: {
        sponsor: true
      }
    });

    // 🔥 WEBSOCKET: Notify all users
    WebSocketEmitter.broadcast('reward:updated', {
      reward_id: updated.reward_id,
      title: updated.title,
      is_active: updated.is_active
    });

    return updated;
  }

  // ==========================================
  // USER REDEMPTION MANAGEMENT
  // ==========================================

  async redeemReward(userId: number, rewardId: number) {
    this.validateId(userId, 'User ID');
    this.validateId(rewardId, 'Reward ID');

    // Check reward exists and is active
    const reward = await prisma.sponsorReward.findFirst({
      where: {
        reward_id: rewardId,
        deleted_at: null,
        is_active: true,
        sponsor: {
          is_active: true
        }
      },
      include: {
        sponsor: true
      }
    });

    if (!reward) {
      throw new NotFoundError('Active reward');
    }

    // Check expiration
    if (reward.expires_at && reward.expires_at < new Date()) {
      throw new ValidationError('This reward has expired');
    }

    // Check quantity
    if (reward.quantity !== null && reward.redeemed_count >= reward.quantity) {
      throw new ValidationError('This reward is out of stock');
    }

    // Check user points
    const userProfile = await prisma.userProfile.findUnique({
      where: { user_id: userId }
    });

    if (!userProfile) {
      throw new NotFoundError('User profile');
    }

    if (userProfile.points < reward.points_cost) {
      throw new ValidationError(
        `Insufficient points. You have ${userProfile.points}, need ${reward.points_cost}`
      );
    }

    // Check if user already redeemed this reward
    const existingRedemption = await prisma.userRedemption.findFirst({
      where: {
        user_id: userId,
        reward_id: rewardId,
        deleted_at: null
      }
    });

    if (existingRedemption) {
      throw new ConflictError('You have already redeemed this reward');
    }

    logger.info('Processing reward redemption', { userId, rewardId, pointsCost: reward.points_cost });

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Deduct points
      const updatedProfile = await tx.userProfile.update({
        where: { user_id: userId },
        data: {
          points: {
            decrement: reward.points_cost
          }
        }
      });

      // Create redemption record
      const redemption = await tx.userRedemption.create({
        data: {
          user_id: userId,
          reward_id: rewardId,
          status: 'pending'
        },
        include: {
          reward: {
            include: {
              sponsor: true
            }
          },
          user: {
            select: {
              user_id: true,
              username: true,
              email: true
            }
          }
        }
      });

      // Increment redeemed count
      await tx.sponsorReward.update({
        where: { reward_id: rewardId },
        data: {
          redeemed_count: {
            increment: 1
          }
        }
      });

      return { redemption, newPoints: updatedProfile.points };
    });

    logger.info('Reward redeemed successfully', {
      userId,
      rewardId,
      redemptionId: result.redemption.redemption_id,
      remainingPoints: result.newPoints
    });

    // 🔥 WEBSOCKET: Notify user
    WebSocketEmitter.emitToUser(userId, 'reward:redeemed', {
      redemption: result.redemption,
      points_spent: reward.points_cost,
      remaining_points: result.newPoints,
      message: `Successfully redeemed ${reward.title}!`
    });

    // 🔥 WEBSOCKET: Notify admins
    WebSocketEmitter.emitToAdmins('redemption:created', {
      redemption_id: result.redemption.redemption_id,
      user_id: userId,
      reward_title: reward.title,
      sponsor_name: reward.sponsor.name,
      message: `New redemption for ${reward.title}`
    });

    // Note: Email is sent only when the redemption is fulfilled (not on initial redemption)
    // This avoids redundant emails - user gets one email when they can actually claim their reward

    return result;
  }

  async getRedemptions(
    page = 1,
    limit = 20,
    filters: {
      user_id?: number;
      status?: 'pending' | 'fulfilled' | 'cancelled';
    } = {}
  ) {
    const where: any = {
      deleted_at: null
    };

    if (filters.user_id) {
      where.user_id = filters.user_id;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.userRedemption.findMany({
        where,
        orderBy: { claimed_at: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              user_id: true,
              username: true,
              email: true,
              profile: {                    // 🔥 ADD THIS
                select: {
                  profile_picture_url: true
                }
              }
            }
          },
          reward: {
            include: {
              sponsor: true
            }
          }
        }
      }),
      prisma.userRedemption.count({ where })
    ]);

    const lastPage = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage,
        hasNextPage: page < lastPage,
        hasPrevPage: page > 1
      }
    };
  }

  async fulfillRedemption(redemptionId: number) {
    console.log('🔔 fulfillRedemption called with ID:', redemptionId);
    this.validateId(redemptionId, 'Redemption ID');

    const redemption = await prisma.userRedemption.findFirst({
      where: {
        redemption_id: redemptionId,
        deleted_at: null
      },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            email: true
          }
        },
        reward: {
          include: {
            sponsor: true
          }
        }
      }
    });

    if (!redemption) {
      throw new NotFoundError('Redemption');
    }

    if (redemption.status === 'fulfilled') {
      throw new ValidationError('Redemption already fulfilled');
    }

    if (redemption.status === 'cancelled') {
      throw new ValidationError('Cannot fulfill cancelled redemption');
    }

    console.log('📧 User email:', redemption.user.email);
    logger.info('Fulfilling redemption', { redemptionId });

    const updated = await prisma.userRedemption.update({
      where: { redemption_id: redemptionId },
      data: {
        status: 'fulfilled',
        fulfilled_at: new Date()
      },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            email: true
          }
        },
        reward: {
          include: {
            sponsor: true
          }
        }
      }
    });

    logger.info('Redemption fulfilled', { redemptionId });

    // 🔥 WEBSOCKET: Notify user
    WebSocketEmitter.emitToUser(redemption.user_id, 'redemption:fulfilled', {
      redemption: updated,
      message: `Your ${redemption.reward.title} has been fulfilled!`
    });

    // 📧 EMAIL: Send fulfillment confirmation
    console.log('📧 FULFILLMENT EMAIL - Starting email process');
    console.log('📧 User email:', updated.user.email);
    console.log('📧 Reward title:', updated.reward.title);

    if (updated.user.email) {
      logger.info('Sending fulfillment email', {
        email: updated.user.email,
        rewardTitle: updated.reward.title
      });
      console.log('📧 Calling sendEmail function...');

      try {
        const emailResult = await sendEmail(
          updated.user.email,
          `🎉 Your Reward is Ready: ${updated.reward.title}`,
          `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3B6E4D 0%, #2d5a3d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
              <p style="color: #e0e0e0; margin: 10px 0 0; font-size: 16px;">Your reward has been fulfilled</p>
            </div>
            
            <div style="background-color: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
              <p style="font-size: 18px; margin: 0 0 20px;">Hi <strong>${updated.user.username}</strong>,</p>
              
              <p style="line-height: 1.6;">Great news! Your redemption for <strong>${updated.reward.title}</strong> from <strong>${updated.reward.sponsor.name}</strong> has been successfully fulfilled.</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3B6E4D;">
                <h3 style="margin: 0 0 15px; color: #3B6E4D;">📦 Reward Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Reward:</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">${updated.reward.title}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Sponsor:</td>
                    <td style="padding: 8px 0; text-align: right;">${updated.reward.sponsor.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Points Spent:</td>
                    <td style="padding: 8px 0; text-align: right;">${updated.reward.points_cost} pts</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Redemption ID:</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">#${updated.redemption_id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Status:</td>
                    <td style="padding: 8px 0; text-align: right;"><span style="background-color: #28a745; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 12px;">✓ Fulfilled</span></td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>📍 How to Claim:</strong><br>
                  Visit the sponsor's location and show your Redemption ID (<strong>#${updated.redemption_id}</strong>) or this email to collect your reward.
                </p>
              </div>
              
              <p style="line-height: 1.6; color: #666;">Thank you for contributing to a greener planet! Keep crafting and earning rewards. 🌱</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #888;">If you didn't redeem this reward, please contact support immediately.</p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #888;">© ${new Date().getFullYear()} Craftopia. All rights reserved.</p>
            </div>
          </div>
          `
        );

        console.log('📧 sendEmail returned:', emailResult);

        if (emailResult.success) {
          console.log('📧 ✅ Fulfillment email sent successfully!');
          logger.info('Fulfillment email sent successfully', {
            email: updated.user.email,
            messageId: emailResult.messageId
          });
        } else {
          console.log('📧 ❌ Fulfillment email FAILED:', emailResult.error);
          logger.error('Failed to send fulfillment email', {
            userId: redemption.user_id,
            email: updated.user.email,
            error: emailResult.error
          });
        }
      } catch (emailError: any) {
        console.error('📧 ❌ Exception in sendEmail:', emailError.message);
        logger.error('Exception sending fulfillment email', {
          userId: redemption.user_id,
          email: updated.user.email,
          error: emailError.message
        });
      }
    } else {
      console.log('📧 ⚠️ No email found for user, skipping fulfillment email');
      logger.warn('No email found for user, skipping fulfillment email', { userId: updated.user.user_id });
    }

    return updated;
  }

  async cancelRedemption(redemptionId: number, refundPoints = true) {
    this.validateId(redemptionId, 'Redemption ID');

    const redemption = await prisma.userRedemption.findFirst({
      where: {
        redemption_id: redemptionId,
        deleted_at: null
      },
      include: {
        user: {
          select: {
            user_id: true,
            username: true
          }
        },
        reward: {
          include: {
            sponsor: true
          }
        }
      }
    });

    if (!redemption) {
      throw new NotFoundError('Redemption');
    }

    if (redemption.status === 'fulfilled') {
      throw new ValidationError('Cannot cancel fulfilled redemption');
    }

    if (redemption.status === 'cancelled') {
      throw new ValidationError('Redemption already cancelled');
    }

    logger.info('Cancelling redemption', { redemptionId, refundPoints });

    const result = await prisma.$transaction(async (tx) => {
      // Cancel redemption
      const updated = await tx.userRedemption.update({
        where: { redemption_id: redemptionId },
        data: {
          status: 'cancelled'
        },
        include: {
          user: {
            select: {
              user_id: true,
              username: true
            }
          },
          reward: {
            include: {
              sponsor: true
            }
          }
        }
      });

      let newPoints = 0;

      // Refund points if requested
      if (refundPoints) {
        const updatedProfile = await tx.userProfile.update({
          where: { user_id: redemption.user_id },
          data: {
            points: {
              increment: redemption.reward.points_cost
            }
          }
        });

        newPoints = updatedProfile.points;

        // Decrement redeemed count
        await tx.sponsorReward.update({
          where: { reward_id: redemption.reward_id },
          data: {
            redeemed_count: {
              decrement: 1
            }
          }
        });
      }

      return { redemption: updated, newPoints, refunded: refundPoints };
    });

    logger.info('Redemption cancelled', { redemptionId, refunded: refundPoints });

    // 🔥 WEBSOCKET: Notify user
    WebSocketEmitter.emitToUser(redemption.user_id, 'redemption:cancelled', {
      redemption: result.redemption,
      refunded: refundPoints,
      refund_amount: refundPoints ? redemption.reward.points_cost : 0,
      new_points: result.newPoints,
      message: refundPoints
        ? `Redemption cancelled. ${redemption.reward.points_cost} points refunded.`
        : 'Redemption cancelled.'
    });

    return result;
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  async getStats() {
    const [
      totalSponsors,
      activeSponsors,
      totalRewards,
      activeRewards,
      totalRedemptions,
      pendingRedemptions,
      fulfilledRedemptions
    ] = await Promise.all([
      prisma.sponsor.count({ where: { deleted_at: null } }),
      prisma.sponsor.count({ where: { deleted_at: null, is_active: true } }),
      prisma.sponsorReward.count({ where: { deleted_at: null } }),
      prisma.sponsorReward.count({ where: { deleted_at: null, is_active: true } }),
      prisma.userRedemption.count({ where: { deleted_at: null } }),
      prisma.userRedemption.count({ where: { deleted_at: null, status: 'pending' } }),
      prisma.userRedemption.count({ where: { deleted_at: null, status: 'fulfilled' } })
    ]);

    return {
      sponsors: {
        total: totalSponsors,
        active: activeSponsors
      },
      rewards: {
        total: totalRewards,
        active: activeRewards
      },
      redemptions: {
        total: totalRedemptions,
        pending: pendingRedemptions,
        fulfilled: fulfilledRedemptions,
        cancelled: totalRedemptions - pendingRedemptions - fulfilledRedemptions
      }
    };
  }
}

// Export singleton instance
export const sponsorService = new SponsorService();

// Export individual functions
export const createSponsor = sponsorService.createSponsor.bind(sponsorService);
export const getSponsors = sponsorService.getSponsors.bind(sponsorService);
export const getSponsorById = sponsorService.getSponsorById.bind(sponsorService);
export const updateSponsor = sponsorService.updateSponsor.bind(sponsorService);
export const deleteSponsor = sponsorService.deleteSponsor.bind(sponsorService);
export const toggleSponsorStatus = sponsorService.toggleSponsorStatus.bind(sponsorService);

export const createReward = sponsorService.createReward.bind(sponsorService);
export const getRewards = sponsorService.getRewards.bind(sponsorService);
export const getRewardById = sponsorService.getRewardById.bind(sponsorService);
export const updateReward = sponsorService.updateReward.bind(sponsorService);
export const deleteReward = sponsorService.deleteReward.bind(sponsorService);
export const toggleRewardStatus = sponsorService.toggleRewardStatus.bind(sponsorService);

export const redeemReward = sponsorService.redeemReward.bind(sponsorService);
export const getRedemptions = sponsorService.getRedemptions.bind(sponsorService);
export const fulfillRedemption = sponsorService.fulfillRedemption.bind(sponsorService);
export const cancelRedemption = sponsorService.cancelRedemption.bind(sponsorService);

export const getStats = sponsorService.getStats.bind(sponsorService);