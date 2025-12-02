import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, MessageCircle, Share, MoreHorizontal, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CommentSection } from './CommentSection';

interface PostUser {
  _id: string;
  email: string;
}

interface Post {
  _id: string;
  user: PostUser;
  title: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  commentsCount: number;
  imageUrl?: string; // Changed from 'image' to 'imageUrl' to match backend
  userVote?: 'upvote' | 'downvote' | null; // Add user's current vote
}

interface PostCardProps {
  post: Post;
  onUpvote?: (postId: string) => void;
  onDownvote?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  showComments?: boolean;
  onCloseComments?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onUpvote,
  onDownvote,
  onComment,
  onShare,
  showComments = false,
  onCloseComments
}) => {
  const { token } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(post.userVote || null);
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(post.downvotes);
  const [isVoting, setIsVoting] = useState(false);

  // Update local state when post prop changes (including on page reload)
  useEffect(() => {
    setUserVote(post.userVote || null);
    setLocalUpvotes(post.upvotes);
    setLocalDownvotes(post.downvotes);
  }, [post._id, post.userVote, post.upvotes, post.downvotes]); // Added post._id to dependency array

  const handleUpvote = async () => {
    if (!token || isVoting) return;
    
    setIsVoting(true);
    const previousVote = userVote;
    const previousUpvotes = localUpvotes;
    const previousDownvotes = localDownvotes;

    try {
      if (userVote === 'upvote') {
        // Remove upvote
        setUserVote(null);
        setLocalUpvotes(prev => prev - 1);
      } else if (userVote === 'downvote') {
        // Change from downvote to upvote
        setUserVote('upvote');
        setLocalUpvotes(prev => prev + 1);
        setLocalDownvotes(prev => prev - 1);
      } else {
        // Add upvote
        setUserVote('upvote');
        setLocalUpvotes(prev => prev + 1);
      }

      await onUpvote?.(post._id);
    } catch (error) {
      // Revert on error
      setUserVote(previousVote);
      setLocalUpvotes(previousUpvotes);
      setLocalDownvotes(previousDownvotes);
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDownvote = async () => {
    if (!token || isVoting) return;
    
    setIsVoting(true);
    const previousVote = userVote;
    const previousUpvotes = localUpvotes;
    const previousDownvotes = localDownvotes;

    try {
      if (userVote === 'downvote') {
        // Remove downvote
        setUserVote(null);
        setLocalDownvotes(prev => prev - 1);
      } else if (userVote === 'upvote') {
        // Change from upvote to downvote
        setUserVote('downvote');
        setLocalDownvotes(prev => prev + 1);
        setLocalUpvotes(prev => prev - 1);
      } else {
        // Add downvote
        setUserVote('downvote');
        setLocalDownvotes(prev => prev + 1);
      }

      await onDownvote?.(post._id);
    } catch (error) {
      // Revert on error
      setUserVote(previousVote);
      setLocalUpvotes(previousUpvotes);
      setLocalDownvotes(previousDownvotes);
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getDisplayName = () => {
    if (post.isAnonymous) {
      return 'Anonymous';
    }
    // Extract username from email or use email
    const emailParts = post.user.email.split('@');
    return emailParts[0];
  };

  const getInitials = () => {
    if (post.isAnonymous) {
      return '?';
    }
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const handlePostClick = () => {
    // Navigate to post details page when clicking on the post
    navigate(`/post/${post._id}`);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    // Prevent navigating to post and stop propagation
    e.stopPropagation();
    if (post.isAnonymous || !post.user?._id) return;
    navigate(`/user/${post.user._id}`);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    // Stop event propagation to prevent post navigation
    e.stopPropagation();
    // Use the external onComment handler
    onComment?.(post._id);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    // Stop event propagation for all action buttons
    e.stopPropagation();
  };

  return (
    <article className="group relative pl-10 sm:pl-14 w-full max-w-full overflow-hidden">
      <span
        className="pointer-events-none absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute left-[11px] top-6 h-2 w-2 rounded-full bg-white/70 shadow-[0_0_25px_rgba(255,255,255,0.45)] transition duration-500 group-hover:scale-125"
        aria-hidden
      />

      <div className="relative ml-2 w-full rounded-2xl border border-white/8 bg-white/3 px-4 py-4 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              onClick={handleUserClick}
              role={post.isAnonymous ? undefined : 'button'}
              tabIndex={post.isAnonymous ? -1 : 0}
              onKeyDown={(e) => {
                if (!post.isAnonymous && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  navigate(`/user/${post.user._id}`);
                }
              }}
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-xs font-semibold uppercase tracking-[0.2em] text-white/70"
            >
              {post.isAnonymous ? <User className="h-4 w-4" /> : getInitials()}
              <span className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full border border-white/10 opacity-30" />
            </div>
            <div>
              <p
                className={`text-sm font-medium leading-tight ${post.isAnonymous ? 'text-white/90' : 'text-white/90 cursor-pointer hover:underline'}`}
                onClick={(e) => {
                  handleUserClick(e as any);
                }}
                role={post.isAnonymous ? undefined : 'link'}
                tabIndex={post.isAnonymous ? -1 : 0}
                onKeyDown={(e) => {
                  if (!post.isAnonymous && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    navigate(`/user/${post.user._id}`);
                  }
                }}
              >
                {getDisplayName()}
                {post.isAnonymous && (
                  <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.25em] text-white/60">
                    Anonymous
                  </span>
                )}
              </p>
              <p className="text-xs text-white/40">
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-white/10 text-white/60 hover:border-white/40 hover:text-white"
            onClick={handleActionClick}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          <h3
            className="text-xl font-light leading-tight text-white hover:text-white/90 break-words"
            onClick={handlePostClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePostClick();
              }
            }}
          >
            {post.title}
          </h3>
          <p className="text-sm leading-relaxed text-white/70 break-words">{post.content}</p>

          {post.imageUrl && (
            <div className="overflow-hidden rounded-2xl border border-white/8">
              <img
                src={post.imageUrl}
                alt="Post visual"
                className="h-auto w-full max-h-[18rem] cursor-pointer object-cover transition hover:opacity-90"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(post.imageUrl, '_blank');
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-white/50">
          <span className="flex items-center gap-2">
            <span className="h-1 w-5 rounded-full bg-white/20" />
            {post.totalVotes} pulse
          </span>
          <span>{post.commentsCount} replies</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!token || isVoting}
              className={`h-9 rounded-full border border-white/10 px-3 text-[0.72rem] text-white/70 transition ${
                userVote === 'upvote'
                  ? 'bg-white text-black shadow-[0_15px_35px_rgba(255,255,255,0.15)]'
                  : 'hover:border-white/40 hover:text-white'
              } ${!token ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                handleActionClick(e);
                handleUpvote();
              }}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              {localUpvotes}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={!token || isVoting}
              className={`h-9 rounded-full border border-white/10 px-3 text-[0.72rem] text-white/70 transition ${
                userVote === 'downvote'
                  ? 'bg-white text-black shadow-[0_15px_35px_rgba(255,255,255,0.15)]'
                  : 'hover:border-white/40 hover:text-white'
              } ${!token ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                handleActionClick(e);
                handleDownvote();
              }}
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              {/* downvote count intentionally hidden per UX */}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 rounded-full border border-white/10 px-3 text-[0.72rem] transition ${
                showComments ? 'bg-white text-black' : 'text-white/70 hover:text-white'
              }`}
              onClick={handleCommentClick}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {post.commentsCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-full border border-white/10 px-3 text-[0.72rem] transition hover:text-white"
              onClick={handlePostClick}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-full border border-white/10 px-3 text-[0.72rem] transition hover:text-white"
              onClick={(e) => {
                handleActionClick(e);
                onShare?.(post._id);
              }}
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          className={`mt-6 overflow-hidden rounded-3xl transition-all duration-500 ${
            showComments ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <CommentSection
            postId={post._id}
            isVisible={showComments}
            onClose={onCloseComments || (() => {})}
          />
        </div>
      </div>
    </article>
  );
};
