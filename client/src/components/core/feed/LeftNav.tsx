import React, { useEffect, useState } from 'react';
import { Home, Bell, User, LogIn, UserPlus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUnreadCount } from '@/services/operations/notificationAPI';
import { initSocket } from '@/lib/socket';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
}

export const LeftNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((state: any) => state.auth);

  const [unreadCount, setUnreadCount] = useState(0);

  // Important navigation items for authenticated users
  const authenticatedNavItems: NavItem[] = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Bell, label: "Notifications", href: "/notifications", badge: unreadCount },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  useEffect(() => {
    let mounted = true;
    const fetchCount = async () => {
      if (!token) return setUnreadCount(0);
      try {
        const res = await getUnreadCount();
        if (!mounted) return;
        const unread = res?.data?.unread ?? 0;
        setUnreadCount(unread);
      } catch (err) {
        // ignore
      }
    };
    fetchCount();

    // subscribe to socket events (idempotent)
    try {
      const parsed = (() => {
        try { return JSON.parse(localStorage.getItem('token') || '""'); } catch { return localStorage.getItem('token') || ''; }
      })();
      const s = initSocket(parsed);
      const onNotification = () => setUnreadCount(c => c + 1);
      const onCount = (payload: any) => {
        if (payload && typeof payload.unread === 'number') setUnreadCount(payload.unread);
      };
      s.on('notification', onNotification);
      s.on('notification_count', onCount);
      return () => { mounted = false; s.off('notification', onNotification); s.off('notification_count', onCount); };
    } catch (e) {
      return () => { mounted = false; };
    }
  }, [token]);



  // Navigation items for guests (unauthenticated users)
  const guestNavItems: NavItem[] = [
    { icon: Home, label: "Home", href: "/" },
    { icon: LogIn, label: "Sign In", href: "/login" },
    { icon: UserPlus, label: "Sign Up", href: "/signup" },
  ];

  const navItems = token ? authenticatedNavItems : guestNavItems;

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-56 z-40 hidden lg:flex flex-col">
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-3 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <div
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 transition-colors ${
                  active ? 'bg-white/6 text-white' : 'text-white/60 hover:bg-white/4 hover:text-white'
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/2">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 text-sm truncate">{item.label}</div>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
