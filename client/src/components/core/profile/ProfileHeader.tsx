import React from 'react';
import { User, Calendar, Mail } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
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

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-row items-start gap-4 sm:gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
              <AvatarFallback className="text-base sm:text-lg font-semibold bg-primary text-primary-foreground">
                <User className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
              </AvatarFallback>
            </Avatar>
            {user.isAnonymous && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                Anonymous User
              </Badge>
            )}
          </div>

          {/* User Info Section */}
          <div className="flex-1 w-full space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {user.email.split('@')[0]}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-xs sm:text-sm max-w-[220px] sm:max-w-none truncate">
                  {user.email}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs sm:text-sm">
                  Joined {formatJoinDate(user.createdAt)}
                </span>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {stats.postsCount}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {stats.totalUpvotes}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Upvotes</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  {stats.totalDownvotes}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Downvotes</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {stats.totalUpvotes - stats.totalDownvotes}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Net Score</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};