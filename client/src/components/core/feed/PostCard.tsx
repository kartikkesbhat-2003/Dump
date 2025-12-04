import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, MessageCircle, Share, MoreHorizontal, User, ExternalLink, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CommentSection } from './CommentSection';
import { deletePost } from '@/services/operations/postAPI';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface PostUser {
  _id: string;
  email: string;
  username?: string;
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
  onDelete?: (postId: string) => void;
  showComments?: boolean;
  onCloseComments?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onUpvote,
  onDownvote,
  onComment,
  onShare,
  onDelete,
  showComments = false,
  onCloseComments
}) => {
  const { token } = useSelector((state: any) => state.auth);
  const profileUser = useSelector((state: any) => state.profile?.user);
  const dispatch = useDispatch<any>();
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
    // Prefer explicit username from embedded post user
    if (post.user && (post.user as any).username) return (post.user as any).username;
    // If viewing a profile page, prefer profile username when IDs match
    if (profileUser && post.user && profileUser._id && post.user._id && profileUser._id === post.user._id && profileUser.username) {
      return profileUser.username;
    }
    // Fall back to a generic handle instead of deriving from email
    return 'traveler';
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

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <article className="group relative w-full overflow-hidden">

      <div className="relative w-full rounded-2xl border border-white/8 bg-white/3 px-3 py-3 sm:px-4 sm:py-4 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
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
              className="relative flex h-8 w-8 sm:h-9 sm:w-9 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-[0.6rem] sm:text-xs font-semibold uppercase tracking-[0.2em] text-white/70"
            >
              {post.isAnonymous ? <User className="h-4 w-4" /> : getInitials()}
            </div>
            <div className="min-w-0">
              <p
                className={`truncate text-sm sm:text-[0.95rem] font-medium leading-tight ${post.isAnonymous ? 'text-white/90' : 'text-white/90 cursor-pointer hover:underline'}`}
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
              <p className="text-[0.7rem] sm:text-xs text-white/40">
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-white/10 text-white/60 hover:border-white/40 hover:text-white"
              onClick={(e) => {
                handleActionClick(e);
                setShowMenu((prev) => !prev);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>

            {showMenu && (
              <>
                <div className="absolute right-0 mt-2 min-w-40 rounded-2xl border border-white/10 bg-background/90 px-3 py-2 text-xs text-white/70 backdrop-blur shadow-lg z-20">
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/10 text-left"
                    onClick={() => {
                      setShowMenu(false);
                      handlePostClick();
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open post</span>
                  </button>

                  <button
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/10 text-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onShare?.(post._id);
                    }}
                  >
                    <Share className="h-3.5 w-3.5" />
                    <span>Share</span>
                  </button>

                  {(() => {
                    try {
                      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
                      if (currentUser && currentUser._id && post.user && post.user._id && currentUser._id === post.user._id) {
                        return (
                          <button
                            className="mt-1 flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-200 text-left"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenu(false);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash className="h-3.5 w-3.5" />
                            <span>Delete post</span>
                          </button>
                        );
                      }
                    } catch {
                      // ignore parse errors
                    }
                    return null;
                  })()}
                </div>
                {/* backdrop to close menu on outside click */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
              </>
            )}
          </div>
        </div>

        <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
          <h3
            className="text-base sm:text-lg lg:text-xl font-light leading-tight text-white hover:text-white/90 break-words"
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
          <p className="text-[0.85rem] sm:text-sm leading-relaxed text-white/70 break-words line-clamp-4 sm:line-clamp-none">
            {post.content}
          </p>

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

        <div className="mt-3 sm:mt-4 flex items-center gap-3 sm:gap-4 text-[0.7rem] sm:text-xs text-white/50">
          <span className="flex items-center gap-2">
            <span className="h-1 w-5 rounded-full bg-white/20" />
            {post.totalVotes} pulse
          </span>
          <span>{post.commentsCount} replies</span>
        </div>

        <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2 sm:gap-3 border-t border-white/10 pt-2.5 sm:pt-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!token || isVoting}
              className={`h-8 sm:h-9 w-10 sm:w-auto rounded-full border border-white/10 px-0 sm:px-3 text-[0.7rem] sm:text-[0.72rem] text-white/70 transition justify-center ${
                userVote === 'upvote'
                  ? 'bg-white text-black shadow-[0_15px_35px_rgba(255,255,255,0.15)]'
                  : 'hover:border-white/40 hover:text-white'
              } ${!token ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                handleActionClick(e);
                handleUpvote();
              }}
            >
              <ArrowUp className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">{localUpvotes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={!token || isVoting}
              className={`h-8 sm:h-9 w-10 sm:w-auto rounded-full border border-white/10 px-0 sm:px-3 text-[0.7rem] sm:text-[0.72rem] text-white/70 transition justify-center ${
                userVote === 'downvote'
                  ? 'bg-white text-black shadow-[0_15px_35px_rgba(255,255,255,0.15)]'
                  : 'hover:border-white/40 hover:text-white'
              } ${!token ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                handleActionClick(e);
                handleDownvote();
              }}
            >
              <ArrowDown className="h-4 w-4" />
              {/* downvote count intentionally hidden per UX */}
            </Button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 sm:h-9 w-10 sm:w-auto rounded-full border border-white/10 px-0 sm:px-3 text-[0.7rem] sm:text-[0.72rem] transition justify-center ${
                showComments ? 'bg-white text-black' : 'text-white/70 hover:text-white'
              }`}
              onClick={handleCommentClick}
            >
              <MessageCircle className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">{post.commentsCount}</span>
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
            postOwnerId={post.user?._id}
            isVisible={showComments}
            onClose={onCloseComments || (() => {})}
          />
        </div>

        {/* Delete confirmation dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete post</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete the post and its associated comments and votes. Do you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-4 flex items-center justify-center gap-3 sm:justify-end">
              <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    await dispatch(deletePost(post._id));
                    setIsDeleteOpen(false);
                    onDelete?.(post._id);
                    if (!onDelete) navigate('/');
                  } catch (err) {
                    console.error('Failed to delete post', err);
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
};
