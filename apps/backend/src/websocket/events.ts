
// =====================================================
// apps/backend/src/websocket/events.ts - COMPLETE VERSION
// =====================================================
import { getWebSocketServer } from './server';
import { logger } from '../utils/logger';

export enum WebSocketEvent {
  // Challenge Events
  CHALLENGE_CREATED = 'challenge:created',
  CHALLENGE_UPDATED = 'challenge:updated',
  CHALLENGE_DELETED = 'challenge:deleted',
  CHALLENGE_JOINED = 'challenge:joined',
  CHALLENGE_COMPLETED = 'challenge:completed',
  CHALLENGE_VERIFIED = 'challenge:verified',
  CHALLENGE_REJECTED = 'challenge:rejected',
  
  // Points Events
  POINTS_AWARDED = 'points:awarded',
  POINTS_UPDATED = 'points:updated',
  LEADERBOARD_UPDATED = 'leaderboard:updated',
  
  // Post Events
  POST_CREATED = 'post:created',
  POST_UPDATED = 'post:updated',
  POST_DELETED = 'post:deleted',
  POST_LIKED = 'post:liked',
  POST_COMMENTED = 'post:commented',
  
  // Comment Events
  COMMENT_CREATED = 'comment:created',
  COMMENT_DELETED = 'comment:deleted',
  
  // Report Events
  REPORT_CREATED = 'report:created',
  REPORT_UPDATED = 'report:updated',
  REPORT_RESOLVED = 'report:resolved',
  
  // Announcement Events
  ANNOUNCEMENT_CREATED = 'announcement:created',
  ANNOUNCEMENT_UPDATED = 'announcement:updated',
  ANNOUNCEMENT_DELETED = 'announcement:deleted',
  
  // Moderation Events
  CONTENT_MODERATED = 'content:moderated',
  USER_BANNED = 'user:banned',
  USER_UNBANNED = 'user:unbanned',
  USER_ROLE_CHANGED = 'user:role_changed',
  USER_DELETED = 'user:deleted',
  
  // Craft Events
  CRAFT_CREATED = 'craft:created',
  CRAFT_DELETED = 'craft:deleted',
  
  // Notification Events
  NOTIFICATION = 'notification',
  
  // System Events
  SYSTEM_MAINTENANCE = 'system:maintenance',
  SYSTEM_UPDATE = 'system:update',
  
  // Admin Events
  ADMIN_ALERT = 'admin:alert'
}

export class WebSocketEmitter {
  
  // ==========================================
  // HELPER: Safe emit with error handling
  // ==========================================
  private static safeEmit(emitFn: () => void, eventName: string) {
    try {
      emitFn();
    } catch (error) {
      logger.error(`Failed to emit ${eventName}`, error);
    }
  }

  // ==========================================
  // CHALLENGE EVENTS
  // ==========================================
  
