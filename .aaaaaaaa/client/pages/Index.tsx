import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import VideoBackground from "@/components/VideoBackground";
import VideoModal from "@/components/VideoModal";
import SubscriptionModal from "@/components/SubscriptionModal";
import PlanModal from "@/components/PlanModal";
import Carousel from "@/components/Carousel";
import LandscapeVideoGrid from "@/components/LandscapeVideoGrid";
import { GraduationCap, Clock, Users, Star, ArrowRight, Leaf, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { videoUrls } from "@/data/videoUrls";
import { newLandscapeVideos } from "@/data/newLandscapeVideos";
import { landscapeThumbnail, portraitThumbnail } from "@/config/thumbnails";
import { useQueryParams } from "@/hooks/use-query-params";
import { verifyAccessWithAPI, getMobileForVerification, getPortalIdForVerification, normalizeUrlWithMobile } from "@/utils/accessControlGuard";
import { verifyAndSyncSubscription } from "@/utils/subscriptionFlow";

export default function Index() {
  const [showParticles, setShowParticles] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  const [subscriptionModal, setSubscriptionModal] = useState({ isOpen: false, url: "", title: "" });
  const [planModal, setPlanModal] = useState({ isOpen: false, mobile: "" });
  const [pendingVideo, setPendingVideo] = useState<{ url: string; title: string } | null>(null);
  const [soloSlideIndex, setSoloSlideIndex] = useState(0);
  const queryParams = useQueryParams();

  const openVideo = async (url: string, title: string) => {
    const mobile = getMobileForVerification();
    const portalId = getPortalIdForVerification();

    if (!mobile) {
      setPendingVideo({ url, title });
      setSubscriptionModal({ isOpen: true, url, title });
      return;
    }

    try {
      const isActive = await verifyAccessWithAPI(mobile, portalId);

      if (isActive) {
        normalizeUrlWithMobile(mobile, portalId);
        setSelectedVideo({ url, title });
        return;
      }

      setPendingVideo({ url, title });
      setSubscriptionModal({ isOpen: true, url, title });
    } catch {
      setPendingVideo({ url, title });
      setSubscriptionModal({ isOpen: true, url, title });
    }
  };

  const handleSubscription = async (mobile: string) => {
    const portalId = getPortalIdForVerification();

    try {
      const isActive = await verifyAndSyncSubscription(mobile, portalId);
      setSubscriptionModal({ isOpen: false, url: "", title: "" });

      if (isActive) {
        normalizeUrlWithMobile(mobile, portalId);
        if (pendingVideo) {
          setSelectedVideo(pendingVideo);
          setPendingVideo(null);
        }
      }
    } catch {
      setSubscriptionModal({ isOpen: false, url: "", title: "" });
    }
  };

  const handlePlanSelection = (plan: string) => {
    console.log("Plan selected:", plan);
    setPlanModal({ isOpen: false, mobile: "" });
  };

  useEffect(() => {
    const hasSeenPreloader = localStorage.getItem("EYoga_preloader_shown");
    if (hasSeenPreloader) {
      setShowParticles(true);
    } else {
      const timer = setTimeout(() => {
        setShowParticles(true);
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, []);

  const featuredClasses = [
    {
      id: 1,
      name: "Aastha",
      time: "35 mins",
      image: landscapeThumbnail("AASTHA.jpg"),
      description: "Desi romance ka nasha, full of passion aur pyaar",
      videoUrl: "https://vz-66b329af-17e.b-cdn.net/df51e289-de98-44b6-8916-46bb9ab37fb8/play_480p.mp4",
    },
    {
      id: 2,
      name: "Adavat",
      time: "25 mins",
      image: landscapeThumbnail("ADAVAT.jpg"),
      description: "Dushmani se mohabbat tak ka safar, bold aur intense",
      videoUrl: "https://vz-66b329af-17e.b-cdn.net/50b7d265-485d-4f58-995f-dcddf83176af/play_480p.mp4",
    },
    {
      id: 3,
      name: "Best Performance EP1",
      time: "30 mins",
      image: landscapeThumbnail("BEST PERFORMER EP1.jpg"),
      description: "Sabse best performance, desi tadka with bold scenes",
      videoUrl: "https://vz-66b329af-17e.b-cdn.net/3400d90e-7902-460c-ba28-62b3473fd21a/play_480p.mp4",
    },
    {
      id: 4,
      name: "Best Performance EP2",
      time: "28 mins",
      image: landscapeThumbnail("BEST PERFORMER EP2.jpg"),
      description: "Aur bhi zyada bold aur sexy, must watch episode",
      videoUrl: "https://vz-66b329af-17e.b-cdn.net/45e25b47-cd65-43ca-b42b-b4fc6615139a/play_480p.mp4",
    },
  ];

  const stats = [
    { number: "50K+", label: "Videos", icon: <GraduationCap className="w-6 h-6" /> },
    { number: "100K+", label: "Viewers", icon: <Users className="w-6 h-6" /> },
    { number: "4.9★", label: "Average Rating", icon: <Star className="w-6 h-6" /> },
    { number: "24/7", label: "Community Support", icon: <Flame className="w-6 h-6" /> },
  ];

  return (
    <div className="relative min-h-screen bg-sexy-cooking-cream">
      <VideoBackground />
      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.url || ""}
        title={selectedVideo?.title || ""}
      />
      <SubscriptionModal 
        isOpen={subscriptionModal.isOpen} 
        onClose={() => setSubscriptionModal({ isOpen: false, url: "", title: "" })} 
        onSubmit={handleSubscription} 
      />
      <PlanModal
        isOpen={planModal.isOpen}
        onClose={() => setPlanModal({ isOpen: false, mobile: "" })}
        onSubmit={handlePlanSelection}
        mobile={planModal.mobile}
        email=""
        name="olivemint"
        txnid=""
      />

      <div className="relative z-20">
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="animate-slide-up">
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-sexy-cooking-beige/50 border border-sexy-cooking-olive/20">
                  <Leaf className="w-4 h-4 text-sexy-cooking-olive" />
                  <span className="text-sm text-white font-medium">Premium Entertainment</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
                  Welcome to
                  <span className="text-red-500"> EYoga</span>
                </h1>
                <p className="text-lg text-white/90 mb-8 leading-relaxed">
                  Premium yoga entertainment ka maza lijiye. Exclusive yoga content dekho, mast sessions explore karo, aur unlimited streaming enjoy karo.
                </p>
              </div>

              {/* Hero Image */}
              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-sexy-cooking-beige to-sexy-cooking-olive/20 rounded-3xl blur-3xl opacity-40"></div>
                  <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-xl text-center border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-2">EYoga Premium</h3>
                    <p className="text-white/80">Exclusive entertainment collection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Classes Section */}
        <section className="relative py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-slide-up">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Featured <span className="text-red-500">Bold Videos</span>
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Sabse bold aur exciting desi content, specially selected for you
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredClasses.map((cookingClass, index) => (
                <div
                  key={cookingClass.id}
                  onClick={() => openVideo(cookingClass.videoUrl, cookingClass.name)}
                  className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md overflow-hidden group cursor-pointer animate-bounce-in hover:border-white/40 hover:shadow-xl hover:shadow-white/10 transition-all duration-300"
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                >
                  {/* Image */}
                  <div className="relative aspect-landscape-thumb overflow-hidden">
                    <img src={cookingClass.image} alt={cookingClass.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-sexy-cooking-brown/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2">{cookingClass.name}</h3>
                    <p className="text-sm text-white/80 mb-4">{cookingClass.description}</p>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{cookingClass.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Videos Carousel */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-6">
              Sabhi <span className="text-red-500">Desi Videos</span>
            </h2>
            <Carousel slidesToShow={3}>
              {videoUrls.slice(0, 20).map((video) => (
                <div key={video.id} className="group cursor-pointer transform transition-all duration-300 hover:scale-105" onClick={() => openVideo(video.videoUrl, video.name)}>
                  <div className="relative aspect-landscape-thumb rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img src={video.image} alt={video.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-sexy-cooking-brown ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-bold text-sm text-white">{video.name}</h3>
                    <p className="text-xs text-white/80">{video.time}</p>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Popular Desi Shows */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-8">
              Popular Desi <span className="text-red-500">Bold Shows</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-6">
              {[
                { id: 1, title: "Forbidden Love", time: "00:34 mins", img: "FORBIDDEN LOVE.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/3ac6107e-7f6a-4745-be24-b04c0625472b/play_480p.mp4" },
                { id: 2, title: "Gangubai Kaamwali", time: "00:41 mins", img: "GANGUBAI KAAMWALI.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/9fa5170d-1a9c-468d-a2e6-7f0caed03211/play_480p.mp4" },
                { id: 3, title: "Happy Shorts", time: "00:42 mins", img: "HAPPY SHORTS.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/20b53b00-0426-48df-8d70-d52eb14dd83a/play_480p.mp4" },
                { id: 4, title: "Her Story", time: "00:33 mins", img: "HER STORY.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/f07a8ec2-84cd-48d9-bd0f-c1cf9781f353/play_480p.mp4" },
                { id: 5, title: "Highway 69", time: "00:40 mins", img: "HIGHWAY 69.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/5fed72b5-d5a1-4e1b-a7de-a2c7e8ec3caf/play_480p.mp4" },
                { id: 6, title: "Hot Air Hostage EP1", time: "00:34 mins", img: "HOT AIR HOSTAGE EP1.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/8b15894c-977a-4502-842f-b57de8c5fda6/play_480p.mp4" },
                { id: 7, title: "Hot Air Hostage EP2", time: "00:38 mins", img: "HOT AIR HOSTAGE EP2.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/5165c856-ab73-4468-97ef-5a70980ea288/play_480p.mp4" },
                { id: 8, title: "Hot Air Hostage EP3", time: "00:35 mins", img: "HOT AIR HOSTAGE EP3.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/9a006cb7-17f2-4894-bdcc-a0a57faf8f25/play_480p.mp4" },
                { id: 9, title: "Hot Coffee EP1", time: "00:37 mins", img: "HOT COFFEE EP1.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/9c5e598a-06bb-4b7d-89f9-cb76ec94a78b/play_480p.mp4" },
                { id: 10, title: "Hot Coffee EP2", time: "00:39 mins", img: "HOT COFFEE EP2.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/ddf32747-ae8a-4437-89c9-08fdbef2f627/play_480p.mp4" },
                { id: 11, title: "Hot Shot", time: "00:36 mins", img: "HOT SHOT.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/ebbf3364-1d25-4454-8e8a-0aa166f31dd7/play_480p.mp4" },
                { id: 12, title: "Jaal", time: "00:41 mins", img: "JAAL.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/23e20e42-71bf-4d34-bb2b-638a6e00d126/play_480p.mp4" },
                { id: 13, title: "Kama Rasam", time: "00:43 mins", img: "KAMA RASASAM.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/25199036-86e4-4231-9e7e-529f90ac0e48/play_480p.mp4" },
                { id: 14, title: "Kamini EP1", time: "00:38 mins", img: "KAMINI EP1.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/66392db7-c400-447d-afd8-ffce12d5e2cf/play_480p.mp4" },
              ].map((video, index) => (
                <div key={video.id} className="group cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 50}ms` }} onClick={() => openVideo(video.videoUrl, video.title)}>
                  <div className="relative aspect-portrait-thumb rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img src={portraitThumbnail(video.img)} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-sexy-cooking-brown ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-white/80">{video.time}, Desi Content</p>
                    <h3 className="font-bold text-sm text-white">{video.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solo Episodes */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-6">
              Solo Episodes <span className="text-red-500">Abhi Dekho!</span>
            </h2>
            <div className="relative group">
              <div className="overflow-hidden">
                <div className="flex transition-transform duration-300 ease-out gap-4" style={{ transform: `translateX(-${soloSlideIndex * 100}%)` }}>
                  {[
                    { id: 1, title: "Kamini EP2", time: "00:33 mins", img: "KAMINI EP2.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/a045b5c9-8853-40e7-8edf-d46e955952ee/play_480p.mp4" },
                    { id: 2, title: "Kamini EP3", time: "00:36 mins", img: "KAMINI EP3.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/b7d1489a-ea57-4d4a-b34e-802138f49aa9/play_480p.mp4" },
                    { id: 3, title: "Kill For Love EP1", time: "00:34 mins", img: "KILL FOR LOVE EP1.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/fc3fa1ee-865e-46e9-ba57-5296bd3951db/play_480p.mp4" },
                    { id: 4, title: "Kill For Love EP2", time: "00:40 mins", img: "KILL FOR LOVE EP2.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/4c6b6133-f1da-4515-9878-66d95941438d/play_480p.mp4" },
                    { id: 5, title: "Kill For Love EP3", time: "00:34 mins", img: "KILL FOR LOVE EP3.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/7378b409-a38d-4bb9-8731-6da2c43691e7/play_480p.mp4" },
                    { id: 6, title: "Kill For Love EP4", time: "00:41 mins", img: "KILL FOR LOVE EP4.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/affa862c-e511-4eff-aff3-56810d713399/play_480p.mp4" },
                    { id: 7, title: "Killer Workout", time: "00:42 mins", img: "KILLER WORKOUT.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/efaf0c08-eb70-41df-bfc4-72092aeb3c83/play_480p.mp4" },
                  ].map((video) => (
                    <div key={video.id} className="flex-shrink-0 w-full sm:w-1/3 md:w-1/5">
                      <div className="group cursor-pointer px-2" onClick={() => openVideo(video.videoUrl, video.title)}>
                        <div className="relative aspect-portrait-thumb rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 max-w-[150px] mx-auto">
                          <img src={portraitThumbnail(video.img)} alt={video.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-sexy-cooking-brown ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 max-w-[150px] mx-auto">
                          <p className="text-xs text-white/80">{video.time}, Desi Content</p>
                          <h3 className="font-bold text-xs text-white">{video.title}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSoloSlideIndex(Math.max(0, soloSlideIndex - 1))}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white text-sexy-cooking-brown rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10 disabled:opacity-30"
                disabled={soloSlideIndex === 0}
                aria-label="Previous"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => setSoloSlideIndex(Math.min(6, soloSlideIndex + 1))}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white text-sexy-cooking-brown rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10 disabled:opacity-30"
                disabled={soloSlideIndex === 6}
                aria-label="Next"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Hot Desi Series */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-sexy-cooking-brown/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3">
                Bold Sexy Desire <span className="text-red-500">desi series</span>
              </h2>
              <p className="text-white/90 text-lg">Abhi Dekho</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { id: 1, title: "Lady Killer", episode: "S01E01", img: "LADY KILLER.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/3e40f71c-19f7-41d7-b95a-2e14e16dda06/play_480p.mp4" },
                { id: 2, title: "Love Detective", episode: "S01E02", img: "LADY DETECTIVE.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/59aade45-6010-4198-877e-9a9f0a1bcbc8/play_480p.mp4" },
                { id: 3, title: "Love Lady", episode: "S01E03", img: "Love lady.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/e5e3833f-b06a-4b30-adce-5af66226d947/play_480p.mp4" },
                { id: 4, title: "MMS Taxi", episode: "S01E04", img: "MMS TAXI.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/a79219ec-b365-455e-a844-1c3dc3b0c1f2/play_480p.mp4" },
              ].map((video, index) => (
                <div key={video.id} className="group cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 100}ms` }} onClick={() => openVideo(video.videoUrl, video.title)}>
                  <div className="relative aspect-landscape-thumb rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img src={landscapeThumbnail(video.img)} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-sexy-cooking-brown ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-white/80">{video.episode}</p>
                    <h3 className="font-bold text-sm text-white">{video.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hot Episodes Desi Masala */}
        <section className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-4">
              Exciting Episodes <span className="text-red-500">Desi Masala</span>
            </h2>
            <Carousel slidesToShow={3}>
              {[
                { id: 1, title: "Paap EP1", time: "15 mins", img: "PAAP EP1.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/66d9215c-9e6d-45c4-baf0-dde31e3d5057/play_480p.mp4" },
                { id: 2, title: "Paap EP2", time: "20 mins", img: "PAAP EP2.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/c4d37df3-6da5-4145-9202-f225ed699791/play_480p.mp4" },
                { id: 3, title: "Paap EP3", time: "25 mins", img: "PAAP EP3.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/fb5b01c0-9519-4f2b-ab0b-0cff13691039/play_480p.mp4" },
                { id: 4, title: "Paap EP4", time: "10 mins", img: "PAAP EP4.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/9f8c132f-f631-4af1-8320-23e360f33682/play_480p.mp4" },
                { id: 5, title: "Sasurji", time: "18 mins", img: "SASURJI.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/c597190d-48fd-4c56-b90a-22dff40bf987/play_480p.mp4" },
                { id: 6, title: "Shikari EP1", time: "22 mins", img: "SHIKARI EP1.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/e5dbb886-7e2c-4ec6-9982-d75a5b6a025a/play_480p.mp4" },
                { id: 7, title: "Shikari EP2", time: "12 mins", img: "SHIKARI EP2.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/8d73d338-4ee5-4747-b10f-9938a581e5d5/play_480p.mp4" },
                { id: 8, title: "Shikari EP3", time: "28 mins", img: "SHIKARI EP3.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/7a472d63-8b87-4e74-b0f9-21821e3b8e1c/play_480p.mp4" },
              ].map((video) => (
                <div key={video.id} className="group cursor-pointer px-1" onClick={() => openVideo(video.videoUrl, video.title)}>
                  <div className="relative aspect-landscape-thumb rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img src={landscapeThumbnail(video.img)} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-sexy-cooking-brown ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1">
                    <h3 className="font-bold text-xs text-white truncate">{video.title}</h3>
                    <p className="text-xs text-white/80">{video.time}</p>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Premium Desi Collection */}
        <section className="py-6 px-4 sm:px-6 lg:px-8 bg-transparent">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-4">
              Premium Desi <span className="text-red-500">Collection</span>
            </h2>
            <Carousel slidesToShow={3}>
              {[
                { id: 1, title: "Shikari EP4", genre: "Bold Series", img: "SHIKARI EP4.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/0ef70162-4335-41dc-95f3-b89d22724cf3/play_480p.mp4" },
                { id: 2, title: "Taak Jhaak", genre: "Hot Story", img: "TAK JHAK.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/c67045d4-efb3-4977-9428-4937ef3c57ba/play_480p.mp4" },
                { id: 3, title: "Tera Nasha", genre: "Romance", img: "Tera  Nasha.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/b8f9b36e-ab04-4d30-91da-345e6ffa02b8/play_480p.mp4" },
                { id: 4, title: "The Insult EP1", genre: "Drama", img: "THE INSULT EP1.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/e7f190a7-9cf9-4b89-9e87-ee618f10168a/play_480p.mp4" },
                { id: 5, title: "The Insult EP2", genre: "Drama", img: "THE INSULT EP2.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/3ac6107e-7f6a-4745-be24-b04c0625472b/play_480p.mp4" },
                { id: 6, title: "The Insult EP3", genre: "Drama", img: "THE INSULT EP3.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/e08930bc-13e0-4f73-801f-d98839dc384e/play_480p.mp4" },
                { id: 7, title: "The Insult EP4", genre: "Drama", img: "THE INSULT EP4.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/d4e7f986-4c01-450a-8b6f-5945d13d7bad/play_480p.mp4" },
                { id: 8, title: "Trapped EP1", genre: "Thriller", img: "TRAPED EP1.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/4ac6a6ae-1e67-43d6-b402-6be260b3cb3b/play_480p.mp4" },
                { id: 9, title: "Trapped EP2", genre: "Thriller", img: "TRAPED EP2.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/3e40f71c-19f7-41d7-b95a-2e14e16dda06/play_480p.mp4" },
              ].map((video) => (
                <div key={video.id} className="group cursor-pointer px-1" onClick={() => openVideo(video.videoUrl, video.title)}>
                  <div className="relative aspect-landscape-thumb rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img src={landscapeThumbnail(video.img)} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-sexy-cooking-brown ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1">
                    <h3 className="font-bold text-xs text-white truncate">{video.title}</h3>
                    <p className="text-xs text-white/80">{video.genre}</p>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Trending This Week */}
        <section className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-4">
              Trending <span className="text-red-500">Is Hafte</span>
            </h2>
            <Carousel slidesToShow={3}>
              {[
                { id: 1, title: "Kamini EP1", views: "2.5M views", img: "KAMINI EP1.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/66392db7-c400-447d-afd8-ffce12d5e2cf/play_480p.mp4" },
                { id: 2, title: "Kamini EP2", views: "1.8M views", img: "KAMINI EP2.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/a5c8f9d2-3e1b-4a7c-9f2d-8b6e4c1a5d3f/play_480p.mp4" },
                { id: 3, title: "Kamini EP3", views: "3.2M views", img: "KAMINI EP3.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/b7d9e1f3-4c2a-5b8d-a3e4-9c7f5d2b6e4a/play_480p.mp4" },
                { id: 4, title: "Kill For Love EP1", views: "1.5M views", img: "KILL FOR LOVE EP1.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/c8e1f2a4-5d3b-6c9e-b4f5-a8d6e3c7f5b2/play_480p.mp4" },
                { id: 5, title: "Kill For Love EP2", views: "2.1M views", img: "KILL FOR LOVE EP2.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/d9f2e3b5-6e4c-7d1f-c5a6-b9e7f4d8a6c3/play_480p.mp4" },
                { id: 6, title: "Kill For Love EP3", views: "1.9M views", img: "KILL FOR LOVE EP3.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/e1a3f4c6-7f5d-8e2a-d6b7-c1f8e5a9b7d4/play_480p.mp4" },
                { id: 7, title: "Kill For Love EP4", views: "2.7M views", img: "KILL FOR LOVE EP4.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/f2b4e5d7-8a6e-9f3b-e7c8-d2a9f6b1c8e5/play_480p.mp4" },
                { id: 8, title: "Killer Workout", views: "3.5M views", img: "KILLER WORKOUT.jpg", videoUrl: "https://vz-66b329af-17e.b-cdn.net/a3c5f6e8-9b7f-1d4c-f8d9-e3b1a7c2d9f6/play_480p.mp4" },
              ].map((video) => (
                <div key={video.id} className="group cursor-pointer px-1" onClick={() => openVideo(video.videoUrl, video.title)}>
                  <div className="relative aspect-landscape-thumb rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img src={landscapeThumbnail(video.img)} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-sexy-cooking-brown ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1">
                    <h3 className="font-bold text-xs text-white truncate">{video.title}</h3>
                    <p className="text-xs text-white/80">{video.views}</p>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Hollywood Series */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-sexy-cooking-brown/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-8">
              Hollywood <span className="text-red-500">Series</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {[
                { id: 1, title: "Legend of Hell", season: "Hot & Thrilling", img: "LEGEND OF HELL.png", videoUrl: "https://vz-66b329af-17e.b-cdn.net/bb7e3b04-7aa5-40a9-88f2-d02322495d45/play_480p.mp4" },
                { id: 2, title: "Kill Her Goats", season: "Bold & Intense", img: "KILL HER GOATS.png", videoUrl: "https://vz-66b329af-17e.b-cdn.net/b8a0faee-f6e2-48d3-a6c0-d41bcd81010c/play_480p.mp4" },
                { id: 3, title: "Making Off", season: "Steamy Drama", img: "MAKING OFF.png", videoUrl: "https://vz-66b329af-17e.b-cdn.net/86b154cc-57ae-4d96-b205-12e9d4a5b5b4/play_480p.mp4" },
                { id: 4, title: "Muck Original", season: "Sensual Mystery", img: "MUCK ORIGNAL.png", videoUrl: "https://vz-66b329af-17e.b-cdn.net/b69365f5-72f5-464e-b4b6-5e23f21acb4b/play_480p.mp4" },
                { id: 5, title: "Sinners and Saints", season: "Passionate Tale", img: "of sinners and saints.png", videoUrl: "https://vz-66b329af-17e.b-cdn.net/74d4d3f5-4824-4a28-8c70-b451d3ecfef0/play_480p.mp4" },
                { id: 6, title: "The Broken Crown", season: "Seductive Story", img: "THE BROKEN CROWN.png", videoUrl: "https://vz-66b329af-17e.b-cdn.net/62b79869-36b6-4e7b-9c2f-333ec04855dd/play_480p.mp4" },
                { id: 7, title: "The Immortal Hunters", season: "Tempting Action", img: "THE IMMORTAL HUNTERS.png", videoUrl: "https://vz-66b329af-17e.b-cdn.net/072ccfb3-35ea-436b-8cb6-62d162e8b2e8/play_480p.mp4" },
                { id: 8, title: "The Glass Coffin", season: "Erotic Thriller", img: "THE GLASS COFIN.png", videoUrl: "https://vz-66b329af-17e.b-cdn.net/0fb73007-86fd-4c85-95c8-d06023c8f08f/play_480p.mp4" },
                { id: 9, title: "Ultimate Chabite", season: "Spicy Adventure", img: "ULTIMATE CHABITE.png", videoUrl: "https://vz-66b329af-17e.b-cdn.net/b28fd370-b44f-4472-b5bb-814b7aa3eb39/play_480p.mp4" },
                { id: 10, title: "Alex & Jaime", season: "Intimate Romance", img: "ALEX & JAIME.png", videoUrl: "https://vz-66b329af-17e.b-cdn.net/28bcd43f-b1f2-41b4-bc0a-791e5ee50d16/play_480p.mp4" },
              ].map((video, index) => (
                <div key={video.id} className="group cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 50}ms` }} onClick={() => openVideo(video.videoUrl, video.title)}>
                  <div className="relative aspect-video rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img src={`/English Thumbnails/${video.img}`} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-sexy-cooking-brown ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-white/80">{video.season}</p>
                    <h3 className="font-bold text-sm text-white">{video.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New Yoga Collection — mobile 2×10, desktop 5×4 */}
        <LandscapeVideoGrid
          videos={newLandscapeVideos}
          onVideoClick={openVideo}
          title="New Yoga"
          subtitle="Collection"
        />

        {/* Sensual Yoga Collection */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-sexy-cooking-brown/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-8">
              Sensual Yoga <span className="text-red-500">Collection</span>
            </h2>
            <Carousel slidesToShow={5}>
              {[
                { id: 1, title: "Flexibility Flow", duration: "25 mins", img: "1.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/b63d2451-d1ff-4f40-8487-96e17c30d0ba/play_480p.mp4" },
                { id: 2, title: "Body Balance", duration: "30 mins", img: "2.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/77e9d93d-8dd5-4872-8eca-76f47a101535/play_480p.mp4" },
                { id: 3, title: "Stretch & Tone", duration: "28 mins", img: "3.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/da9a1047-267b-4eaf-9fe8-8672bbe03a99/play_480p.mp4" },
                { id: 4, title: "Power Poses", duration: "32 mins", img: "4.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/7ff2c6e3-9d04-44b1-ab74-23b50bf2ee3f/play_480p.mp4" },
                { id: 5, title: "Core Strength", duration: "27 mins", img: "5.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/62d9039d-d6a2-4875-ad26-044ecb73f465/play_480p.mp4" },
                { id: 6, title: "Mindful Movement", duration: "35 mins", img: "6.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/0009cd8e-cdb6-47f3-9de3-50a54ff31db9/play_480p.mp4" },
                { id: 7, title: "Graceful Asanas", duration: "29 mins", img: "7.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/358c36ac-f7d7-4199-b9a3-4a47440ad736/play_480p.mp4" },
                { id: 8, title: "Wellness Flow", duration: "31 mins", img: "8.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/421d5e21-9fac-4e47-b306-d3af1971b33f/play_480p.mp4" },
                { id: 9, title: "Energy Boost", duration: "26 mins", img: "9.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/2c0ebe0b-bd90-4f7a-a562-ca1221358571/play_480p.mp4" },
                { id: 10, title: "Zen Practice", duration: "33 mins", img: "10.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/4717f4c8-448b-4005-b170-b55f85513b3b/play_480p.mp4" },
              ].map((video) => (
                <div key={video.id} className="group cursor-pointer px-2" onClick={() => openVideo(video.videoUrl, video.title)}>
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 max-w-[150px] mx-auto">
                    <img src={`/Thumbnails/${video.img}`} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-sexy-cooking-brown ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 max-w-[150px] mx-auto">
                    <h3 className="font-bold text-xs text-white truncate">{video.title}</h3>
                    <p className="text-xs text-white/80">{video.duration}</p>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Fitness Workout Series */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-8">
              Fitness Workout <span className="text-red-500">Series</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {[
                { id: 1, title: "Cardio Blast", duration: "30 mins", img: "F1.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/067e9e6f-b190-4ea8-837d-edf2f2ee5d93/play_480p.mp4" },
                { id: 2, title: "Strength Training", duration: "35 mins", img: "F2.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/24e3d12e-e3dd-4517-bc65-802fc41e1387/play_480p.mp4" },
                { id: 3, title: "Full Body Burn", duration: "28 mins", img: "F3.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/2b392888-3390-460e-8aa0-f7c93a00e27c/play_480p.mp4" },
                { id: 4, title: "Core Workout", duration: "25 mins", img: "F4.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/6237de2b-5855-459b-a3f3-9889c710564d/play_480p.mp4" },
                { id: 5, title: "HIIT Session", duration: "32 mins", img: "F5.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/1b5550eb-1c06-44cb-ad97-7f4391b18f33/play_480p.mp4" },
                { id: 6, title: "Toning Routine", duration: "27 mins", img: "F6.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/c3ac8858-6f5e-4230-bd90-0681a0e3367c/play_480p.mp4" },
                { id: 7, title: "Endurance Build", duration: "40 mins", img: "F7.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/fe230bf2-38d4-408b-a83f-c87f529a42a4/play_480p.mp4" },
                { id: 8, title: "Power Training", duration: "33 mins", img: "F8.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/3558ac7d-ecea-485b-bbce-bceb768c867d/play_480p.mp4" },
                { id: 9, title: "Sculpt & Shape", duration: "29 mins", img: "P1.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/73b38601-f4ca-48db-9b53-b9e82df40091/play_480p.mp4" },
                { id: 10, title: "Athletic Performance", duration: "36 mins", img: "P2.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/c4710130-74d1-418f-977c-d766904b1186/play_480p.mp4" },
              ].map((video, index) => (
                <div key={video.id} className="group cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 50}ms` }} onClick={() => openVideo(video.videoUrl, video.title)}>
                  <div className="relative aspect-video rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img src={`/Thumbnails/${video.img}`} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-sexy-cooking-brown ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-bold text-sm text-white">{video.title}</h3>
                    <p className="text-xs text-white/80">{video.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Desi Shorts */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-8">
              Premium Yoga <span className="text-red-500">Sexy Series</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {[
                { id: 1, title: "Hot Moments", duration: "5 mins", img: "S2.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/efc87638-9594-4cdc-9341-678021d3fda6/play_480p.mp4" },
                { id: 2, title: "Sensual Stories", duration: "6 mins", img: "S1.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/ee6bf8ad-ae76-40e9-b920-46d05aad63cf/play_480p.mp4" },
                { id: 3, title: "Bold Scenes", duration: "4 mins", img: "P10.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/0de683b5-5e12-4617-9bd8-c0ab399d050a/play_480p.mp4" },
                { id: 4, title: "Intimate Tales", duration: "7 mins", img: "P9.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/22f0b155-cee5-4055-a936-380b4d78e049/play_480p.mp4" },
                { id: 5, title: "Romantic Clips", duration: "5 mins", img: "P8.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/d9378cc3-f6d1-43e5-835b-875f4941fdfc/play_480p.mp4" },
                { id: 6, title: "Passion Reels", duration: "6 mins", img: "P7.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/e636744e-f8c4-4e02-8d06-800ccde3a14a/play_480p.mp4" },
                { id: 7, title: "Desire Shorts", duration: "4 mins", img: "P6.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/ede0951b-f601-4a20-91b4-0e6b46fa7919/play_480p.mp4" },
                { id: 8, title: "Steamy Clips", duration: "5 mins", img: "P5.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/a9423b93-f129-4915-88bd-3f99ba720884/play_480p.mp4" },
                { id: 9, title: "Spicy Moments", duration: "6 mins", img: "P4.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/a36e7860-11b5-4467-85ad-a15310f12ada/play_480p.mp4" },
                { id: 10, title: "Tempting Reels", duration: "7 mins", img: "P3.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/38b0a19c-9058-44a1-9b8a-d52ac72aaf7e/play_480p.mp4" },
              ].map((video, index) => (
                <div key={video.id} className="group cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 50}ms` }} onClick={() => openVideo(video.videoUrl, video.title)}>
                  <div className="relative aspect-video rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img src={`/Thumbnails/${video.img}`} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-sexy-cooking-brown ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-bold text-sm text-white">{video.title}</h3>
                    <p className="text-xs text-white/80">{video.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exclusive Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-sexy-cooking-brown/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-8">
              Exclusive <span className="text-red-500">Content</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {[
                { id: 1, title: "Special Edition", duration: "8 mins", img: "P4.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/3fb78412-1e37-48ba-9979-24fa911a9996/play_480p.mp4" },
                { id: 2, title: "VIP Access", duration: "9 mins", img: "P5.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/59de7915-6920-449e-a287-d1288154f273/play_480p.mp4" },
                { id: 3, title: "Premium Plus", duration: "7 mins", img: "P6.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/2e8befac-542c-4f67-8529-f4c5dfbc98a7/play_480p.mp4" },
                { id: 4, title: "Elite Series", duration: "10 mins", img: "P7.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/eae9d2e8-431c-41b0-9f15-7492a45a05e6/play_480p.mp4" },
                { id: 5, title: "Luxury Collection", duration: "8 mins", img: "P8.png", videoUrl: "https://vz-a8f5da8b-27d.b-cdn.net/0ed8dd89-3e05-48fa-b193-a53ad7c77e55/play_480p.mp4" },
              ].map((video, index) => (
                <div key={video.id} className="group cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 50}ms` }} onClick={() => openVideo(video.videoUrl, video.title)}>
                  <div className="relative aspect-video rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img src={`/Thumbnails/${video.img}`} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-sexy-cooking-brown ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-bold text-sm text-white">{video.title}</h3>
                    <p className="text-xs text-white/80">{video.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative border-t border-white/20 bg-white/10 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-6">
              <img src="/logo.png" alt="EYoga" className="w-20 h-20 object-contain" />
              <p className="text-white/80 text-sm">Your gateway to premium yoga entertainment</p>

            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
