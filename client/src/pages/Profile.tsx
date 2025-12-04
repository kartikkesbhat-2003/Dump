import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileHeader } from '@/components/core/profile/ProfileHeader';
import { UserPostsList } from '@/components/core/profile/UserPostsList';
import { getCurrentUser, getUserStats } from '@/services/operations/profileAPI';

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

        if (!user) {
          await dispatch(getCurrentUser() as any);
        }

        const userStats = await dispatch(getUserStats() as any);
        setStats(userStats);
      } catch (fetchError) {
        console.error('Error fetching profile data:', fetchError);
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

  const codename = user?.username ?? 'traveler';

  const renderContent = () => {
    if (loading || profileLoading) {
      return (
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center text-white shadow-[0_15px_60px_rgba(0,0,0,0.45)]">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-white" />
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">Synchronizing</p>
          <p className="mt-2 text-base text-white/80">Loading your profile signature...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-[32px] border border-red-500/30 bg-red-500/10 p-8 text-white shadow-[0_15px_60px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-3 text-red-200">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium uppercase tracking-[0.3em]">Signal lost</p>
          </div>
          <p className="mt-3 text-white/80">{error}</p>
          <Button
            onClick={handleRetry}
            variant="ghost"
            className="mt-6 rounded-full border border-white/30 bg-white/10 px-6 text-white hover:bg-white/20"
          >
            Try again
          </Button>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-center text-white shadow-[0_15px_60px_rgba(0,0,0,0.45)]">
          <AlertCircle className="mx-auto h-6 w-6 text-white/60" />
          <p className="mt-4 text-sm uppercase tracking-[0.4em] text-white/50">No data</p>
          <p className="mt-2 text-white/80">Unable to resolve your profile payload. Refresh to attempt again.</p>
          <Button
            onClick={handleRetry}
            variant="ghost"
            className="mt-6 rounded-full border border-white/30 bg-white/5 px-6 text-white hover:bg-white/15"
          >
            Refresh
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        <ProfileHeader user={user} stats={stats} />
        <UserPostsList userId={user._id} />
      </div>
    );
  };

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-gradient-to-b from-background via-background/95 to-black px-3 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
      >
        <div
          className="absolute left-1/2 top-[-25%] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full blur-[260px]"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-15%] h-[28rem] w-[28rem] rounded-full blur-[200px]"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 60%)' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl space-y-10">
        <div className="rounded-[36px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 text-white shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
          <p className="text-xs uppercase tracking-[0.5em] text-white/45">Profile Console</p>
          <h1 className="mt-3 text-3xl font-extralight">{codename}'s orbit.</h1>
        </div>

        <div className="space-y-10 text-white">
          {renderContent()}
        </div>
      </div>
    </section>
  );
};