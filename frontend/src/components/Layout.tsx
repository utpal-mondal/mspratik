import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from '../components/Navbar/Navbar';
import RouteGuard from './RouteGuard';
import { getRequiredPermissions } from '../config/routePermissions';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // Default to expanded on desktop

  // Handle sidebar close event from backdrop click
  useEffect(() => {
    const handleSidebarClose = () => {
      setIsSidebarOpen(false);
    };

    window.addEventListener('closeSidebar', handleSidebarClose);
    return () => {
      window.removeEventListener('closeSidebar', handleSidebarClose);
    };
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [router.pathname]);

  // Don't render layout on public or auth pages
  if (router.pathname === '/login' || router.pathname === '/register' || router.pathname === '/404' || router.pathname === '/_error') {
    return <>{children}</>;
  }

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Get required permissions for current route
  const requiredPermissions = getRequiredPermissions(router.pathname);

  return (
    <div className="min-h-screen bg-cream-50 print:hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
      />

      <div className={`flex flex-col flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Navbar 
          onToggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />
        
        <main className="flex-1">
          <RouteGuard requiredPermissions={requiredPermissions}>
            {children}
          </RouteGuard>
        </main>
      </div>
    </div>
  );
};

export default Layout;
