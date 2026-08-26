export default function VideoBackground() {
  return (
    <div className="fixed top-0 left-0 h-screen w-screen -z-10 overflow-hidden bg-background">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
        id="bg-video"
      >
        <source src="/uploads/I_want_you_to_create_a_animate.mp4" type="video/mp4" />
      </video>
      <div className="absolute top-0 left-0 h-full w-full bg-slate-900/20 backdrop-blur-[2px]"></div>
    </div>
  );
}