import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPostById, votePost } from '@/services/operations/postAPI';
import { PostCard } from '@/components/core/feed/PostCard';

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

export const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state: any) => state.auth);
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
      setShowComments(true);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="relative w-full rounded-2xl border border-white/8 bg-white/3 px-4 py-4 shadow-sm backdrop-blur animate-pulse">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/6" />
              <div>
                <div className="h-4 w-28 rounded-full bg-white/10 mb-1" />
                <div className="h-3 w-20 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="h-9 w-9 rounded-full bg-white/6" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="h-5 w-3/4 rounded-full bg-white/10" />
            <div className="h-4 w-full rounded-full bg-white/10" />
            <div className="h-40 w-full rounded-2xl bg-white/8" />
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-white/50">
            <div className="h-3 w-20 rounded-full bg-white/10" />
            <div className="h-3 w-14 rounded-full bg-white/10" />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-20 rounded-full bg-white/10" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-20 rounded-full bg-white/10" />
              <div className="h-9 w-20 rounded-full bg-white/10" />
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
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-gradient-to-b from-background via-background/95 to-black px-2 py-10 sm:px-6">
      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {loading ? (
          <div className="relative w-full">
            <div className="relative w-full rounded-2xl border border-white/8 bg-white/3 px-4 py-4 shadow-sm backdrop-blur animate-pulse">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white/6" />
                  <div>
                    <div className="h-4 w-28 rounded-full bg-white/10 mb-1" />
                    <div className="h-3 w-20 rounded-full bg-white/10" />
                  </div>
                </div>
                <div className="h-9 w-9 rounded-full bg-white/6" />
              </div>

              <div className="mt-4 space-y-3">
                <div className="h-5 w-3/4 rounded-full bg-white/10" />
                <div className="h-4 w-full rounded-full bg-white/10" />
                <div className="h-40 w-full rounded-2xl bg-white/8" />
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-white/50">
                <div className="h-3 w-20 rounded-full bg-white/10" />
                <div className="h-3 w-14 rounded-full bg-white/10" />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-20 rounded-full bg-white/10" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-20 rounded-full bg-white/10" />
                  <div className="h-9 w-20 rounded-full bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        ) : !post ? (
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center text-white/70">
            <p className="text-xl">Post not found</p>
            <p className="mt-2 text-sm text-white/50">It may have been deleted or moved.</p>
            <Button
              className="mt-4 rounded-full border border-white/10 bg-white text-black hover:bg-white/90"
              onClick={() => navigate('/')}
            >
              Return to feed
            </Button>
          </div>
        ) : (
          <PostCard
            post={post}
            onUpvote={async () => handleVotePost('upvote')}
            onDownvote={async () => handleVotePost('downvote')}
            onComment={() => setShowComments(prev => !prev)}
            onShare={() => handleShare(post._id)}
            showComments={showComments}
            onCloseComments={() => setShowComments(false)}
          />
        )}
      </div>
    </section>
  );
};

const handleShare = (postId: string) => {
  const shareUrl = `${window.location.origin}/post/${postId}`;
  if (navigator.share) {
    navigator.share({ url: shareUrl }).catch(() => {/* ignore */});
  } else {
    navigator.clipboard?.writeText(shareUrl).catch(() => {/* ignore */});
  }
};
