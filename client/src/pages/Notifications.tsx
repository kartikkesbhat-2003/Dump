import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle, ThumbsUp, Users, Settings, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';

interface Notification {
  id: string;
  type: 'comment' | 'vote' | 'follow' | 'mention' | 'post_liked';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUser?: {
    username: string;
    isAnonymous: boolean;
  };
  relatedPost?: {
    id: string;
    title: string;
  };
  relatedComment?: {
    id: string;
    content: string;
  };
}

interface NotificationSettings {
  comments: boolean;
  votes: boolean;
  follows: boolean;
  mentions: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export const Notifications: React.FC = () => {
  const { token } = useSelector((state: any) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [settings, setSettings] = useState<NotificationSettings>({
    comments: true,
    votes: true,
    follows: true,
    mentions: true,
    emailNotifications: false,
    pushNotifications: true,
  });

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'comment',
      title: 'New comment on your post',
      message: 'Someone commented on "Understanding React Hooks"',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      actionUser: { username: 'john_dev', isAnonymous: false },
      relatedPost: { id: '1', title: 'Understanding React Hooks' },
      relatedComment: { id: '1', content: 'Great explanation! This really helped me understand...' }
    },
    {
      id: '2',
      type: 'vote',
      title: 'Your post was upvoted',
      message: '5 people upvoted your post',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      relatedPost: { id: '2', title: 'JavaScript Best Practices' }
    },
    {
      id: '3',
      type: 'follow',
      title: 'New follower',
      message: 'started following you',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      actionUser: { username: 'sarah_codes', isAnonymous: false }
    },
    {
      id: '4',
      type: 'mention',
      title: 'You were mentioned',
      message: 'mentioned you in a comment',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      actionUser: { username: 'mike_dev', isAnonymous: false },
      relatedPost: { id: '3', title: 'React vs Vue Comparison' }
    },
    {
      id: '5',
      type: 'post_liked',
      title: 'Your post gained popularity',
      message: 'Your post reached 100 upvotes!',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      relatedPost: { id: '4', title: 'Building Scalable APIs' }
    }
  ];

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const fetchNotifications = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === activeTab);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'vote':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'follow':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'mention':
        return <Bell className="h-4 w-4 text-orange-500" />;
      case 'post_liked':
        return <ThumbsUp className="h-4 w-4 text-pink-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!token) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Please sign in</h3>
            <p className="text-sm text-muted-foreground">
              You need to be signed in to view your notifications
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Stay updated with your latest activity
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notification Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="comment">Comments</TabsTrigger>
            <TabsTrigger value="vote">Votes</TabsTrigger>
            <TabsTrigger value="follow" className="hidden lg:flex">Follows</TabsTrigger>
            <TabsTrigger value="settings" className="hidden lg:flex">Settings</TabsTrigger>
          </TabsList>

          {/* All Notifications */}
          {(activeTab !== 'settings') && (
            <TabsContent value={activeTab} className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading notifications...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredNotifications().length > 0 ? (
                    getFilteredNotifications().map((notification) => (
                      <Card
                        key={notification.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          !notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-sm">
                                  {notification.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                  {notification.actionUser && !notification.actionUser.isAnonymous && (
                                    <span className="font-medium text-foreground">
                                      @{notification.actionUser.username}{' '}
                                    </span>
                                  )}
                                  {notification.actionUser && notification.actionUser.isAnonymous && (
                                    <span className="font-medium text-foreground">
                                      Anonymous user{' '}
                                    </span>
                                  )}
                                  {notification.message}
                                </p>
                                {notification.relatedPost && (
                                  <p className="text-xs text-muted-foreground">
                                    Post: {notification.relatedPost.title}
                                  </p>
                                )}
                                {notification.relatedComment && (
                                  <p className="text-xs text-muted-foreground italic">
                                    "{notification.relatedComment.content.slice(0, 60)}..."
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium mb-2">No notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          {activeTab === 'unread' 
                            ? "You're all caught up!" 
                            : "You'll see notifications here when you have activity."
                          }
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          )}

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Activity Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="comments" className="text-sm">
                        Comments on your posts
                      </Label>
                      <Switch
                        id="comments"
                        checked={settings.comments}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({ ...prev, comments: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="votes" className="text-sm">
                        Votes on your posts
                      </Label>
                      <Switch
                        id="votes"
                        checked={settings.votes}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({ ...prev, votes: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="follows" className="text-sm">
                        New followers
                      </Label>
                      <Switch
                        id="follows"
                        checked={settings.follows}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({ ...prev, follows: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mentions" className="text-sm">
                        Mentions in comments
                      </Label>
                      <Switch
                        id="mentions"
                        checked={settings.mentions}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({ ...prev, mentions: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Delivery Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email" className="text-sm">
                        Email notifications
                      </Label>
                      <Switch
                        id="email"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push" className="text-sm">
                        Push notifications
                      </Label>
                      <Switch
                        id="push"
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({ ...prev, pushNotifications: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};