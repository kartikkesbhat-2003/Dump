import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-14">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
};
