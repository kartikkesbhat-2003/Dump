import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Hash, Users, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/core/feed/PostCard';
import { useSelector, useDispatch } from 'react-redux';
import { getAllPosts, votePost } from '@/services/operations/postAPI';

interface TrendingTopic {
  tag: string;
  posts: number;
  category: string;
}

interface SearchResult {
  type: 'post' | 'user' | 'tag';
  id: string;
  title?: string;
  content?: string;
  username?: string;
  tagName?: string;
  posts?: number;
}

export const Explore: React.FC = () => {
  const { token } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trending');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const trendingTopics: TrendingTopic[] = [
    { tag: 'WebDevelopment', posts: 1250, category: 'Technology' },
    { tag: 'ReactJS', posts: 980, category: 'Programming' },
    { tag: 'AI', posts: 2100, category: 'Technology' },
    { tag: 'OpenSource', posts: 750, category: 'Development' },
    { tag: 'JavaScript', posts: 1850, category: 'Programming' },
    { tag: 'Python', posts: 1650, category: 'Programming' },
    { tag: 'MachineLearning', posts: 890, category: 'Technology' },
    { tag: 'CloudComputing', posts: 670, category: 'Technology' },
  ];

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchTrendingPosts();
    }
  }, [activeTab]);

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      const response = await dispatch(getAllPosts(1, 20, 'totalVotes', 'desc') as any);
      setPosts(response.posts || []);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    // Simulate search results - in real app, this would be an API call
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          type: 'post',
          id: '1',
          title: 'Understanding React Hooks',
          content: 'A comprehensive guide to React hooks and their usage...'
        },
        {
          type: 'user',
          id: '2',
          username: 'john_dev'
        },
        {
          type: 'tag',
          id: '3',
          tagName: searchQuery,
          posts: 45
        }
      ];
      setSearchResults(mockResults);
      setLoading(false);
    }, 500);
  };

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    if (!token) return;
    
    try {
      await dispatch(votePost(postId, voteType) as any);
      // Refresh posts
      if (activeTab === 'posts') {
        fetchTrendingPosts();
      }
    } catch (error) {
      console.error(`Error ${voteType}ing post:`, error);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Explore
          </h1>
          <p className="text-muted-foreground">
            Discover trending topics, popular posts, and connect with the community
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search posts, users, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {searchResults.map((result) => (
                <div key={result.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  {result.type === 'post' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Post</span>
                      </div>
                      <h3 className="font-medium">{result.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{result.content}</p>
                    </div>
                  )}
                  {result.type === 'user' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">User</span>
                      </div>
                      <h3 className="font-medium">@{result.username}</h3>
                    </div>
                  )}
                  {result.type === 'tag' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Topic</span>
                      </div>
                      <h3 className="font-medium">#{result.tagName}</h3>
                      <p className="text-sm text-muted-foreground">{result.posts} posts</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trending">Trending Topics</TabsTrigger>
            <TabsTrigger value="posts">Popular Posts</TabsTrigger>
            <TabsTrigger value="users">Active Users</TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {trendingTopics.map((topic, index) => (
                    <div
                      key={topic.tag}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">#{index + 1}</span>
                          <h3 className="font-medium">#{topic.tag}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {topic.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {topic.posts.toLocaleString()} posts
                          </span>
                        </div>
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading popular posts...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onUpvote={() => handleVote(post._id, 'upvote')}
                      onDownvote={() => handleVote(post._id, 'downvote')}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No popular posts found</h3>
                      <p className="text-sm text-muted-foreground">
                        Check back later for trending content
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">User Discovery</h3>
                  <p className="text-sm text-muted-foreground">
                    User discovery features coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};