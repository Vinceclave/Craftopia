// apps/web/src/hooks/useWebSocketSponsors.ts
import { useEffect } from 'react';
import { websocketService, WebSocketEvent } from '@/lib/websocket';

interface SponsorEventCallbacks {
  onSponsorCreated?: (data: any) => void;
  onSponsorUpdated?: (data: any) => void;
  onSponsorDeleted?: (data: any) => void;
}

interface RewardEventCallbacks {
  onRewardCreated?: (data: any) => void;
  onRewardUpdated?: (data: any) => void;
  onRewardDeleted?: (data: any) => void;
  onRewardRedeemed?: (data: any) => void;
}

interface RedemptionEventCallbacks {
  onRedemptionCreated?: (data: any) => void;
  onRedemptionFulfilled?: (data: any) => void;
  onRedemptionCancelled?: (data: any) => void;
}

// ==========================================
// SPONSOR EVENTS HOOK
// ==========================================
export const useWebSocketSponsors = (callbacks: SponsorEventCallbacks) => {
  useEffect(() => {
    const { onSponsorCreated, onSponsorUpdated, onSponsorDeleted } = callbacks;

    if (onSponsorCreated) {
      websocketService.on(WebSocketEvent.SPONSOR_CREATED, onSponsorCreated);
    }
    if (onSponsorUpdated) {
      websocketService.on(WebSocketEvent.SPONSOR_UPDATED, onSponsorUpdated);
    }
    if (onSponsorDeleted) {
      websocketService.on(WebSocketEvent.SPONSOR_DELETED, onSponsorDeleted);
    }

    return () => {
      if (onSponsorCreated) {
        websocketService.off(WebSocketEvent.SPONSOR_CREATED, onSponsorCreated);
      }
      if (onSponsorUpdated) {
        websocketService.off(WebSocketEvent.SPONSOR_UPDATED, onSponsorUpdated);
      }
      if (onSponsorDeleted) {
        websocketService.off(WebSocketEvent.SPONSOR_DELETED, onSponsorDeleted);
      }
    };
  }, [callbacks]);
};

// ==========================================
// REWARD EVENTS HOOK
// ==========================================
export const useWebSocketRewards = (callbacks: RewardEventCallbacks) => {
  useEffect(() => {
    const { onRewardCreated, onRewardUpdated, onRewardDeleted, onRewardRedeemed } = callbacks;

    if (onRewardCreated) {
      websocketService.on(WebSocketEvent.REWARD_CREATED, onRewardCreated);
    }
    if (onRewardUpdated) {
      websocketService.on(WebSocketEvent.REWARD_UPDATED, onRewardUpdated);
    }
    if (onRewardDeleted) {
      websocketService.on(WebSocketEvent.REWARD_DELETED, onRewardDeleted);
    }
    if (onRewardRedeemed) {
      websocketService.on(WebSocketEvent.REWARD_REDEEMED, onRewardRedeemed);
    }

    return () => {
      if (onRewardCreated) {
        websocketService.off(WebSocketEvent.REWARD_CREATED, onRewardCreated);
      }
      if (onRewardUpdated) {
        websocketService.off(WebSocketEvent.REWARD_UPDATED, onRewardUpdated);
      }
      if (onRewardDeleted) {
        websocketService.off(WebSocketEvent.REWARD_DELETED, onRewardDeleted);
      }
      if (onRewardRedeemed) {
        websocketService.off(WebSocketEvent.REWARD_REDEEMED, onRewardRedeemed);
      }
    };
  }, [callbacks]);
};

// ==========================================
// REDEMPTION EVENTS HOOK
// ==========================================
export const useWebSocketRedemptions = (callbacks: RedemptionEventCallbacks) => {
  useEffect(() => {
    const { onRedemptionCreated, onRedemptionFulfilled, onRedemptionCancelled } = callbacks;

    if (onRedemptionCreated) {
      websocketService.on(WebSocketEvent.REDEMPTION_CREATED, onRedemptionCreated);
    }
    if (onRedemptionFulfilled) {
      websocketService.on(WebSocketEvent.REDEMPTION_FULFILLED, onRedemptionFulfilled);
    }
    if (onRedemptionCancelled) {
      websocketService.on(WebSocketEvent.REDEMPTION_CANCELLED, onRedemptionCancelled);
    }

    return () => {
      if (onRedemptionCreated) {
        websocketService.off(WebSocketEvent.REDEMPTION_CREATED, onRedemptionCreated);
      }
      if (onRedemptionFulfilled) {
        websocketService.off(WebSocketEvent.REDEMPTION_FULFILLED, onRedemptionFulfilled);
      }
      if (onRedemptionCancelled) {
        websocketService.off(WebSocketEvent.REDEMPTION_CANCELLED, onRedemptionCancelled);
      }
    };
  }, [callbacks]);
};

// ==========================================
// COMBINED SPONSOR MANAGEMENT HOOK
// ==========================================
export const useWebSocketSponsorManagement = (callbacks: {
  sponsors?: SponsorEventCallbacks;
  rewards?: RewardEventCallbacks;
  redemptions?: RedemptionEventCallbacks;
}) => {
  if (callbacks.sponsors) {
    useWebSocketSponsors(callbacks.sponsors);
  }
  if (callbacks.rewards) {
    useWebSocketRewards(callbacks.rewards);
  }
  if (callbacks.redemptions) {
    useWebSocketRedemptions(callbacks.redemptions);
  }
};