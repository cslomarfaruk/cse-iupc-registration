'use client';
import { useState, useEffect } from 'react';
import AdminNav from '@/components/AdminNav';
import AdminFooter from '@/components/AdminFooter';

export default function AdminLayout({ children }) {
  // Add an animation for when the page loads
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <AdminNav />
      
      {/* Main content with padding for the fixed header */}
      <main 
        className={`flex-grow pt-16 transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </main>
      
      <AdminFooter />
    </div>
  );
}