// utils/timeUtils.ts
export const formatTimeAgo = (dateString?: string | null): string => {
  if (!dateString) return 'unknown';

  try {
    const now = new Date();
    const postDate = new Date(dateString);

    if (isNaN(postDate.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'unknown';
    }

    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 0) return 'now';
    if (diffInSeconds < 30) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;

    // For older posts, show formatted date
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      ...(postDate.getFullYear() !== now.getFullYear() && { year: 'numeric' })
    };
    return postDate.toLocaleDateString('en-US', options);

  } catch (error) {
    console.warn('Error formatting time:', error);
    return 'unknown';
  }
};
