import VideoBackground from '@/components/layout/VideoBackground';

function HomePage() {
  return (
    <>
      <VideoBackground />
      
      <div className="flex min-h-screen text-foreground">      

        {/* TEMPORARY TEXT TO BE REMOVED AND OTHER COMPONENT TO BE ADDED BELOW */}
        <main className="flex-1 p-8 relative z-10">
          <h1 className="text-3xl font-bold text-white drop-shadow-md">
            HANAKORI2 React UI
          </h1>
        </main>
      </div>
    </>
  );
}

export default HomePage;