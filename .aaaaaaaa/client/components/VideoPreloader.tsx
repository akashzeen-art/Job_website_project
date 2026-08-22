import { useState, useEffect, useRef } from "react";

interface VideoPreloaderProps {
  isExiting?: boolean;
  onLogoTransition?: () => void;
  isMobile?: boolean;
}

export default function VideoPreloader({ isExiting = false, onLogoTransition, isMobile = false }: VideoPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
      video.play().catch(() => {
        const playOnInteraction = () => {
          video.play();
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
      });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const increment = prev < 50 ? 1.5 : prev < 80 ? 0.8 : 0.3;
        return Math.min(prev + increment, 100);
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes logoFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes logoBreathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes logoToNavbar {
          0% {
            transform: translate(0, 0) scale(1);
          }
          100% {
            transform: translate(0, calc(-50vh + 2rem)) scale(0.5);
          }
        }

        .logo-fade-in {
          animation: logoFadeIn 0.8s ease-in-out;
        }

        .logo-breathe {
          animation: logoBreathe 3s ease-in-out infinite;
          will-change: transform;
        }

        .logo-to-navbar {
          animation: logoToNavbar 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          will-change: transform;
        }
      `}</style>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${
          isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          transition: "opacity 1s ease-in-out",
        }}
      >
        {/* Video background - perfectly centered and scaled */}
        <div className="absolute inset-0 bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto transform -translate-x-1/2 -translate-y-1/2"
            style={{ objectFit: "cover" }}
          >
            <source
              src={isMobile 
                ? "https://vz-abca0e8d-357.b-cdn.net/e4df15b4-0efe-4564-a518-407f62256865/play_480p.mp4"
                : "https://vz-abca0e8d-357.b-cdn.net/e4df15b4-0efe-4564-a518-407f62256865/play_480p.mp4"
              }
              type="video/mp4"
            />
          </video>
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>

        {/* Logo and content */}
        <div className="relative z-20 flex flex-col items-center justify-center gap-8">
          {/* Logo with breathing animation */}
          <div className={`${
            isExiting ? "logo-to-navbar" : "logo-fade-in logo-breathe"
          }`}>
            <img
              src="/logo.png"
              alt="EYoga"
              className="w-32 h-32 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Progress section */}
          <div className={`text-center flex flex-col items-center transition-opacity duration-500 ${
            isExiting ? "opacity-0" : "opacity-100"
          }`}>
            <p className="text-lg font-medium text-white/80 mb-6">
              Loading Hot Desi Content...
            </p>

            {/* Progress bar */}
            <div className="w-72 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-red-600 transition-all duration-100"
                style={{
                  width: `${progress}%`,
                }}
              ></div>
            </div>

            {/* Progress percentage */}
            <div className="text-white/60 text-sm font-medium mt-3">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
