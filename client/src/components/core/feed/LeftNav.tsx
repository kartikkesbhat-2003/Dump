import React from 'react';
import { Home, Search, Bell, MessageCircle,  User, Settings, TrendingUp, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

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

  // Important navigation items for authenticated users
  const authenticatedNavItems: NavItem[] = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Explore", href: "/explore" },
    { icon: Bell, label: "Notifications", href: "/notifications", badge: 3 },
    { icon: MessageCircle, label: "Messages", href: "/messages", badge: 2 },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  // Static/additional pages for authenticated users
  const staticNavItems: NavItem[] = [
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  // Navigation items for guests (unauthenticated users)
  const guestNavItems: NavItem[] = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Explore", href: "/explore" },
    { icon: TrendingUp, label: "Trending", href: "/trending" },
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
    <nav className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-background border-r border-border z-40 hidden lg:flex flex-col">
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Button
                key={item.href}
                variant={active ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 px-4 ${
                  active 
                    ? "bg-secondary text-secondary-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => navigate(item.href)}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span className="text-sm">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Static pages section for authenticated users */}
        {token && (
          <div className="mt-6 px-3">
            <div className="border-t border-border pt-4">
              <h3 className="text-xs font-medium text-muted-foreground mb-2 px-4">More</h3>
              <div className="space-y-1">
                {staticNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Button
                      key={item.href}
                      variant={active ? "secondary" : "ghost"}
                      className={`w-full justify-start h-10 px-4 ${
                        active 
                          ? "bg-secondary text-secondary-foreground font-medium" 
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                      onClick={() => navigate(item.href)}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Additional section for guests */}
        {!token && (
          <div className="mt-6 px-3">
            <div className="bg-accent/50 rounded-lg p-4">
              <h3 className="font-medium text-sm mb-2">Join the conversation</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Sign up to get personalized content and connect with others.
              </p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => navigate("/signup")}
              >
                Create Account
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="border-t border-border p-4">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>&copy; 2024 Your App</p>
          <div className="flex flex-wrap gap-2">
            <a href="/privacy" className="hover:text-foreground">Privacy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-foreground">Terms</a>
            <span>•</span>
            <a href="/help" className="hover:text-foreground">Help</a>
          </div>
        </div>
      </div>
    </nav>
  );
};
