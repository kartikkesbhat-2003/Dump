import React, { useState, useEffect } from 'react';
import { TrendingUp, Hash, ArrowUp, ArrowDown, BarChart3, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

interface TrendingTopic {
  id: string;
  tag: string;
  posts: number;
  category: string;
  growth: number;
  trending: 'up' | 'down' | 'stable';
  description?: string;
}

interface TrendingPost {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    isAnonymous: boolean;
  };
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  commentsCount: number;
  createdAt: string;
  tags: string[];
  imageUrl?: string;
  trendingScore: number;
}

interface TrendingUser {
  id: string;
  username: string;
  postsCount: number;
  totalUpvotes: number;
  followerGrowth: number;
  isAnonymous: boolean;
}

export const Trending: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [activeTab, setActiveTab] = useState('topics');

  // Mock trending topics
  const mockTrendingTopics: TrendingTopic[] = [
    {
      id: '1',
      tag: 'ReactJS',
      posts: 1250,
      category: 'Programming',
      growth: 15.2,
      trending: 'up',
      description: 'Latest React features and best practices'
    },
    {
      id: '2',
      tag: 'AI',
      posts: 2100,
      category: 'Technology',
      growth: 28.7,
      trending: 'up',
      description: 'Artificial Intelligence developments and discussions'
    },
    {
      id: '3',
      tag: 'WebDevelopment',
      posts: 1850,
      category: 'Programming',
      growth: 12.1,
      trending: 'up',
      description: 'Web development trends and tutorials'
    },
    {
      id: '4',
      tag: 'OpenSource',
      posts: 890,
      category: 'Development',
      growth: 8.3,
      trending: 'up',
      description: 'Open source projects and contributions'
    },
    {
      id: '5',
      tag: 'JavaScript',
      posts: 1650,
      category: 'Programming',
      growth: -2.1,
      trending: 'down',
      description: 'JavaScript frameworks and libraries'
    },
    {
      id: '6',
      tag: 'MachineLearning',
      posts: 975,
      category: 'Technology',
      growth: 22.5,
      trending: 'up',
      description: 'ML algorithms and implementations'
    },
    {
      id: '7',
      tag: 'DevOps',
      posts: 720,
      category: 'Development',
      growth: 5.8,
      trending: 'stable',
      description: 'DevOps practices and tools'
    },
    {
      id: '8',
      tag: 'BlockChain',
      posts: 680,
      category: 'Technology',
      growth: -8.4,
      trending: 'down',
      description: 'Blockchain and cryptocurrency discussions'
    }
  ];

  // Mock trending posts
  const mockTrendingPosts: TrendingPost[] = [
    {
      id: '1',
      title: 'Understanding React Server Components',
      content: 'A deep dive into React Server Components and how they change the way we think about React applications...',
      author: { username: 'react_dev', isAnonymous: false },
      upvotes: 245,
      downvotes: 12,
      totalVotes: 233,
      commentsCount: 45,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      tags: ['ReactJS', 'WebDevelopment'],
      trendingScore: 92.5
    },
    {
      id: '2',
      title: 'Building AI-Powered Applications with OpenAI API',
      content: 'Learn how to integrate AI capabilities into your applications using the latest OpenAI APIs and best practices...',
      author: { username: 'ai_engineer', isAnonymous: false },
      upvotes: 189,
      downvotes: 8,
      totalVotes: 181,
      commentsCount: 32,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      tags: ['AI', 'MachineLearning'],
      trendingScore: 88.3
    },
    {
      id: '3',
      title: 'Modern JavaScript Patterns You Should Know',
      content: 'Exploring advanced JavaScript patterns that every developer should master in 2024...',
      author: { username: 'js_ninja', isAnonymous: false },
      upvotes: 156,
      downvotes: 15,
      totalVotes: 141,
      commentsCount: 28,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      tags: ['JavaScript', 'WebDevelopment'],
      trendingScore: 79.6
    }
  ];

  // Mock trending users
  const mockTrendingUsers: TrendingUser[] = [
    {
      id: '1',
      username: 'coding_master',
      postsCount: 47,
      totalUpvotes: 1250,
      followerGrowth: 15.2,
      isAnonymous: false
    },
    {
      id: '2',
      username: 'tech_guru',
      postsCount: 32,
      totalUpvotes: 980,
      followerGrowth: 12.8,
      isAnonymous: false
    },
    {
      id: '3',
      username: 'dev_ninja',
      postsCount: 28,
      totalUpvotes: 856,
      followerGrowth: 10.5,
      isAnonymous: false
    }
  ];

  useEffect(() => {
    fetchTrendingData();
  }, [timeRange]);

  const fetchTrendingData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const getTrendingIcon = (trending: string) => {
    switch (trending) {
      case 'up':
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      default:
        return <BarChart3 className="h-3 w-3 text-yellow-500" />;
    }
  };

  const getTrendingColor = (trending: string) => {
    switch (trending) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Trending
            </h1>
            <p className="text-muted-foreground">
              Discover what's popular in the community
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Trending Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Trending Topics</span>
              </div>
              <p className="text-2xl font-bold mt-1">{mockTrendingTopics.length}</p>
              <p className="text-xs text-muted-foreground">+12% from last {timeRange}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Hot Posts</span>
              </div>
              <p className="text-2xl font-bold mt-1">{mockTrendingPosts.length}</p>
              <p className="text-xs text-muted-foreground">+8% engagement</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Active Now</span>
              </div>
              <p className="text-2xl font-bold mt-1">1.2k</p>
              <p className="text-xs text-muted-foreground">Users online</p>
            </CardContent>
          </Card>
        </div>

        {/* Trending Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="topics">Trending Topics</TabsTrigger>
            <TabsTrigger value="posts">Hot Posts</TabsTrigger>
            <TabsTrigger value="users">Rising Users</TabsTrigger>
          </TabsList>

          {/* Trending Topics */}
          <TabsContent value="topics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mockTrendingTopics.map((topic, index) => (
                <Card key={topic.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">#{index + 1}</span>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              #{topic.tag}
                              {getTrendingIcon(topic.trending)}
                            </h3>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {topic.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{topic.posts.toLocaleString()} posts</p>
                          <p className={`text-xs ${getTrendingColor(topic.trending)}`}>
                            {topic.growth > 0 ? '+' : ''}{topic.growth}%
                          </p>
                        </div>
                      </div>
                      
                      {topic.description && (
                        <p className="text-sm text-muted-foreground">{topic.description}</p>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Trending Score</span>
                          <span>{Math.abs(topic.growth)}%</span>
                        </div>
                        <Progress value={Math.abs(topic.growth)} className="h-2" />
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        <Hash className="h-3 w-3 mr-1" />
                        Explore #{topic.tag}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Hot Posts */}
          <TabsContent value="posts" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading trending posts...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockTrendingPosts.map((post, index) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <Badge variant="secondary" className="text-xs">
                              #{index + 1} Trending
                            </Badge>
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-lg leading-tight">{post.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>by @{post.author.username}</span>
                              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {post.trendingScore.toFixed(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-green-600">
                                <ArrowUp className="h-3 w-3" />
                                {post.upvotes}
                              </span>
                              <span className="flex items-center gap-1 text-red-600" aria-hidden>
                                <ArrowDown className="h-3 w-3" />
                                {/* downvote count hidden per UX */}
                              </span>
                              <span>{post.commentsCount} comments</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {post.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rising Users */}
          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTrendingUsers.map((user, index) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">#{index + 1}</span>
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">@{user.username}</h3>
                        <p className="text-xs text-muted-foreground">
                          Rising Creator
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Posts</span>
                          <span className="font-medium">{user.postsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Upvotes</span>
                          <span className="font-medium">{user.totalUpvotes.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Growth</span>
                          <span className="font-medium text-green-600">
                            +{user.followerGrowth}%
                          </span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};