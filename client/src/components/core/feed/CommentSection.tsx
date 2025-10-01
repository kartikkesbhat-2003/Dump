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
      console.log('Fetching comments for postId:', postId, 'page:', page);
      const response = await dispatch(getPostComments({ postId, page, limit: 10 }) as any);
      console.log('Comments API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response payload:', response?.payload);
      
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
      
      console.log('Extracted comments data:', commentsData);
      console.log('Comments data length:', commentsData.length);
      
      if (page === 1) {
        setComments(commentsData);
      } else {
        setComments(prev => [...(prev || []), ...commentsData]);
      }
      setPagination(paginationData);
      console.log('Comments state updated:', commentsData.length, 'comments');
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
    const [localDownvotes, setLocalDownvotes] = useState(comment.downvotes || 0);
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

    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''} ${isDeleting ? 'opacity-50' : ''} ${isOptimistic ? 'opacity-70 bg-muted/20 rounded-lg p-2' : ''}`}>
        <div className="flex gap-3 py-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
            {comment.isAnonymous ? (
              <User className="h-4 w-4 text-muted-foreground" />
            ) : (
              <span className="text-xs font-medium">{getInitials(comment.user, comment.isAnonymous)}</span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {getDisplayName(comment.user, comment.isAnonymous)}
                </span>
                {comment.isAnonymous && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    Anonymous
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {isOptimistic ? 'Posting...' : formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>

              {/* Comment Menu */}
              {canDeleteComment(comment) && !isOptimistic && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowMenu(!showMenu)}
                    disabled={isDeleting}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>

                  {showMenu && (
                    <div className="absolute right-0 top-6 bg-background border border-border rounded-lg shadow-lg py-1 z-10 min-w-32">
                      <button
                        onClick={() => {
                          handleDeleteComment(comment._id);
                          setShowMenu(false);
                        }}
                        disabled={isDeleting}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}

                  {/* Backdrop to close menu */}
                  {showMenu && (
                    <div 
                      className="fixed inset-0 z-5" 
                      onClick={() => setShowMenu(false)}
                    />
                  )}
                </div>
              )}
            </div>
            
            <p className="text-sm text-foreground mb-2">{comment.content}</p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-1 ${
                    localUserVote === 'upvote'
                      ? 'text-green-600 bg-green-50'
                      : 'text-muted-foreground hover:text-green-600'
                  }`}
                  onClick={() => handleVoteComment(comment._id, 'upvote')}
                  disabled={!token || isDeleting || isOptimistic}
                >
                  <ArrowUp className={`h-3 w-3 mr-1 ${localUserVote === 'upvote' ? 'fill-green-600' : ''}`} />
                  <span className="text-xs">{localUpvotes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-1 ${
                    localUserVote === 'downvote'
                      ? 'text-red-600 bg-red-50'
                      : 'text-muted-foreground hover:text-red-600'
                  }`}
                  onClick={() => handleVoteComment(comment._id, 'downvote')}
                  disabled={!token || isDeleting || isOptimistic}
                >
                  <ArrowDown className={`h-3 w-3 mr-1 ${localUserVote === 'downvote' ? 'fill-red-600' : ''}`} />
                  <span className="text-xs">{localDownvotes}</span>
                </Button>
              </div>
              
              {!isReply && token && !isOptimistic && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-muted-foreground hover:text-blue-600"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  disabled={isDeleting}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  <span className="text-xs">Reply</span>
                </Button>
              )}
            </div>
            
            {/* Reply Form */}
            {showReplyForm && !isDeleting && (
              <form onSubmit={handleCreateReply} className="mt-3">
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium">Y</span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={2}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={isAnonymousReply}
                          onChange={(e) => setIsAnonymousReply(e.target.checked)}
                          className="rounded"
                        />
                        Reply anonymously
                      </label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowReplyForm(false);
                            setReplyContent('');
                            setIsAnonymousReply(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={!replyContent.trim() || isCreatingReply}>
                          {isCreatingReply ? 'Replying...' : 'Reply'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
            
            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3">
                {comment.replies
                  .filter(reply => reply && reply._id) // Filter out invalid replies
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
    <div className="border-t border-border bg-card">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Comments</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Hide
          </Button>
        </div>

        {/* Comment Form */}
        {token && (
          <form onSubmit={handleCreateComment} className="mb-6">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium">Y</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded"
                    />
                    Comment anonymously
                  </label>
                  <Button type="submit" size="sm" disabled={!newComment.trim() || isCreatingComment}>
                    <Send className="h-3 w-3 mr-1" />
                    {isCreatingComment ? 'Posting...' : 'Comment'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-1">
          {loading && (!comments || comments.length === 0) ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Loading comments...</p>
            </div>
          ) : comments && comments.length > 0 ? (
            <>
              {console.log('Rendering comments section - comments count:', comments.length)}
              {comments
                .filter(comment => comment && comment._id) // Filter out invalid comments
                .map((comment) => (
                  <CommentItem key={comment._id} comment={comment} />
                ))}
              
              {pagination?.hasNext && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchComments(pagination.currentPage + 1)}
                    disabled={loading}
                  >
                    Load more comments
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-center py-8">
                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No comments yet</p>
                {token && (
                  <p className="text-xs text-muted-foreground mt-1">Be the first to comment!</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
