// apps/mobile/src/components/feed/post/type.ts - FIXED with proper optional types
export interface User {
  user_id: number;
  username: string;
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
  };
  onToggleReaction?: () => void;
  onOpenComments?: () => void;
  onOptionsPress?: () => void;
  onShare?: () => void;  // NEW: Share handler
  onPress?: () => void;  // NEW: Click handler to open details
}