  static challengeCreated(challengeData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.CHALLENGE_CREATED, {
        challenge: challengeData,
        message: `New ${challengeData.category} challenge available: ${challengeData.title}!`
      });
      logger.info('Broadcasted challenge created', { challengeId: challengeData.challenge_id });
    }, 'challengeCreated');
  }

  static challengeUpdated(challengeData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.CHALLENGE_UPDATED, {
        challenge: challengeData,
        message: `Challenge updated: ${challengeData.title}`
      });
      logger.info('Broadcasted challenge updated', { challengeId: challengeData.challenge_id });
    }, 'challengeUpdated');
  }

  static challengeDeleted(challengeId: number) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.CHALLENGE_DELETED, {
        challengeId,
        message: 'A challenge has been removed'
      });
      logger.info('Broadcasted challenge deleted', { challengeId });
    }, 'challengeDeleted');
  }

  static challengeJoined(userId: number, challengeData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.CHALLENGE_JOINED, {
        challenge: challengeData.challenge,
        userChallengeId: challengeData.userChallengeId,
        status: challengeData.status,
        message: `You joined: ${challengeData.challenge?.title || 'the challenge'}!`
      });
      logger.info('Emitted challenge joined', { userId, challengeId: challengeData.challenge?.challenge_id });
    }, 'challengeJoined');
  }

  static challengeCompleted(userId: number, challengeData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      
      // Notify user
      ws.emitToUser(userId, WebSocketEvent.CHALLENGE_COMPLETED, {
        challenge: challengeData.challenge,
        userChallengeId: challengeData.userChallengeId,
        status: challengeData.status,
        completedAt: challengeData.completedAt,
        message: 'Challenge submitted for verification!'
      });
      
      // Notify admins about pending verification
      ws.emitToAdmins(WebSocketEvent.ADMIN_ALERT, {
        type: 'challenge_pending',
        challenge: challengeData.challenge,
        userChallengeId: challengeData.userChallengeId,
        userId,
        message: 'New challenge pending verification'
      });
      
      logger.info('Emitted challenge completed', { userId, challengeId: challengeData.challenge?.challenge_id });
    }, 'challengeCompleted');
  }

  static challengeVerified(userId: number, verificationData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.CHALLENGE_VERIFIED, {
        verification: verificationData,
        challenge: verificationData.challenge,
        points_awarded: verificationData.points_awarded,
        message: `🎉 Challenge verified! You earned ${verificationData.points_awarded} points!`
      });
      logger.info('Emitted challenge verified', { userId, points: verificationData.points_awarded });
    }, 'challengeVerified');
  }

  static challengeRejected(userId: number, rejectionData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.CHALLENGE_REJECTED, {
        rejection: rejectionData,
        challenge: rejectionData.challenge,
        reason: rejectionData.admin_notes,
        message: 'Challenge verification failed. Please try again with better proof.'
      });
      logger.info('Emitted challenge rejected', { userId });
    }, 'challengeRejected');
  }

   static challengeSkipped(userId: number, skipData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.NOTIFICATION, {
        type: 'challenge_skipped',
        title: 'Challenge Skipped',
        message: skipData.message || 'No worries! Try another challenge.',
        data: skipData
      });
      logger.info('Emitted challenge skipped', { userId });
    }, 'challengeSkipped');
  }

  // ==========================================
  // POINTS EVENTS
  // ==========================================
  
  static pointsAwarded(userId: number, pointsData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.POINTS_AWARDED, {
        points: pointsData.amount,
        reason: pointsData.reason,
        challengeTitle: pointsData.challengeTitle,
        message: `🌟 You earned ${pointsData.amount} points!`
      });
      logger.info('Emitted points awarded', { userId, points: pointsData.amount });
    }, 'pointsAwarded');
  }

  static pointsUpdated(userId: number, totalPoints: number) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.POINTS_UPDATED, {
        totalPoints,
        message: `Your total points: ${totalPoints}`
      });
      logger.info('Emitted points updated', { userId, totalPoints });
    }, 'pointsUpdated');
  }

  static leaderboardUpdated(leaderboardData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.LEADERBOARD_UPDATED, {
        leaderboard: leaderboardData.leaderboard,
        challengeId: leaderboardData.challengeId,
        message: 'Leaderboard updated!'
      });
      logger.info('Broadcasted leaderboard update');
    }, 'leaderboardUpdated');
  }

  // ==========================================
  // POST EVENTS
  // ==========================================
  
  static postCreated(postData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.POST_CREATED, {
        post_id: postData.post_id,
        title: postData.title,
        content: postData.content,
        category: postData.category,
        author: postData.author,
        tags: postData.tags,
        message: `New post in ${postData.category}: ${postData.title}`
      });
      logger.info('Broadcasted post created', { postId: postData.post_id });
    }, 'postCreated');
  }

  static postUpdated(postData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.POST_UPDATED, {
        post_id: postData.post_id,
        title: postData.title,
        message: 'Post updated'
      });
      logger.info('Broadcasted post updated', { postId: postData.post_id });
    }, 'postUpdated');
  }

  static postDeleted(postId: number) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.POST_DELETED, {
        postId,
        message: 'Post removed'
      });
      logger.info('Broadcasted post deleted', { postId });
    }, 'postDeleted');
  }

  static postLiked(postOwnerId: number, likeData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(postOwnerId, WebSocketEvent.POST_LIKED, {
        postId: likeData.postId,
        username: likeData.username,
        likeCount: likeData.likeCount,
        message: `${likeData.username} liked your post! ❤️`
      });
      logger.info('Emitted post liked', { postOwnerId, postId: likeData.postId });
    }, 'postLiked');
  }

  static postCommented(postOwnerId: number, commentData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(postOwnerId, WebSocketEvent.POST_COMMENTED, {
        postId: commentData.postId,
        commentId: commentData.commentId,
        username: commentData.username,
        content: commentData.content,
        message: `${commentData.username} commented on your post 💬`
      });
      logger.info('Emitted post commented', { postOwnerId, postId: commentData.postId });
    }, 'postCommented');
  }

  // ==========================================
  // COMMENT EVENTS
  // ==========================================
  
  static commentCreated(commentData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.COMMENT_CREATED, {
        comment_id: commentData.comment_id,
        post_id: commentData.post_id,
        username: commentData.username,
        content: commentData.content
      });
      logger.info('Broadcasted comment created', { commentId: commentData.comment_id });
    }, 'commentCreated');
  }

  static commentDeleted(commentId: number, postId: number) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.COMMENT_DELETED, {
        commentId,
        postId,
        message: 'Comment removed'
      });
      logger.info('Broadcasted comment deleted', { commentId });
    }, 'commentDeleted');
  }

  // ==========================================
  // REPORT EVENTS
  // ==========================================
  
  static reportCreated(reportData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToAdmins(WebSocketEvent.REPORT_CREATED, {
        report_id: reportData.report_id,
        reporter: reportData.reporter,
        type: reportData.type,
        reason: reportData.reason,
        status: reportData.status,
        message: `New ${reportData.type} report: ${reportData.reason.substring(0, 50)}...`
      });
      logger.info('Emitted report created to admins', { reportId: reportData.report_id });
    }, 'reportCreated');
  }

  static reportUpdated(reporterId: number, reportData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(reporterId, WebSocketEvent.REPORT_UPDATED, {
        report_id: reportData.report_id,
        status: reportData.status,
        moderator_notes: reportData.moderator_notes,
        resolved_by: reportData.resolved_by,
        message: `Your report status: ${reportData.status}`
      });
      logger.info('Emitted report updated', { reporterId, reportId: reportData.report_id });
    }, 'reportUpdated');
  }

  static reportResolved(reporterId: number, reportData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(reporterId, WebSocketEvent.REPORT_RESOLVED, {
        report_id: reportData.report_id,
        action_taken: reportData.action_taken,
        moderator_notes: reportData.moderator_notes,
        message: 'Your report has been resolved ✓'
      });
      logger.info('Emitted report resolved', { reporterId, reportId: reportData.report_id });
    }, 'reportResolved');
  }

  // ==========================================
  // ANNOUNCEMENT EVENTS
  // ==========================================
  
  static announcementCreated(announcementData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.ANNOUNCEMENT_CREATED, {
        announcement_id: announcementData.announcement_id,
        title: announcementData.title,
        content: announcementData.content,
        expires_at: announcementData.expires_at,
        created_by: announcementData.created_by,
        message: `📢 ${announcementData.title}`
      });
      logger.info('Broadcasted announcement created', { announcementId: announcementData.announcement_id });
    }, 'announcementCreated');
  }

  static announcementUpdated(announcementData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.ANNOUNCEMENT_UPDATED, {
        announcement_id: announcementData.announcement_id,
        title: announcementData.title,
        content: announcementData.content,
        is_active: announcementData.is_active,
        expires_at: announcementData.expires_at,
        message: `Announcement updated: ${announcementData.title}`
      });
      logger.info('Broadcasted announcement updated', { announcementId: announcementData.announcement_id });
    }, 'announcementUpdated');
  }

  static announcementDeleted(announcementId: number) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.ANNOUNCEMENT_DELETED, {
        announcementId,
        message: 'Announcement removed'
      });
      logger.info('Broadcasted announcement deleted', { announcementId });
    }, 'announcementDeleted');
  }

  // ==========================================
  // MODERATION EVENTS
  // ==========================================
  
  static contentModerated(userId: number, moderationData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.CONTENT_MODERATED, {
        action: moderationData.action,
        content_type: moderationData.content_type,
        content_id: moderationData.content_id,
        reason: moderationData.reason,
        message: `Your ${moderationData.content_type} was moderated: ${moderationData.reason}`
      });
      logger.info('Emitted content moderated', { userId, action: moderationData.action });
    }, 'contentModerated');
  }

  static userBanned(userId: number, banData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.USER_BANNED, {
        reason: banData.reason,
        permanent: banData.permanent || false,
        suspended_by: banData.suspendedBy,
        message: banData.permanent 
          ? '⚠️ Your account has been permanently suspended'
          : '⚠️ Your account has been temporarily suspended'
      });
      logger.info('Emitted user banned', { userId, permanent: banData.permanent });
    }, 'userBanned');
  }

  static userUnbanned(userId: number) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.USER_UNBANNED, {
        message: '✅ Your account has been reactivated. Welcome back!'
      });
      logger.info('Emitted user unbanned', { userId });
    }, 'userUnbanned');
  }

  static userRoleChanged(userId: number, roleData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.USER_ROLE_CHANGED, {
        old_role: roleData.old_role,
        new_role: roleData.new_role,
        changed_by: roleData.changed_by,
        message: `Your role has been changed to ${roleData.new_role}`
      });
      logger.info('Emitted user role changed', { userId, newRole: roleData.new_role });
    }, 'userRoleChanged');
  }

  static userDeleted(userId: number) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.USER_DELETED, {
        message: 'Your account has been permanently deleted'
      });
      logger.info('Emitted user deleted', { userId });
    }, 'userDeleted');
  }

  // ==========================================
  // CRAFT EVENTS
  // ==========================================
  
  static craftCreated(userId: number, craftData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.CRAFT_CREATED, {
        craft_id: craftData.idea_id,
        materials: craftData.materials,
        message: 'Craft idea saved successfully!'
      });
      logger.info('Emitted craft created', { userId, craftId: craftData.idea_id });
    }, 'craftCreated');
  }

  static craftDeleted(userId: number, craftId: number) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.CRAFT_DELETED, {
        craftId,
        message: 'Craft idea deleted'
      });
      logger.info('Emitted craft deleted', { userId, craftId });
    }, 'craftDeleted');
  }

  // ==========================================
  // NOTIFICATION EVENTS
  // ==========================================
  
  static notification(userId: number, notificationData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, WebSocketEvent.NOTIFICATION, {
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data,
        priority: notificationData.priority || 'normal',
        timestamp: new Date().toISOString()
      });
      logger.info('Emitted notification', { userId, type: notificationData.type });
    }, 'notification');
  }

  // ==========================================
  // SYSTEM EVENTS
  // ==========================================
  
  static systemMaintenance(maintenanceData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.SYSTEM_MAINTENANCE, {
        scheduled_at: maintenanceData.scheduled_at,
        duration: maintenanceData.duration,
        reason: maintenanceData.reason,
        message: `⚙️ System maintenance scheduled: ${maintenanceData.reason}`
      });
      logger.info('Broadcasted system maintenance');
    }, 'systemMaintenance');
  }

  static systemUpdate(updateData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(WebSocketEvent.SYSTEM_UPDATE, {
        version: updateData.version,
        features: updateData.features,
        message: `🚀 System updated to v${updateData.version}`
      });
      logger.info('Broadcasted system update');
    }, 'systemUpdate');
  }

  // ==========================================
  // ADMIN EVENTS
  // ==========================================
  
  static adminAlert(alertData: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToAdmins(WebSocketEvent.ADMIN_ALERT, {
        type: alertData.type,
        severity: alertData.severity || 'info',
        title: alertData.title,
        message: alertData.message,
        data: alertData.data,
        timestamp: new Date().toISOString()
      });
      logger.info('Emitted admin alert', { type: alertData.type });
    }, 'adminAlert');
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================
  
  /**
   * Broadcast to all connected clients
   */
  static broadcast(event: string, data: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.broadcast(event, data);
      logger.debug('Broadcasted custom event', { event });
    }, 'broadcast');
  }

  /**
   * Emit to specific user
   */
  static emitToUser(userId: number, event: string, data: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToUser(userId, event, data);
      logger.debug('Emitted to user', { userId, event });
    }, 'emitToUser');
  }

  /**
   * Emit to all admins
   */
  static emitToAdmins(event: string, data: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToAdmins(event, data);
      logger.debug('Emitted to admins', { event });
    }, 'emitToAdmins');
  }

  /**
   * Emit to users with specific role
   */
  static emitToRole(role: string, event: string, data: any) {
    this.safeEmit(() => {
      const ws = getWebSocketServer();
      ws.emitToRole(role, event, data);
      logger.debug('Emitted to role', { role, event });
    }, 'emitToRole');
  }

  /**
   * Check if user is online
   */
  static isUserOnline(userId: number): boolean {
    try {
      const ws = getWebSocketServer();
      return ws.isUserOnline(userId);
    } catch (error) {
      logger.error('Error checking user online status', error);
      return false;
    }
  }

  /**
   * Get total online users count
   */
  static getOnlineUsersCount(): number {
    try {
      const ws = getWebSocketServer();
      return ws.getOnlineUsersCount();
    } catch (error) {
      logger.error('Error getting online users count', error);
      return 0;
    }
  }
}

// Export for convenience
export default WebSocketEmitter;
