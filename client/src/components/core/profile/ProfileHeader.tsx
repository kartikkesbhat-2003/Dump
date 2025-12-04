import React from 'react';
import { Calendar, Mail } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { User as UserType } from '@/types';

interface ProfileHeaderProps {
  user: UserType;
  stats: {
    postsCount: number;
    totalUpvotes: number;
    totalDownvotes: number;
    joinedDate: string;
  };
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, stats }) => {
  const formatJoinDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const initials = (user.username ? user.username.charAt(0) : user.email?.charAt(0))?.toUpperCase() || 'U';

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 sm:p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-3xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left sm:gap-6">
          <Avatar className="h-16 w-16 border border-white/20 bg-transparent sm:h-20 sm:w-20">
            <AvatarFallback className="bg-transparent text-2xl font-light text-white sm:text-3xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <p className="text-xl font-light leading-tight sm:text-2xl">
              {user.username || 'traveler'}
            </p>
            {user.isAnonymous ? (
              <Badge variant="secondary" className="rounded-full border border-white/20 bg-white/10 text-[9px] uppercase tracking-[0.3em] text-white">
                Anonymous
              </Badge>
            ) : (
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/50">Verified</p>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-5">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Identity imprint</p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70 sm:text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-white/50" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/50" />
                <span>Joined {formatJoinDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Drops logged</p>
              <p className="text-3xl font-light text-white">{stats.postsCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};