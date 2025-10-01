import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ProfileHeader } from '@/components/core/profile/ProfileHeader';
import { UserPostsList } from '@/components/core/profile/UserPostsList';
import { getCurrentUser, getUserStats } from '@/services/operations/profileAPI';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const Profile: React.FC = () => {
  const { user, loading: profileLoading } = useSelector((state: any) => state.profile);
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    postsCount: 0,
    totalUpvotes: 0,
    totalDownvotes: 0,
    joinedDate: new Date().toISOString(),
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current user if not already loaded
        if (!user) {
          await dispatch(getCurrentUser() as any);
        }

        // Fetch user statistics
        const userStats = await dispatch(getUserStats() as any);
        setStats(userStats);

      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [dispatch, user]);

  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading state
  if (loading || profileLoading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <Alert variant="destructive" className="max-w-md w-full mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <span>{error}</span>
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              size="sm"
              className="w-full sm:w-fit"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show profile if user data is available
  if (!user) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <Alert className="max-w-md w-full mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load user data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
      <div className="space-y-6 sm:space-y-8">
        {/* Profile Header */}
        <ProfileHeader user={user} stats={stats} />

        {/* User Posts Section */}
        <div className="bg-background">
          <UserPostsList userId={user._id} />
        </div>
      </div>
    </div>
  );
};