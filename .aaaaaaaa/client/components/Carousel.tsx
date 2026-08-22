import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: React.ReactNode[];
  slidesToShow?: number;
}

export default function Carousel({ children, slidesToShow = 5 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const getSlidesToShow = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
    }
    return slidesToShow;
  };

  const [responsiveSlidesToShow, setResponsiveSlidesToShow] = useState(getSlidesToShow());

  useEffect(() => {
    const handleResize = () => {
      setResponsiveSlidesToShow(getSlidesToShow());
      setCurrentIndex(0);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, children.length - responsiveSlidesToShow);

  const next = () => {
    if (currentIndex < maxIndex && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  return (
    <div className="relative group">
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex transition-transform duration-300 ease-out gap-4"
          style={{ transform: `translateX(-${currentIndex * (100 / responsiveSlidesToShow)}%)` }}
        >
          {children.map((child, index) => (
            <div key={index} className="flex-shrink-0" style={{ width: `calc(${100 / responsiveSlidesToShow}% - ${(responsiveSlidesToShow - 1) * 16 / responsiveSlidesToShow}px)` }}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {currentIndex > 0 && (
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white text-sexy-cooking-brown rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {currentIndex < maxIndex && (
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white text-sexy-cooking-brown rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
