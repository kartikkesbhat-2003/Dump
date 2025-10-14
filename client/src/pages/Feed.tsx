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

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="space-y-6">

            {token ? (
              /* Authenticated Feed Content */ 
              <div className="space-y-4">
                {/* Create Post Section */}
                <CreatePostButton onCreatePost={handlePostCreated} />

                {/* Posts */}
                <div className="space-y-4">
                  {loading && posts.length === 0 ? (
                    // Loading skeleton
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-muted rounded-full"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-muted rounded w-24"></div>
                              <div className="h-3 bg-muted rounded w-16"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-full"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    <>
                      {posts.map((post: any) => (
                        <PostCard
                          key={post._id}
                          post={post}
                          onUpvote={handleUpvote}
                          onDownvote={handleDownvote}
                          onComment={handleComment}
                          onShare={handleShare}
                          showComments={openCommentPostId === post._id}
                          onCloseComments={handleCloseComments}
                        />
                      ))}
                      
                      {/* Load More Button */}
                      {pagination.hasNext && (
                        <div className="flex justify-center py-4">
                          <button
                            onClick={loadMorePosts}
                            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            Load More Posts
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    // No posts found
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                      <p className="text-muted-foreground">
                        Be the first to share something with the community!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Unauthenticated Welcome Content */ 
              <div className="space-y-4">
                {/* Create Post Section for Guests */}
                <CreatePostButton onCreatePost={handlePostCreated} />

                {/* Show public posts for guests */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Latest Posts</h2>
                  {loading ? (
                    // Loading skeleton for guests
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-muted rounded-full"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-muted rounded w-24"></div>
                              <div className="h-3 bg-muted rounded w-16"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-full"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    <>
                      {posts.slice(0, 5).map((post: any) => (
                        <PostCard
                          key={post._id}
                          post={post}
                          onUpvote={() => {}} // Disabled for guests
                          onDownvote={() => {}} // Disabled for guests
                          onComment={handleComment}
                          onShare={handleShare}
                          showComments={openCommentPostId === post._id}
                          onCloseComments={handleCloseComments}
                        />
                      ))}
                      
                      {posts.length > 5 && (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">
                            Sign in to see more posts and interact with the community
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                      <p className="text-muted-foreground">
                        Be the first to share something with the community!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
  );
};