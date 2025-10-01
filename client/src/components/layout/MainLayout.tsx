import React from 'react';
import { LeftNav } from '@/components/core/feed/LeftNav';
import { RightNav } from '@/components/core/feed/RightNav';
import { useSelector } from 'react-redux';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { token } = useSelector((state: any) => state.auth);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] pt-14">
      {/* Left Navigation */}
      <LeftNav />
      
      {/* Main Content */}
      <main className={`flex-1 ${token ? 'lg:ml-64 lg:mr-80' : ''} min-h-[calc(100vh-3.5rem)]`}>
        {children}
      </main>

      {/* Right Navigation */}
      <RightNav />
    </div>
  );
};
