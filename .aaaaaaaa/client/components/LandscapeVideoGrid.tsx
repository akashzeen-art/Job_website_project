import type { LandscapeVideo } from "@/data/newLandscapeVideos";

interface LandscapeVideoGridProps {
  videos: LandscapeVideo[];
  onVideoClick: (videoUrl: string, title: string) => void;
  title?: string;
  subtitle?: string;
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function LandscapeVideoGrid({
  videos,
  onVideoClick,
  title = "Landscape",
  subtitle = "Collection",
}: LandscapeVideoGridProps) {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            {title} <span className="text-red-500">{subtitle}</span>
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            20 premium yoga sessions — tap to watch
          </p>
        </div>

        {/* Mobile: 2 cols × 10 rows | Desktop (md+): 5 cols × 4 rows */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          {videos.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => onVideoClick(video.videoUrl, video.title)}
              className="group text-left w-full rounded-lg overflow-hidden border border-white/15 bg-white/5 hover:border-white/35 hover:shadow-lg hover:shadow-black/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={video.image}
                  alt={video.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-black/75 text-[10px] sm:text-xs font-medium text-white">
                  {video.time}
                </span>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 text-sexy-cooking-brown ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="px-2 py-2">
                <p className="text-xs sm:text-sm font-semibold text-white truncate">{video.title}</p>
                <p className="text-[10px] sm:text-xs text-white/70 mt-0.5">{video.time}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
