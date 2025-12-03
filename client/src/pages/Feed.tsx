import { PostCard } from "@/components/core/feed/PostCard";
import { CreatePostButton } from "@/components/core/feed/CreatePostButton";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { getAllPosts, votePost } from "@/services/operations/postAPI";
import { toast } from 'react-hot-toast';

export const Feed = () => {
  const { token } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
  });

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await dispatch(getAllPosts(page, 10, 'createdAt', 'desc') as any);
      setPosts(response.posts);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!token) return;
    
    try {
      await dispatch(votePost(postId, 'upvote') as any);
      // Don't refresh all posts, let PostCard handle optimistic updates
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };

  const handleDownvote = async (postId: string) => {
    if (!token) return;
    
    try {
      await dispatch(votePost(postId, 'downvote') as any);
      // Don't refresh all posts, let PostCard handle optimistic updates
    } catch (error) {
      console.error('Error downvoting post:', error);
    }
  };

  const handleComment = (postId: string) => {
    // Toggle comments for this post, close others
    setOpenCommentPostId(current => current === postId ? null : postId);
  };

  const handleCloseComments = () => {
    setOpenCommentPostId(null);
  };

  const handleShare = async (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({ url: shareUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Post link copied to clipboard');
      } else {
        // Fallback: open the URL in a new tab
        window.open(shareUrl, '_blank');
      }
    } catch (err) {
      console.error('Share failed:', err);
      toast.error('Unable to share the post');
    }
  };

  const handlePostCreated = () => {
    // Refresh the posts when a new post is created
    fetchPosts();
  };

  const loadMorePosts = async () => {
    if (pagination.hasNext) {
      try {
        const nextPage = pagination.currentPage + 1;
        const response = await dispatch(getAllPosts(nextPage, 10, 'createdAt', 'desc') as any);
        setPosts(prevPosts => [...prevPosts, ...response.posts]);
        setPagination(response.pagination);
      } catch (error) {
        console.error("Error loading more posts:", error);
      }
    }
  };

  const curatedPosts = token ? posts : posts.slice(0, 5);

  const renderStream = () => {
    if (loading && posts.length === 0) {
      return (
        <div className="space-y-10">
          {[1, 2, 3].map((index) => (
            <div key={index} className="relative w-full">
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
          ))}
        </div>
      );
    }

    if (!curatedPosts.length) {
      return (
        <div className="rounded-3xl border border-white/5 bg-white/5 p-10 text-center">
          <h3 className="text-2xl font-light tracking-[0.3em] text-white/80 uppercase">Empty Orbit</h3>
          <p className="mt-3 text-sm text-white/60">
            Be the first one to drop a thought and set the tone for the rest of the community.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-10">
        {curatedPosts.map((post: any) => (
          <PostCard
            key={post._id}
            post={post}
            onUpvote={token ? handleUpvote : undefined}
            onDownvote={token ? handleDownvote : undefined}
            onComment={handleComment}
            onShare={handleShare}
            showComments={openCommentPostId === post._id}
            onCloseComments={handleCloseComments}
          />
        ))}

        {token && pagination.hasNext && (
          <div className="flex justify-center">
            <button
              onClick={loadMorePosts}
              className="rounded-full border border-white/10 px-8 py-3 text-xs font-semibold tracking-[0.3em] uppercase text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Load More
            </button>
          </div>
        )}

        {!token && posts.length > 5 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center text-sm text-white/70">
            Sign in to unlock the full stream and interact with every drop.
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-gradient-to-b from-background via-background/95 to-black px-2 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
      >
        <div
          className="absolute left-1/2 top-[-30%] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-[220px]"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] h-[26rem] w-[26rem] rounded-full blur-[200px]"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 60%)" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl space-y-12">
        <CreatePostButton onCreatePost={handlePostCreated} />
          <div className="relative">
          {renderStream()}
        </div>
      </div>
    </section>
  );
};