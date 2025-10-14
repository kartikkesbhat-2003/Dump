import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PostCard } from '@/components/core/feed/PostCard';
import { getUserPosts, votePost } from '@/services/operations/postAPI';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserPostsListProps {
  userId?: string;
}

export const UserPostsList: React.FC<UserPostsListProps> = ({ userId }) => {

  const navigate = useNavigate();
  const { token } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
  });

  useEffect(() => {
    fetchUserPosts();
  }, [userId]);

  const fetchUserPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await dispatch(getUserPosts() as any);
      
      if (page === 1) {
        setPosts(response.posts || []);
      } else {
        setPosts(prev => [...prev, ...(response.posts || [])]);
      }
      
      setPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        hasNext: false,
      });
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!token) return;
    
    try {
      await dispatch(votePost(postId, 'upvote') as any);
      // Optimistically update the posts
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          const wasUpvoted = post.userVote === 'upvote';
          const wasDownvoted = post.userVote === 'downvote';
          
          return {
            ...post,
            upvotes: wasUpvoted ? post.upvotes - 1 : post.upvotes + 1,
            downvotes: wasDownvoted ? post.downvotes - 1 : post.downvotes,
            userVote: wasUpvoted ? null : 'upvote'
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };

  const handleDownvote = async (postId: string) => {
    if (!token) return;
    
    try {
      await dispatch(votePost(postId, 'downvote') as any);
      // Optimistically update the posts
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          const wasUpvoted = post.userVote === 'upvote';
          const wasDownvoted = post.userVote === 'downvote';
          
          return {
            ...post,
            upvotes: wasUpvoted ? post.upvotes - 1 : post.upvotes,
            downvotes: wasDownvoted ? post.downvotes - 1 : post.downvotes + 1,
            userVote: wasDownvoted ? null : 'downvote'
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error downvoting post:', error);
    }
  };

  const handleComment = (postId: string) => {
    // Navigate to post details page for commenting
    window.location.href = `/post/${postId}`;
  };

  const loadMorePosts = () => {
    if (pagination.hasNext && !loading) {
      fetchUserPosts(pagination.currentPage + 1);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading posts...</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
        <p className="text-muted-foreground mb-4">
          You haven't created any posts yet. Share your thoughts with the community!
        </p>
        <Button onClick={() => navigate('/create-post')}>
          Create Your First Post
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Your Posts</h2>
        <span className="text-xs sm:text-sm text-muted-foreground">
          {posts.length} post{posts.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onUpvote={handleUpvote}
            onDownvote={handleDownvote}
            onComment={handleComment}
          />
        ))}
      </div>
      
      {pagination.hasNext && (
        <div className="flex justify-center pt-2 sm:pt-4">
          <Button
            onClick={loadMorePosts}
            disabled={loading}
            variant="outline"
            size="sm"
            className="sm:size-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More Posts'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};