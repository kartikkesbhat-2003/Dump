import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle, ThumbsUp, Users, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/operations/notificationAPI';
import { initSocket } from '@/lib/socket';

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


export const Notifications: React.FC = () => {
  const { token } = useSelector((state: any) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  // showOnlyUnread removed per UX request; display both read and unread
  const [initialUnreadIds, setInitialUnreadIds] = useState<string[]>([]);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
    // subscribe to socket
    let s: ReturnType<typeof initSocket> | null = null;
    const parsed = (() => {
      try { return JSON.parse(localStorage.getItem('token') || '""'); } catch { return localStorage.getItem('token') || ''; }
    })();
    try {
      s = initSocket(parsed);
      const handler = (n: any) => {
        // prepend new notification
        const mapped = {
          id: n._id,
          type: n.type,
          title: n.type === 'comment' ? 'New comment on your post' : n.type === 'vote' ? 'Your post was upvoted' : 'Activity',
          message: n.message || '',
          isRead: n.isRead,
          createdAt: n.createdAt,
          actionUser: n.actor ? { username: n.actor.email?.split('@')[0], isAnonymous: false } : undefined,
          relatedPost: n.post ? { id: n.post._id, title: n.post.title } : undefined,
          relatedComment: n.comment ? { id: n.comment._id, content: n.comment.content } : undefined,
        };
        setNotifications(prev => [mapped, ...prev]);
      };
      s.on('notification', handler);
      return () => {
        s && s.off('notification', handler);
      };
    } catch (e) {
      // ignore
      return;
    }
  }, [token]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications(1, 200);
      const data = res?.data?.notifications || [];
      const mapped = data.map((n: any) => ({
        id: n._id,
        type: n.type,
        title: n.type === 'comment' ? 'New comment on your post' : n.type === 'vote' ? 'Your post was upvoted' : 'Activity',
        message: n.message || '',
        isRead: n.isRead,
        createdAt: n.createdAt,
        actionUser: n.actor ? { username: n.actor.email?.split('@')[0], isAnonymous: false } : undefined,
        relatedPost: n.post ? { id: n.post._id, title: n.post.title } : undefined,
        relatedComment: n.comment ? { id: n.comment._id, content: n.comment.content } : undefined,
      }));
      setNotifications(mapped);
      // capture which notifications were unread when the user opened the page
      const unreadIds = mapped.filter((m: Notification) => !m.isRead).map((m: Notification) => m.id);
      setInitialUnreadIds(unreadIds);
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  };

  // When the user leaves the Notifications page, mark notifications that were unread when they arrived as read.
  useEffect(() => {
    return () => {
      if (!initialUnreadIds || initialUnreadIds.length === 0) return;
      // Fire-and-forget: mark each initial unread as read. Server will idempotently handle already-read items.
      (async () => {
        try {
          await Promise.all(initialUnreadIds.map(id => markNotificationAsRead(id).catch(() => {})));
        } catch (err) {
          console.error('Error marking initial unread notifications as read on leave', err);
        }
      })();
    };
    // We intentionally depend only on initialUnreadIds so this cleanup runs with the set captured at mount-time.
  }, [initialUnreadIds]);

  const markAsRead = (notificationId: string) => {
    // Optimistic update + API call
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    markNotificationAsRead(notificationId).catch(err => console.error(err));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
    markAllNotificationsAsRead().catch(err => console.error(err));
  };

  // Build list for rendering: unread notifications shown individually,
  // read notifications are either shown individually or grouped (merged) by type+post.
  const buildRenderList = () => {
    const unread = notifications.filter(n => !n.isRead).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const read = notifications.filter(n => n.isRead).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    // Group read notifications by mergeable key (type + relatedPost.id)
    const groups = new Map();
    const others: Notification[] = [];

    read.forEach(n => {
      const mergeable = (n.type === 'vote' || n.type === 'post_liked') && n.relatedPost?.id;
      if (mergeable) {
        const key = `${n.type}:${n.relatedPost!.id}`;
        const g = groups.get(key) || { __group: true, key, groupType: n.type, relatedPost: n.relatedPost, actors: [], count: 0, latest: n.createdAt };
        g.actors.push(n.actionUser?.username || 'Someone');
        g.count += 1;
        if (new Date(n.createdAt) > new Date(g.latest)) g.latest = n.createdAt;
        groups.set(key, g);
      } else {
        others.push(n);
      }
    });

    const grouped = Array.from(groups.values()).sort((a: any, b: any) => +new Date(b.latest) - +new Date(a.latest));

    // Render order: unread individual items (newest first), then grouped read summaries, then other read items
    const renderList: any[] = [];
    unread.forEach(u => renderList.push(u));
    grouped.forEach(g => renderList.push(g));
    others.forEach(o => renderList.push(o));

    return renderList;
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
      <div className="max-w-4xl mx-auto px-3 py-6">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-center text-white">
          <Bell className="mx-auto mb-4 h-12 w-12 text-white/40" />
          <h3 className="text-xl font-light">Please sign in</h3>
          <p className="mt-2 text-white/70">Sign in to view your notifications</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-gradient-to-b from-background via-background/95 to-black px-2 py-10 sm:px-6">
      <div className="relative z-10 mx-auto max-w-4xl space-y-8">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extralight flex items-center gap-3">
                <Bell className="h-6 w-6" /> Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </h1>
              <p className="text-sm text-white/60 mt-1">All activity from people and posts you follow, in a single stream.</p>
            </div>

            <div className="flex items-center gap-3">
              {/* 'Only unread' removed — show both read and unread with different shading */}
              {unreadCount > 0 && (
                <Button variant="ghost" onClick={markAllAsRead} className="rounded-full border border-white/10">
                  <CheckCheck className="h-4 w-4 mr-2" /> Mark all as read
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative pl-12">
            {/* left timeline line removed */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30 mx-auto"></div>
                </div>
              ) : (
                (() => {
                  const renderList = buildRenderList();
                  return renderList.length > 0 ? (
                    renderList.map((item: any) => {
                      // grouped summary
                      if (item.__group) {
                        const primary = item.actors && item.actors.length > 0 ? item.actors[0] : 'Someone';
                        const others = Math.max(0, item.count - 1);
                        const title = item.groupType === 'vote' || item.groupType === 'post_liked' ?
                          `${primary}${others > 0 ? ` and ${others} others` : ''} liked your post` :
                          `${primary} and ${item.count - 1} others`;

                        return (
                          <article key={item.key} className="relative ml-2 rounded-[28px] border border-white/10 bg-white/3 p-5 text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                            <div className="absolute left-6 top-7 h-2 w-2 rounded-full bg-white/40" />
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-1 text-white/60"><ThumbsUp className="h-4 w-4" /></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium text-white/90">{title}</h3>
                                  <span className="text-xs text-white/50">{formatDistanceToNow(new Date(item.latest), { addSuffix: true })}</span>
                                </div>
                                {item.relatedPost && <p className="mt-2 text-sm text-white/60">Post: {item.relatedPost.title}</p>}
                                <p className="mt-2 text-xs text-white/50">{item.count} total</p>
                              </div>
                            </div>
                          </article>
                        );
                      }

                      // individual notification (unread or read-but-not-merged)
                      const n: Notification = item;
                      const isUnread = !n.isRead;
                      return (
                        <article key={n.id} className={`relative ml-2 rounded-[28px] border border-white/10 ${isUnread ? 'bg-white/5 ring-1 ring-primary/30' : 'bg-white/3'} p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition`} onClick={() => { if (isUnread) markAsRead(n.id); }}>
                          <div className={`absolute left-6 top-7 h-2 w-2 rounded-full ${isUnread ? 'bg-white/70 shadow-[0_0_18px_rgba(255,255,255,0.35)]' : 'bg-white/40'}`} />
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1 text-white/80">{getNotificationIcon(n.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className={`text-sm font-medium ${isUnread ? 'text-white' : 'text-white/90'}`}>{n.title}</h3>
                                <span className="text-xs text-white/50">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                              </div>
                              <p className={`mt-2 text-sm ${isUnread ? 'text-white/90' : 'text-white/70'}`}>
                                {n.actionUser && !n.actionUser.isAnonymous && (<span className="font-medium text-white">@{n.actionUser.username} </span>)}{n.message}
                              </p>
                              {n.relatedPost && <p className="mt-2 text-xs text-white/50">Post: {n.relatedPost.title}</p>}
                            </div>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-white">
                      <Bell className="mx-auto mb-4 h-12 w-12 text-white/40" />
                      <h3 className="text-lg font-light">No notifications</h3>
                      <p className="mt-2 text-white/60">You're all caught up.</p>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};