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
  image_url?: string | null;  // ✅ Allow undefined and null
  category: string;
  tags?: string[];  // ✅ Make optional
  featured?: boolean;  // ✅ Make optional
  commentCount: number;
  likeCount: number;
  isLiked?: boolean;  // ✅ Make optional
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;  // ✅ Allow null
  user?: User;  // ✅ Make optional
  onToggleReaction?: () => void;
  onOpenComments?: () => void;
}
