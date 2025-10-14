import React from 'react';
import { Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

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

  // Mobile View (Small) - Floating Action Button
  const MobileFAB = () => {
    if (!token) {
      return null; // Hidden for guests
    }

    return (
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          onClick={handleClick}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    );
  };

  // Desktop View (Large) - Full-width Input Card
  const DesktopInputCard = () => {
    if (!token) {
      return (
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Join the debate</h3>
          <p className="text-muted-foreground mb-4">
            Sign up or log in to share your thoughts with the community
          </p>
          <div className="flex gap-3 justify-center">
            <Link 
              to="/signup"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </Link>
            <Link 
              to="/login"
              className="border border-border px-6 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div 
              className="bg-muted rounded-lg p-3 cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={handleClick}
            >
              <p className="text-muted-foreground">What's your dump today?</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile FAB */}
      <MobileFAB />
      
      {/* Desktop Input Card */}
      <div className="hidden lg:block">
        <DesktopInputCard />
      </div>
      
      {/* Mobile Input Card */}
      <div className="lg:hidden">
        <DesktopInputCard />
      </div>
    </>
  );
};
