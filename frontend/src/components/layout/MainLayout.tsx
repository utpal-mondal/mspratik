import React, { useState } from "react";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar/Navbar";
import Head from "next/head";
import { Box as BoxIcon } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>A Unique Tell</title>
        <meta name="description" content="ShipQuick Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Sidebar isOpen={isSidebarOpen} isCollapsed={isSidebarCollapsed} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar onToggleSidebar={toggleSidebar} />

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
