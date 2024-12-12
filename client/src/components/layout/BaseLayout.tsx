import React from 'react';
import { Navbar } from './Navbar';
import { Toaster } from '@/components/ui/toaster';

interface BaseLayoutProps {
  children: React.ReactNode;
}

export const BaseLayout = ({ children }: BaseLayoutProps): JSX.Element => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto py-6 px-4">
      {children}
    </main>
    <Toaster />
  </div>
); 