import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { initializeClickId, getMsisdnFromUrl } from "./utils/clickIdManager";
import { handlePostPaymentFlow, cleanPostPaymentUrl } from "./utils/postPaymentHandler";
import { getStoredMobile, getStoredPortalId } from "./utils/subscriptionFlow";
import { useEffect } from "react";
import Index from "./pages/Index";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import DirectCheckout from "./pages/DirectCheckout";

const queryClient = new QueryClient();

function AppContent() {
  useEffect(() => {
    const { portalId } = initializeClickId();
    const msisdn = getMsisdnFromUrl();
    const isCheckout = window.location.pathname === '/checkout';

    const runPostPayment = async (mobile: string, activePortalId: string) => {
      await handlePostPaymentFlow(mobile, activePortalId);
      cleanPostPaymentUrl();
    };

    if (!isCheckout) {
      if (msisdn && portalId) {
        console.log('💳 Post-payment flow detected:', { msisdn, portalId });
        runPostPayment(msisdn, portalId);
      } else {
        const storedMobile = getStoredMobile();
        const storedPortalId = getStoredPortalId();
        if (storedMobile) {
          console.log('🔄 Checking existing subscription:', { mobile: storedMobile, portalId: storedPortalId });
          runPostPayment(storedMobile, storedPortalId);
        }
      }
    }
    
    localStorage.removeItem(`eatme_product_cache_${portalId}`);
    document.title = 'EYoga';
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/checkout" element={<DirectCheckout />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/refund" element={<Refund />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="*" element={<Index />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SubscriptionProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
          </BrowserRouter>
        </SubscriptionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
