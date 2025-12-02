import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PostCard } from '@/components/core/feed/PostCard';
import { getUserPosts, getPostsByUserId, votePost } from '@/services/operations/postAPI';
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
      let response;
      if (userId) {
        response = await dispatch(getPostsByUserId(userId) as any);
      } else {
        response = await dispatch(getUserPosts() as any);
      }
      
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
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center text-white">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-white" />
        <p className="text-sm uppercase tracking-[0.4em] text-white/50">Syncing</p>
        <p className="mt-2 text-white/70">Retrieving your latest drops...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center text-white">
        <FileText className="mx-auto mb-5 h-12 w-12 text-white/40" />
        <h3 className="text-2xl font-light tracking-[0.2em] uppercase">No transmissions yet</h3>
        <p className="mt-3 text-sm text-white/60">
          Share your first thought to light up this section of the feed.
        </p>
        <Button
          onClick={() => navigate('/create-post')}
          className="mt-6 rounded-full bg-white text-black hover:bg-white/90"
        >
          Create your first post
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Personal stream</p>
          <h2 className="text-2xl font-extralight">{posts.length} post{posts.length !== 1 ? 's' : ''} archived</h2>
        </div>
        <span className="text-sm text-white/60">Live view of everything you have shared.</span>
      </div>

      <div className="space-y-6">
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
        <div className="flex justify-center">
          <Button
            onClick={loadMorePosts}
            disabled={loading}
            variant="ghost"
            className="rounded-full border border-white/15 bg-white/5 px-8 text-white hover:bg-white/15"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more drops'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};