import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowUp, ArrowDown, MessageCircle, Share, MoreHorizontal, User, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { getPostById, votePost } from '@/services/operations/postAPI';
import { createComment, getPostComments, voteComment } from '@/services/operations/commentAPI';

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
  imageUrl?: string;
  userVote?: 'upvote' | 'downvote' | null;
}

interface CommentUser {
  _id: string;
  email: string;
}

interface Comment {
  _id: string;
  user: CommentUser;
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

export const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state: any) => state.auth);
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isAnonymousReply, setIsAnonymousReply] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await dispatch(getPostById(id!) as any);
      setPost(response);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await dispatch(getPostComments({ postId: id!, page: 1, limit: 50 }) as any);
      if (response.payload) {
        setComments(response.payload.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleVotePost = async (voteType: 'upvote' | 'downvote') => {
    if (!token || !post) return;

    const previousVote = post.userVote;
    const previousUpvotes = post.upvotes;
    const previousDownvotes = post.downvotes;

    // Optimistic update
    let newUpvotes = post.upvotes;
    let newDownvotes = post.downvotes;
    let newUserVote: 'upvote' | 'downvote' | null = null;

    if (previousVote === voteType) {
      // Remove vote
      if (voteType === 'upvote') {
        newUpvotes = Math.max(0, newUpvotes - 1);
      } else {
        newDownvotes = Math.max(0, newDownvotes - 1);
      }
    } else if (previousVote && previousVote !== voteType) {
      // Change vote type
      if (previousVote === 'upvote') {
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

    setPost(prev => prev ? {
      ...prev,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      userVote: newUserVote,
      totalVotes: newUpvotes - newDownvotes
    } : null);

    try {
      await dispatch(votePost(post._id, voteType) as any);
    } catch (error) {
      // Revert on error
      setPost(prev => prev ? {
        ...prev,
        upvotes: previousUpvotes,
        downvotes: previousDownvotes,
        userVote: previousVote,
        totalVotes: previousUpvotes - previousDownvotes
      } : null);
      console.error('Error voting on post:', error);
    }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !token || !post) return;

    try {
      const commentData = {
        postId: post._id,
        content: newComment.trim(),
        isAnonymous,
      };

      const response = await dispatch(createComment(commentData) as any);
      if (response.payload) {
        setComments(prev => [response.payload as Comment, ...prev]);
      }
      setNewComment('');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleCreateReply = async (parentCommentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !token || !post) return;

    try {
      const replyData = {
        postId: post._id,
        content: replyContent.trim(),
        parentComment: parentCommentId,
        isAnonymous: isAnonymousReply,
      };

      const response = await dispatch(createComment(replyData) as any);
      
      // Add reply to the parent comment
      if (response.payload) {
        setComments(prev => prev.map(comment => 
          comment._id === parentCommentId 
            ? { ...comment, replies: [...comment.replies, response.payload as Comment] }
            : comment
        ));
      }
      
      setReplyContent('');
      setReplyingTo(null);
      setIsAnonymousReply(false);
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };


  const handleVoteComment = async (commentId: string, voteType: 'upvote' | 'downvote') => {
    if (!token) return;

    const updateCommentVote = (comments: Comment[], targetId: string): Comment[] => {
      return comments.map(comment => {
        if (comment._id === targetId) {
          const currentVote = comment.userVote;
          let newUpvotes = comment.upvotes;
          let newDownvotes = comment.downvotes;
          let newUserVote: 'upvote' | 'downvote' | null = null;

          if (currentVote === voteType) {
            // Remove vote
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
    const previousComments = comments;
    setComments(prev => updateCommentVote(prev, commentId));

    try {
      await dispatch(voteComment({ commentId, voteType }) as any);
    } catch (error) {
      // Revert on error
      setComments(previousComments);
      console.error('Error voting on comment:', error);
    }
  };

  const getDisplayName = (user: PostUser | CommentUser, anonymous: boolean) => {
    if (anonymous) return 'Anonymous';
    const emailParts = user.email.split('@');
    return emailParts[0];
  };

  const getInitials = (user: PostUser | CommentUser, anonymous: boolean) => {
    if (anonymous) return '?';
    const name = getDisplayName(user, false);
    return name.charAt(0).toUpperCase();
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => {
    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
        <div className="flex gap-3 py-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
            {comment.isAnonymous ? (
              <User className="h-4 w-4 text-muted-foreground" />
            ) : (
              <span className="text-xs font-medium">{getInitials(comment.user, comment.isAnonymous)}</span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">
                {getDisplayName(comment.user, comment.isAnonymous)}
              </span>
              {comment.isAnonymous && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  Anonymous
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
            
            <p className="text-sm text-foreground mb-2">{comment.content}</p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-1 ${
                    comment.userVote === 'upvote'
                      ? 'text-green-600 bg-green-50'
                      : 'text-muted-foreground hover:text-green-600'
                  }`}
                  onClick={() => handleVoteComment(comment._id, 'upvote')}
                  disabled={!token}
                >
                  <ArrowUp className={`h-3 w-3 mr-1 ${comment.userVote === 'upvote' ? 'fill-green-600' : ''}`} />
                  <span className="text-xs">{comment.upvotes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-1 ${
                    comment.userVote === 'downvote'
                      ? 'text-red-600 bg-red-50'
                      : 'text-muted-foreground hover:text-red-600'
                  }`}
                  onClick={() => handleVoteComment(comment._id, 'downvote')}
                  disabled={!token}
                >
                  <ArrowDown className={`h-3 w-3 mr-1 ${comment.userVote === 'downvote' ? 'fill-red-600' : ''}`} />
                  <span className="text-xs">{comment.downvotes}</span>
                </Button>
              </div>
              
              {!isReply && token && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-muted-foreground hover:text-blue-600"
                  onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  <span className="text-xs">Reply</span>
                </Button>
              )}
            </div>
            
            {/* Reply Form */}
            {replyingTo === comment._id && (
              <form onSubmit={(e) => handleCreateReply(comment._id, e)} className="mt-3">
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
                            setReplyingTo(null);
                            setReplyContent('');
                            setIsAnonymousReply(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={!replyContent.trim()}>
                          Reply
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
                {comment.replies.map((reply) => (
                  <CommentItem key={reply._id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Post not found</h2>
          <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Feed
        </Button>

        {/* Main Post */}
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  {post.isAnonymous ? (
                    <User className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <span className="text-lg font-medium">{getInitials(post.user, post.isAnonymous)}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {getDisplayName(post.user, post.isAnonymous)}
                    {post.isAnonymous && (
                      <span className="ml-2 text-sm bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        Anonymous
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {formatTimeAgo(post.createdAt)}
                  </span>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Post Content */}
            <div className="mb-6">
              <h1 className="font-bold text-2xl mb-3 leading-tight">
                {post.title}
              </h1>
              <p className="text-foreground leading-relaxed mb-4">
                {post.content}
              </p>
              
              {/* Image */}
              {post.imageUrl && (
                <div className="mt-4 rounded-lg overflow-hidden border border-border">
                  <img
                    src={post.imageUrl}
                    alt="Post image"
                    className="w-full h-auto max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => window.open(post.imageUrl, '_blank')}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {/* Voting */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!token}
                  className={`h-10 px-3 ${
                    post.userVote === 'upvote'
                      ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                      : 'text-muted-foreground hover:text-green-600'
                  } ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleVotePost('upvote')}
                >
                  <ArrowUp className={`h-5 w-5 mr-2 ${post.userVote === 'upvote' ? 'fill-green-600' : ''}`} />
                  <span className="font-medium">{post.upvotes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!token}
                  className={`h-10 px-3 ${
                    post.userVote === 'downvote'
                      ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                      : 'text-muted-foreground hover:text-red-600'
                  } ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleVotePost('downvote')}
                >
                  <ArrowDown className={`h-5 w-5 mr-2 ${post.userVote === 'downvote' ? 'fill-red-600' : ''}`} />
                  <span className="font-medium">{post.downvotes}</span>
                </Button>
              </div>

              {/* Comments and Share */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">{post.commentsCount}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 px-3 text-muted-foreground hover:text-foreground"
                >
                  <Share className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6">
            <h2 className="font-semibold text-lg mb-4">Comments</h2>

            {/* Comment Input */}
            {token ? (
              <form onSubmit={handleCreateComment} className="mb-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">Y</span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Join the discussion..."
                      className="w-full px-4 py-3 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded"
                        />
                        Comment anonymously
                      </label>
                      <Button type="submit" size="sm" disabled={!newComment.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-muted-foreground text-center">
                  <a href="/login" className="text-primary hover:underline">Log in</a> to join the discussion.
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-1">
              {commentsLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading comments...</p>
                </div>
              ) : comments.length > 0 ? (
                <>
                  {comments.map((comment) => (
                    <CommentItem key={comment._id} comment={comment} />
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No comments yet</p>
                  {token && (
                    <p className="text-sm text-muted-foreground mt-1">Be the first to comment!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};
