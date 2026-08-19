import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Footer, Header, MobileTabBar } from "@/components/SiteChrome";
import { JobsProvider } from "@/context/JobsContext";
import { HomePage } from "@/pages/HomePage";
import { JobsPage } from "@/pages/JobsPage";
import { JobDetailPage } from "@/pages/JobDetailPage";
import { CompaniesPage } from "@/pages/CompaniesPage";
import { CompanyPage } from "@/pages/CompanyPage";
import { SavedPage } from "@/pages/SavedPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <JobsProvider>
      <ScrollToTop />
      <div className="flex min-h-full flex-col bg-app font-sans text-text pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="pointer-events-none fixed left-[18px] top-0 hidden h-full w-px bg-gold/25 lg:block" />
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:slug" element={<CompanyPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <MobileTabBar />
      </div>
    </JobsProvider>
  );
}
