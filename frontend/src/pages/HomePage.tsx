import { useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import VideoBackground from "@/components/layout/VideoBackground";

function HomePage() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <>
      <VideoBackground />

      <div className="min-h-screen font-sans relative z-10 flex flex-col">
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleSidebar={() => {
          }}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">
        </main>
      </div>
    </>
  );
}

export default HomePage;