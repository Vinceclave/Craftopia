// apps/mobile/src/components/feed/post/type.ts - FIXED with proper optional types
export interface User {
  user_id: number;
  username: string;
    profile_picture_url?: string; // ✅ Added for profile photos

}

export interface Comment {
  comment_id: number;
  user_id: number;
  content: string;
  likeCount: number;
  isLiked: boolean;
  created_at: string;
  user: User;
}

export interface PostProps {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  image_url?: string | null;
  category?: string;
  tags?: string[];
  featured?: boolean;
  commentCount?: number;
  likeCount?: number;
  isLiked?: boolean;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  user?: {
    user_id: number;
    username: string;
        profile_picture_url?: string; // ✅ Added for profile photos

  };
  onToggleReaction?: () => void;
  onOpenComments?: () => void;
  onOptionsPress?: () => void;
  onPress?: () => void;  // NEW: Click handler to open details
}


