import React from 'react';
import { Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

interface CreatePostButtonProps {
  onCreatePost?: () => void;
}

export const CreatePostButton: React.FC<CreatePostButtonProps> = ({ onCreatePost }) => {
  const { token } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const handleClick = () => {
    if (token) {
      navigate('/create-post');
      onCreatePost?.();
    }
  };

  const MobileFAB = () => {
    if (!token) {
      return null;
    }

    return (
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full border border-white/10 bg-white/90 text-black shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition hover:bg-white"
          onClick={handleClick}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    );
  };

  const InputCard = ({ compact = false }: { compact?: boolean }) => {
    if (!token) {
      return (
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 px-6 py-6 text-center text-white">
          <div className="text-xs uppercase tracking-[0.5em] text-white/40">Dump locked</div>
          <h3 className="mt-3 text-2xl font-extralight">Only members can drop today.</h3>
          <p className="mt-2 text-sm text-white/60">
            Step in, claim your voice, and add your dump to the collective stream.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.4em]">
            <Link
              to="/signup"
              className="rounded-full border border-white/10 px-6 py-2 text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Join
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-white/10 px-6 py-2 text-white/60 transition hover:border-white/40 hover:text-white"
            >
              Log In
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 px-6 py-6 text-white ${compact ? 'space-y-4' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs uppercase tracking-[0.3em] text-white/60">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.5em] text-white/40">Dump Console</p>
            <button
              className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-left text-sm text-white/70 transition hover:border-white/40 hover:text-white"
              onClick={handleClick}
            >
              What's your dump today?
            </button>
          </div>
          {!compact && (
            <Button
              className="hidden shrink-0 rounded-full border border-white/10 bg-white text-black px-6 py-2 text-xs uppercase tracking-[0.4em] hover:bg-white/90 lg:inline-flex"
              onClick={handleClick}
            >
              Dump
            </Button>
          )}
        </div>
        {compact && (
          <Button
            className="w-full rounded-full border border-white/10 bg-white text-black py-3 text-xs uppercase tracking-[0.4em] hover:bg-white/90"
            onClick={handleClick}
          >
            Dump
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <MobileFAB />
      <div className="hidden lg:block">
        <InputCard />
      </div>
      <div className="lg:hidden">
        <InputCard compact />
      </div>
    </>
  );
};
