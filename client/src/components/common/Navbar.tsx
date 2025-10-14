import { useState } from "react";
import {
  Search,
  Bell,
  User,
  ArrowLeft,
  LogOut,
  Settings,
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

export const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const { token } = useSelector((state: any) => state.auth);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    dispatch(logout(navigate));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        {/* Normal Header */}
        <div
          className={`flex w-full items-center justify-between transition-all duration-300 ${
            isSearchOpen ? "opacity-0 pointer-events-none scale-95" : "opacity-100"
          }`}
        >
          {/* Logo */}
          <a href="/" className="flex items-center font-bold text-base sm:text-lg">
            <span>Dump</span>
          </a>

          {/* Desktop Search Bar - Only show when logged in */}
          {token && (
            <div className="hidden md:flex flex-1 justify-center px-4">
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 w-full" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Search Icon - Only show when logged in */}
            {token && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            )}

            {/* Mobile Icons */}
            {token ? (
              // Mobile - Logged in state
              <div className="flex items-center md:hidden gap-1">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
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
              // Mobile - Logged out state
              <div className="flex items-center md:hidden gap-1">
                <CTAButton
                  label="Login"
                  href="/login"
                  variant="ghost"
                  size="sm"
                  className="text-xs px-2"
                />
                <CTAButton
                  label="Sign Up"
                  href="/signup"
                  variant="primary"
                  size="sm"
                  className="text-xs px-2"
                />
              </div>
            )}

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {token ? (
                // Logged in state
                <>
                  <Button variant="ghost" size="sm">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        {user?.email && (
                          <span className="text-sm max-w-32 truncate">
                            {user.email.split("@")[0]}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {user?.email && (
                        <>
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            {user.email}
                          </div>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
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
                // Logged out state
                <>
                  <CTAButton
                    label="Log In"
                    href="/login"
                    variant="ghost"
                    size="sm"
                    className="text-sm"
                  />
                  <CTAButton
                    label="Sign Up"
                    href="/signup"
                    variant="primary"
                    size="sm"
                    className="text-sm"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Mode - Only show when logged in */}
        {token && (
          <div
            className={`absolute inset-0 flex items-center gap-2 px-4 sm:px-6 bg-background transition-all duration-300 ${
              isSearchOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-full pointer-events-none"
            }`}
          >
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 w-full" autoFocus />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
