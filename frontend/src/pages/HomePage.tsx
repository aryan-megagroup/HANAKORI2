import { useState } from 'react';

import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SidebarNav } from '@/components/layout/SidebarNav';
import VideoBackground from '@/components/layout/VideoBackground';

function HomePage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleHome = () => {
    console.log('Home clicked');
  };

  const handleResetSession = () => {
    console.log('Reset session');

    // TODO: Add actual session reset logic
  };

  return (
    <>
      <VideoBackground />

      <div className="relative z-10 min-h-screen font-sans">
        <SidebarNav
          onHome={handleHome}
          onResetSession={handleResetSession}
          isMobileOpen={isSidebarOpen}
          onMobileOpenChange={setIsSidebarOpen}
        />

        {/* Main area */}
        <div
          className={`
            min-h-screen
            transition-[margin] duration-300
            ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}
          `}
        >
          <DashboardHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleSidebar={() => {
              setIsSidebarOpen((prev) => !prev);
            }}
          />

          <main className="w-full px-6 pb-8 md:px-8">
            {/* TODO: Add HomePage content here */}
          </main>
        </div>
      </div>
    </>
  );
}

export default HomePage;