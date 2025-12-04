import {
  Search,
  Bell,
  User,
  ArrowLeft,
  LogOut,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CTAButton } from "./CTAButton";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/services/operations/authAPI";
import { useEffect, useState } from 'react';
import { getUnreadCount } from '@/services/operations/notificationAPI';
import { Badge } from '@/components/ui/badge';
import { initSocket } from '@/lib/socket';

export const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const { token } = useSelector((state: any) => state.auth);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    dispatch(logout(navigate));
  };

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
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
    fetch();
    return () => { mounted = false; };
  }, [token]);

  // Initialize socket and listen for real-time notifications
  useEffect(() => {
    if (!token) return;
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
    return () => {
      s.off('notification', onNotification);
      s.off('notification_count', onCount);
    };
  }, [token]);

  const renderSearchInput = (props?: { autoFocus?: boolean }) => (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
      <Input
        placeholder="Search the stream"
        className="h-11 rounded-full border-white/10 bg-white/5 pl-12 text-sm text-white placeholder:text-white/40 focus-visible:ring-white/40"
        {...props}
      />
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 isolate">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-1 h-28 bg-white/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex h-16 w-full max-w-none items-center px-4 sm:px-6">
        <div
          className={`flex w-full items-center justify-between border-b border-white/10 px-1 py-2 text-white backdrop-blur-2xl transition-all ${
            isSearchOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'
          }`}
        >
          <a href="/" className="text-sm font-semibold uppercase tracking-[0.5em] text-white">
            Dump
          </a>

          {token && (
            <div className="hidden flex-1 justify-center px-6 md:flex">
              <div className="w-full max-w-md">{renderSearchInput()}</div>
            </div>
          )}

          <div className="flex items-center gap-2 text-white">
            {token && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:hidden rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}

            {token ? (
              <div className="flex items-center gap-1 md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => navigate('/notifications')}
                  >
                    <div className="relative">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2">
                          <Badge variant="destructive">{unreadCount > 99 ? '99+' : unreadCount}</Badge>
                        </span>
                      )}
                    </div>
                  </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 text-foreground">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:hidden">
                <CTAButton
                  label="Login"
                  href="/login"
                  variant="ghost"
                  size="sm"
                  className="rounded-full border border-white/20 px-3 text-xs text-white"
                />
                <CTAButton
                  label="Sign Up"
                  href="/signup"
                  variant="primary"
                  size="sm"
                  className="rounded-full px-3 text-xs"
                />
              </div>
            )}

            <div className="hidden items-center gap-3 md:flex">
              {token ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => navigate('/notifications')}
                  >
                    <div className="relative">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2">
                          <Badge variant="destructive">{unreadCount > 99 ? '99+' : unreadCount}</Badge>
                        </span>
                      )}
                    </div>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-white hover:bg-white/10"
                      >
                        <User className="h-4 w-4" />
                        {user && (
                          <span className="max-w-32 truncate text-sm">
                            {user.username || ''}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 text-foreground">
                      {user?.email && (
                        <>
                          <div className="px-3 py-1.5 text-sm text-muted-foreground">
                            {user.email}
                          </div>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <CTAButton
                    label="Log In"
                    href="/login"
                    variant="ghost"
                    size="sm"
                    className="rounded-full border border-white/20 px-4 text-white"
                  />
                  <CTAButton
                    label="Sign Up"
                    href="/signup"
                    variant="primary"
                    size="sm"
                    className="rounded-full px-4"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {token && (
          <div
            className={`absolute inset-0 flex items-center gap-3 border-b border-white/10 bg-black/60 px-4 py-2 text-white shadow-[0_15px_45px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all ${
              isSearchOpen
                ? 'opacity-100 translate-y-0'
                : 'pointer-events-none -translate-y-full opacity-0'
            }`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10"
              onClick={() => setIsSearchOpen(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {renderSearchInput({ autoFocus: true })}
          </div>
        )}
      </div>
    </header>
  );
};
