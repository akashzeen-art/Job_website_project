import { useState, useEffect } from "react";
import VideoPreloader from "./VideoPreloader";

export default function VideoBackground() {
  const [showPreloader, setShowPreloader] = useState(false);
  const [isPreloaderExiting, setIsPreloaderExiting] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const hasSeenPreloader = localStorage.getItem("EYoga_preloader_shown");

    if (!hasSeenPreloader) {
      setShowPreloader(true);

      const timer = setTimeout(() => {
        setIsPreloaderExiting(true);

        const removeTimer = setTimeout(() => {
          setShowPreloader(false);
          localStorage.setItem("EYoga_preloader_shown", "true");
        }, 1000);

        return () => clearTimeout(removeTimer);
      }, 8000);

      return () => clearTimeout(timer);
    } else {
      setShowPreloader(false);
    }
  }, []);

  const desktopVideoUrl = "https://vz-abca0e8d-357.b-cdn.net/e4df15b4-0efe-4564-a518-407f62256865/play_480p.mp4";
  const mobileVideoUrl = "https://vz-abca0e8d-357.b-cdn.net/e4df15b4-0efe-4564-a518-407f62256865/play_480p.mp4";

  return (
    <>
      {showPreloader && <VideoPreloader isExiting={isPreloaderExiting} isMobile={isMobile} />}

      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        {!videoError ? (
          <video
            key={isMobile ? 'mobile-bg' : 'desktop-bg'}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={isMobile ? mobileVideoUrl : desktopVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-cosmic-purple/20 via-cosmic-dark to-cosmic-blue/20"></div>
        )}
      </div>
    </>
  );
}
