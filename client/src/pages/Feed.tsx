import { PostCard } from "@/components/core/feed/PostCard";
import { CreatePostButton } from "@/components/core/feed/CreatePostButton";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { getAllPosts, votePost } from "@/services/operations/postAPI";

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

  const handleShare = () => {
    // Implement share logic
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
            <div key={index} className="relative pl-12">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />
              <div className="absolute left-[13px] top-6 h-2 w-2 rounded-full bg-white/30 animate-pulse" />
              <div className="ml-4 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
                <div className="h-4 w-40 rounded-full bg-white/10 mb-6" />
                <div className="space-y-3">
                  <div className="h-5 w-3/4 rounded-full bg-white/10" />
                  <div className="h-5 w-2/3 rounded-full bg-white/10" />
                  <div className="h-5 w-1/2 rounded-full bg-white/10" />
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
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-white/30 via-white/10 to-transparent" />
          {renderStream()}
        </div>
      </div>
    </section>
  );
};