import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Footer, Header, MobileTabBar } from "@/components/SiteChrome";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { JobsProvider } from "@/context/JobsContext";
import { SubscriptionProvider, useSubscription } from "@/context/SubscriptionContext";
import { HomePage } from "@/pages/HomePage";
import { JobsPage } from "@/pages/JobsPage";
import { JobDetailPage } from "@/pages/JobDetailPage";
import { CompaniesPage } from "@/pages/CompaniesPage";
import { CompanyPage } from "@/pages/CompanyPage";
import { SavedPage } from "@/pages/SavedPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { initializeClickId, getMsisdnFromUrl } from "@/utils/clickIdManager";
import { handlePostPaymentFlow, cleanPostPaymentUrl } from "@/utils/postPaymentHandler";
import { getStoredMobile, getStoredPortalId } from "@/utils/subscriptionFlow";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function SubscriptionGate() {
  const { isPopupOpen, closePopup, handleSubscribe } = useSubscription();

  return (
    <SubscriptionModal
      isOpen={isPopupOpen}
      onClose={closePopup}
      onSubmit={(mobile) => {
        void handleSubscribe(mobile);
      }}
    />
  );
}

function AppShell() {
  const { pathname } = useLocation();
  const isCheckout = pathname === "/checkout";

  useEffect(() => {
    initializeClickId();

    const isCheckoutRoute = window.location.pathname === "/checkout";
    const msisdn = getMsisdnFromUrl();
    const portalId = getStoredPortalId();

    const runPostPayment = async (mobile: string, activePortalId: string) => {
      await handlePostPaymentFlow(mobile, activePortalId);
      cleanPostPaymentUrl();
    };

    if (!isCheckoutRoute && portalId) {
      if (msisdn) {
        void runPostPayment(msisdn, portalId);
      } else {
        const storedMobile = getStoredMobile();
        if (storedMobile) {
          void runPostPayment(storedMobile, portalId);
        }
      }
    }
  }, []);

  return (
    <div
      className={`flex flex-col ${
        isCheckout
          ? "h-dvh max-h-dvh overflow-hidden bg-[#eef2f7]"
          : "min-h-full bg-app font-sans text-text pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"
      }`}
    >
      {!isCheckout ? (
        <div className="pointer-events-none fixed left-[18px] top-0 hidden h-full w-px bg-gold/25 lg:block" />
      ) : null}
      {!isCheckout ? <Header /> : null}
      <main className={isCheckout ? "min-h-0 flex-1 overflow-hidden" : "flex-1"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:slug" element={<CompanyPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isCheckout ? (
        <>
          <Footer />
          <MobileTabBar />
        </>
      ) : null}
      {!isCheckout ? <SubscriptionGate /> : null}
    </div>
  );
}

export default function App() {
  return (
    <JobsProvider>
      <SubscriptionProvider>
        <ScrollToTop />
        <AppShell />
      </SubscriptionProvider>
    </JobsProvider>
  );
}
