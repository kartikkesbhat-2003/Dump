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
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              {post.isAnonymous ? (
                <User className="h-5 w-5 text-muted-foreground" />
              ) : (
                <span className="text-sm font-medium">{getInitials()}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {getDisplayName()}
                {post.isAnonymous && (
                  <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    Anonymous
                  </span>
                )}
              </span>
              <span className="text-muted-foreground text-xs">
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={handleActionClick}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 
            className="font-semibold text-base mb-2 leading-tight cursor-pointer hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded transition-colors group"
            onClick={handlePostClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePostClick();
              }
            }}
            title="Click to view full post"
          >
            <span className="group-hover:underline">{post.title}</span>
          </h3>
          <p className="text-sm text-foreground leading-relaxed mb-3">
            {post.content}
          </p>
          
          {/* Image */}
          {post.imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <img
                src={post.imageUrl}
                alt="Post image"
                className="w-full h-auto max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  // Open image in new tab for better viewing
                  window.open(post.imageUrl, '_blank');
                }}
                onError={(e) => {
                  // Hide image if it fails to load
                  e.currentTarget.style.display = 'none';
                }}
                title="Click to view full image"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          {/* Voting */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={!token || isVoting}
              className={`h-8 px-2 ${
                userVote === 'upvote'
                  ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                  : 'text-muted-foreground hover:text-green-600'
              } ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                handleActionClick(e);
                handleUpvote();
              }}
            >
              <ArrowUp className={`h-4 w-4 mr-1 ${userVote === 'upvote' ? 'fill-green-600' : ''}`} />
              <span className="text-xs">{localUpvotes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              disabled={!token || isVoting}
              className={`h-8 px-2 ${
                userVote === 'downvote'
                  ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                  : 'text-muted-foreground hover:text-red-600'
              } ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                handleActionClick(e);
                handleDownvote();
              }}
            >
              <ArrowDown className={`h-4 w-4 mr-1 ${userVote === 'downvote' ? 'fill-red-600' : ''}`} />
              <span className="text-xs">{localDownvotes}</span>
            </Button>
          </div>

          {/* Comments, View Post, and Share */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${showComments ? 'text-blue-600 bg-blue-50' : 'text-muted-foreground hover:text-blue-600'}`}
              onClick={handleCommentClick}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">{post.commentsCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={handlePostClick}
              title="View full post"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              <span className="text-xs">View</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                handleActionClick(e);
                onShare?.(post._id);
              }}
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Comment Section */}
      <CommentSection
        postId={post._id}
        isVisible={showComments}
        onClose={onCloseComments || (() => {})}
      />
    </div>
  );
};
