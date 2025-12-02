import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, MessageCircle, Send, User, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useSelector, useDispatch } from 'react-redux';
import { createComment, getPostComments, voteComment, deleteComment } from '@/services/operations/commentAPI';

interface CommentUser {
  _id: string;
  email?: string; // Make email optional since it might be undefined
}

interface Comment {
  _id: string;
  user?: CommentUser; // Make user optional since it might be undefined in some cases
  content: string;
  isAnonymous: boolean;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  replies: Comment[];
  parentComment?: string;
  userVote?: 'upvote' | 'downvote' | null;
}

interface CommentSectionProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  isVisible,
  onClose
}) => {
  const { token, user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [deletingComments, setDeletingComments] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
  });

  useEffect(() => {
    if (isVisible && postId) {
      fetchComments();
    }
  }, [isVisible, postId]);

  const fetchComments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await dispatch(getPostComments({ postId, page, limit: 10 }) as any);
      
      // Check if response is from rejected action
      if (response?.type?.endsWith('/rejected')) {
        console.error('API call was rejected:', response.error);
        throw new Error(response.error?.message || 'Failed to fetch comments');
      }
      
      const commentsData = response?.payload?.comments || response?.comments || [];
      const paginationData = response?.payload?.pagination || response?.pagination || {
        currentPage: 1,
        totalPages: 1,
        hasNext: false,
      };
      
      // comments data extracted
      
      if (page === 1) {
        setComments(commentsData);
      } else {
        setComments(prev => [...(prev || []), ...commentsData]);
      }
      setPagination(paginationData);
      // comments state updated
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Reset to empty array on error
      if (page === 1) {
        setComments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !token || isCreatingComment) return;

    // Create optimistic comment
    const optimisticComment: Comment = {
      _id: `temp-${Date.now()}`, // Temporary ID
      user: isAnonymous ? undefined : user,
      content: newComment.trim(),
      isAnonymous,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      totalVotes: 0,
      replies: [],
      userVote: null
    };

    try {
      setIsCreatingComment(true);
      
      // Add optimistic comment immediately
      setComments(prev => [optimisticComment, ...(prev || [])]);
      setNewComment('');
      setIsAnonymous(false);

      const commentData = {
        postId,
        content: optimisticComment.content,
        isAnonymous: optimisticComment.isAnonymous,
      };

      const result = await dispatch(createComment(commentData) as any);
      
      // Check if the action was fulfilled and extract the payload
      if (result.type.endsWith('/fulfilled') && result.payload) {
        const createdComment = result.payload;
        
        // Ensure the comment has proper user data for display
        const commentWithUserData = {
          ...createdComment,
          user: createdComment.user || (optimisticComment.isAnonymous ? undefined : user),
          upvotes: createdComment.upvotes || 0,
          downvotes: createdComment.downvotes || 0,
          totalVotes: createdComment.totalVotes || 0,
          replies: createdComment.replies || [],
          userVote: null
        };
        
        // Replace optimistic comment with real comment
        setComments(prev => prev.map(c => 
          c._id === optimisticComment._id ? commentWithUserData : c
        ));
      } else {
        console.error('Failed to create comment:', result);
        // Remove optimistic comment on failure
        setComments(prev => prev.filter(c => c._id !== optimisticComment._id));
        // Restore form values
        setNewComment(optimisticComment.content);
        setIsAnonymous(optimisticComment.isAnonymous);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      // Remove optimistic comment on error
      setComments(prev => prev.filter(c => c._id !== optimisticComment._id));
      // Restore form values
      setNewComment(optimisticComment.content);
      setIsAnonymous(optimisticComment.isAnonymous);
    } finally {
      setIsCreatingComment(false);
    }
  };


  const handleVoteComment = async (commentId: string, voteType: 'upvote' | 'downvote') => {
    if (!token) return;

    // Find the comment to update
    const updateCommentVote = (comments: Comment[], targetId: string): Comment[] => {
      if (!comments || !Array.isArray(comments)) return [];
      return comments.map(comment => {
        if (comment._id === targetId) {
          const currentVote = comment.userVote;
          let newUpvotes = comment.upvotes;
          let newDownvotes = comment.downvotes;
          let newUserVote: 'upvote' | 'downvote' | null = null;

          if (currentVote === voteType) {
            // Remove vote if same type
            if (voteType === 'upvote') {
              newUpvotes = Math.max(0, newUpvotes - 1);
            } else {
              newDownvotes = Math.max(0, newDownvotes - 1);
            }
            newUserVote = null;
          } else if (currentVote && currentVote !== voteType) {
            // Change vote type
            if (currentVote === 'upvote') {
              newUpvotes = Math.max(0, newUpvotes - 1);
              newDownvotes = newDownvotes + 1;
            } else {
              newDownvotes = Math.max(0, newDownvotes - 1);
              newUpvotes = newUpvotes + 1;
            }
            newUserVote = voteType;
          } else {
            // Add new vote
            if (voteType === 'upvote') {
              newUpvotes = newUpvotes + 1;
            } else {
              newDownvotes = newDownvotes + 1;
            }
            newUserVote = voteType;
          }

          return {
            ...comment,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: newUserVote,
            totalVotes: newUpvotes - newDownvotes
          };
        }

        // Update replies if comment has them
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentVote(comment.replies, targetId)
          };
        }

        return comment;
      });
    };

    // Optimistic update
    const previousComments = comments || [];
    setComments(prev => updateCommentVote(prev || [], commentId));

    try {
      await dispatch(voteComment({ commentId, voteType }) as any);
    } catch (error) {
      // Revert on error
      setComments(previousComments);
      console.error('Error voting on comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token || deletingComments.has(commentId)) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this comment? This action cannot be undone.');
    if (!confirmDelete) return;

    setDeletingComments(prev => new Set(prev).add(commentId));

    try {
      await dispatch(deleteComment(commentId) as any);
      
      // Remove comment from local state
      const removeComment = (comments: Comment[]): Comment[] => {
        if (!comments || !Array.isArray(comments)) return [];
        return comments.filter(comment => {
          if (comment._id === commentId) {
            return false;
          }
          // Also remove from replies
          if (comment.replies && comment.replies.length > 0) {
            comment.replies = removeComment(comment.replies);
          }
          return true;
        });
      };

      setComments(prev => removeComment(prev || []));
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setDeletingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const canDeleteComment = (comment: Comment) => {
    if (!user || !token) return false;
    // Check if the current user owns the comment
    return comment.user && user.email === comment.user.email;
  };

  const getDisplayName = (user: CommentUser | undefined, anonymous: boolean) => {
    if (anonymous) return 'Anonymous';
    if (!user || !user.email) return 'Unknown User';
    const emailParts = user.email.split('@');
    return emailParts[0];
  };

  const getInitials = (user: CommentUser | undefined, anonymous: boolean) => {
    if (anonymous) return '?';
    if (!user || !user.email) return 'U';
    const name = getDisplayName(user, false);
    return name.charAt(0).toUpperCase();
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => {
    // Early return if comment is invalid
    if (!comment || !comment._id) {
      console.error('Invalid comment data:', comment);
      return (
        <div className="text-sm text-muted-foreground p-3 bg-muted/20 rounded">
          Error: Invalid comment data
        </div>
      );
    }

    const [showMenu, setShowMenu] = useState(false);
    const isDeleting = deletingComments.has(comment._id);
    const isOptimistic = comment._id.startsWith('temp-'); // Check if this is an optimistic comment
    
    // Local state for vote counts and user vote to handle optimistic updates
    const [localUpvotes, setLocalUpvotes] = useState(comment.upvotes || 0);
    const [ , setLocalDownvotes] = useState(comment.downvotes || 0);
    const [localUserVote, setLocalUserVote] = useState<'upvote' | 'downvote' | null>(comment.userVote || null);
    
    // Local state for reply form
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isAnonymousReply, setIsAnonymousReply] = useState(false);
    const [isCreatingReply, setIsCreatingReply] = useState(false);
    
    // Update local state when comment prop changes (including on page reload)
    useEffect(() => {
      setLocalUpvotes(comment.upvotes || 0);
      setLocalDownvotes(comment.downvotes || 0);
      setLocalUserVote(comment.userVote || null);
    }, [comment._id, comment.upvotes, comment.downvotes, comment.userVote]);

    // Handle reply form submission
    const handleCreateReply = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!replyContent.trim() || !token || isCreatingReply) return;

      // Create optimistic reply
      const optimisticReply: Comment = {
        _id: `temp-reply-${Date.now()}`, // Temporary ID
        user: isAnonymousReply ? undefined : user,
        content: replyContent.trim(),
        isAnonymous: isAnonymousReply,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        totalVotes: 0,
        replies: [],
        parentComment: comment._id,
        userVote: null
      };

      try {
        setIsCreatingReply(true);
        
        // Add optimistic reply immediately
        setComments(prev => (prev || []).map(c => 
          c._id === comment._id 
            ? { ...c, replies: [...(c.replies || []), optimisticReply] }
            : c
        ));
        
        const originalReplyContent = replyContent;
        const originalIsAnonymous = isAnonymousReply;
        setReplyContent('');
        setShowReplyForm(false);
        setIsAnonymousReply(false);

        const replyData = {
          postId,
          content: optimisticReply.content,
          parentComment: comment._id,
          isAnonymous: optimisticReply.isAnonymous,
        };

        const result = await dispatch(createComment(replyData) as any);
        
        // Check if the action was fulfilled and extract the payload
        if (result.type.endsWith('/fulfilled') && result.payload) {
          const createdReply = result.payload;
          
          // Ensure the reply has proper user data for display
          const replyWithUserData = {
            ...createdReply,
            user: createdReply.user || (optimisticReply.isAnonymous ? undefined : user),
            upvotes: createdReply.upvotes || 0,
            downvotes: createdReply.downvotes || 0,
            totalVotes: createdReply.totalVotes || 0,
            replies: createdReply.replies || [],
            userVote: null
          };
          
          // Replace optimistic reply with real reply
          setComments(prev => (prev || []).map(c => 
            c._id === comment._id 
              ? { 
                  ...c, 
                  replies: c.replies?.map(r => 
                    r._id === optimisticReply._id ? replyWithUserData : r
                  ) || []
                }
              : c
          ));
        } else {
          console.error('Failed to create reply:', result);
          // Remove optimistic reply on failure
          setComments(prev => (prev || []).map(c => 
            c._id === comment._id 
              ? { 
                  ...c, 
                  replies: c.replies?.filter(r => r._id !== optimisticReply._id) || []
                }
              : c
          ));
          // Restore form values
          setReplyContent(originalReplyContent);
          setIsAnonymousReply(originalIsAnonymous);
          setShowReplyForm(true);
        }
      } catch (error) {
        console.error('Error creating reply:', error);
        // Remove optimistic reply on error
        setComments(prev => (prev || []).map(c => 
          c._id === comment._id 
            ? { 
                ...c, 
                replies: c.replies?.filter(r => r._id !== optimisticReply._id) || []
              }
            : c
        ));
        // Restore form values
        setReplyContent(replyContent);
        setIsAnonymousReply(isAnonymousReply);
        setShowReplyForm(true);
      } finally {
        setIsCreatingReply(false);
      }
    };

    const indentation = isReply ? 'ml-8 pl-6 border-l border-white/10' : 'pl-6';
    return (
      <div className={`${indentation} ${isDeleting ? 'opacity-50' : ''} ${isOptimistic ? 'opacity-70' : ''}`}>
        <div className="relative flex gap-3 py-4">
          <span
            className="pointer-events-none absolute -left-3 top-4 h-2 w-2 rounded-full bg-white/60 shadow-[0_0_15px_rgba(255,255,255,0.45)]"
            aria-hidden
          />
          {!isReply && (
            <span className="pointer-events-none absolute -left-8 top-5 hidden h-px w-6 bg-white/15 sm:block" aria-hidden />
          )}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[0.65rem] uppercase tracking-[0.3em] text-white/70">
            {comment.isAnonymous ? (
              <User className="h-4 w-4" />
            ) : (
              <span>{getInitials(comment.user, comment.isAnonymous)}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/40">
              <div className="flex flex-wrap items-center gap-2 text-white/70">
                <span className="text-sm font-medium text-white/90 tracking-normal">
                  {getDisplayName(comment.user, comment.isAnonymous)}
                </span>
                {comment.isAnonymous && (
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.3em] text-white/50">
                    Anonymous
                  </span>
                )}
                <span className="text-[0.6rem] uppercase tracking-[0.35em] text-white/40">
                  {isOptimistic ? 'Posting…' : formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>

              {canDeleteComment(comment) && !isOptimistic && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 rounded-full border border-white/10 p-0 text-white/60 hover:text-white"
                    onClick={() => setShowMenu(!showMenu)}
                    disabled={isDeleting}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>

                  {showMenu && (
                    <div className="absolute right-0 top-8 min-w-32 rounded-2xl border border-white/10 bg-background/80 px-3 py-2 text-left text-xs uppercase tracking-[0.3em] text-white/60 backdrop-blur">
                      <button
                        onClick={() => {
                          handleDeleteComment(comment._id);
                          setShowMenu(false);
                        }}
                        disabled={isDeleting}
                        className="flex w-full items-center gap-2 text-red-400 transition hover:text-red-200"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}

                  {showMenu && (
                    <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
                  )}
                </div>
              )}
            </div>

            <p className="mt-2 text-sm leading-relaxed text-white/80">{comment.content}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-white/50">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 rounded-full border border-white/10 px-3 text-white/60 transition ${
                  localUserVote === 'upvote' ? 'bg-white/10 text-white border-white/30' : 'hover:text-white'
                } ${!token || isDeleting || isOptimistic ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={() => handleVoteComment(comment._id, 'upvote')}
                disabled={!token || isDeleting || isOptimistic}
              >
                <ArrowUp className="mr-2 h-3 w-3" />
                {localUpvotes}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-7 rounded-full border border-white/10 px-3 text-white/60 transition ${
                  localUserVote === 'downvote' ? 'bg-white/10 text-white border-white/30' : 'hover:text-white'
                } ${!token || isDeleting || isOptimistic ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={() => handleVoteComment(comment._id, 'downvote')}
                disabled={!token || isDeleting || isOptimistic}
              >
                <ArrowDown className="mr-2 h-3 w-3" />
                {/* downvote count hidden per UX */}
              </Button>

              {!isReply && token && !isOptimistic && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-full border border-white/10 px-4 text-white/60 transition hover:text-white"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  disabled={isDeleting}
                >
                  <MessageCircle className="mr-2 h-3 w-3" />
                  Reply
                </Button>
              )}
            </div>

            {showReplyForm && !isDeleting && (
              <form onSubmit={handleCreateReply} className="mt-4 space-y-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Drop a reply"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/40"
                  rows={2}
                />
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isAnonymousReply}
                      onChange={(e) => setIsAnonymousReply(e.target.checked)}
                      className="rounded border-white/20 bg-transparent"
                    />
                    Reply anonymously
                  </label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-full px-4 text-white/60 hover:text-white"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyContent('');
                        setIsAnonymousReply(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="rounded-full px-5"
                      disabled={!replyContent.trim() || isCreatingReply}
                    >
                      {isCreatingReply ? 'Replying…' : 'Reply'}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2 space-y-2">
                {comment.replies
                  .filter(reply => reply && reply._id)
                  .map((reply) => (
                    <CommentItem key={reply._id} comment={reply} isReply={true} />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="pt-6 text-white/80">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.35em] text-white/40">
        <span>Comment Stream</span>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full border border-white/10 px-4 text-white/60 hover:text-white"
          onClick={onClose}
        >
          Hide
        </Button>
      </div>

      {token && (
        <form onSubmit={handleCreateComment} className="mb-8 space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="What's your take?"
            className="w-full resize-none rounded-3xl border border-white/10 bg-transparent px-5 py-4 text-sm text-white/80 outline-none transition focus:border-white/40"
            rows={3}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-white/20 bg-transparent"
              />
              Comment anonymously
            </label>
            <Button
              type="submit"
              size="sm"
              className="rounded-full px-6"
              disabled={!newComment.trim() || isCreatingComment}
            >
              <Send className="mr-2 h-3 w-3" />
              {isCreatingComment ? 'Posting…' : 'Comment'}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-1">
        {loading && (!comments || comments.length === 0) ? (
          <div className="py-6 text-center text-sm text-white/50">Loading comments…</div>
        ) : comments && comments.length > 0 ? (
          <>
            {comments
              .filter(comment => comment && comment._id)
              .map((comment) => (
                <CommentItem key={comment._id} comment={comment} />
              ))}

            {pagination?.hasNext && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full border border-white/10 px-6 text-white/60 hover:text-white"
                  onClick={() => fetchComments(pagination.currentPage + 1)}
                  disabled={loading}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 text-center text-sm text-white/50">
            <MessageCircle className="mx-auto mb-3 h-6 w-6" />
            <p>No comments yet.</p>
            {token && <p className="mt-1 text-xs uppercase tracking-[0.35em]">Be first.</p>}
          </div>
        )}
      </div>
    </div>
  );
};
