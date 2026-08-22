import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '@/config/env';
import { verifyAccessWithAPI, getMobileForVerification, getPortalIdForVerification, clearSubscriptionCache } from '../utils/accessControlGuard';
import { handleLoginSuccess } from '../utils/loginSuccessHandler';

interface SubscriptionContextType {
  isPopupOpen: boolean;
  openPopup: () => void;
  closePopup: () => void;
  checkAndPlayVideo: (videoData: any, event?: any) => Promise<void>;
  handleSubscribe: (subscriptionData: any) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingVideo, setPendingVideo] = useState<any>(null);
  const clickSent = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Page visible - clearing subscription cache');
        clearSubscriptionCache();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (clickSent.current) return;
    
    if (window.location.pathname === '/checkout') return;
    
    const portalId = new URLSearchParams(window.location.search).get('id') || '1';
    let clickId = new URLSearchParams(window.location.search).get('clickid');
    
    if (!clickId) return;
    
    const callKey = `${clickId}-${portalId}`;
    if ((window as any)._apiCallTracker && (window as any)._apiCallTracker[callKey]) {
      console.log('Duplicate API call blocked:', callKey);
      return;
    }
    
    if (!(window as any)._apiCallTracker) (window as any)._apiCallTracker = {};
    (window as any)._apiCallTracker[callKey] = true;
    
    console.log('🚀 Page load - sending click:', { portalId, clickId });
    
    const trackingUrl = API_ENDPOINTS.paymentPortal(portalId, clickId);
    console.log('📊 Sending to backend:', trackingUrl);
    
    clickSent.current = true;
    
    fetch(trackingUrl)
      .then(response => {
        console.log('✅ Backend response:', response.status);
        return response.text();
      })
      .then(data => console.log('✅ Backend data:', data))
      .catch(error => console.log('❌ Backend error:', error));
  }, []);

  const checkAndPlayVideo = async (videoData: any, event?: any) => {
    console.log('🎬 Video access attempt:', videoData);
    
    const mobile = getMobileForVerification();
    const portalId = getPortalIdForVerification();
    
    if (!mobile) {
      console.log('❌ No mobile number found - showing subscription popup');
      setPendingVideo(videoData);
      setIsPopupOpen(true);
      return;
    }
    
    console.log('🔒 Performing strict API verification...');
    const hasAccess = await verifyAccessWithAPI(mobile, portalId);
    
    if (hasAccess) {
      console.log('✅ Access verified - playing video');
      return videoData;
    } else {
      console.log('❌ Access denied - showing subscription popup');
      clearSubscriptionCache();
      setPendingVideo(videoData);
      setIsPopupOpen(true);
    }
  };

  const handleSubscribe = async (subscriptionData: any) => {
    if (subscriptionData && subscriptionData.mobile) {
      const portalId = getPortalIdForVerification();
      
      console.log('🔑 Handling subscription success:', { mobile: subscriptionData.mobile, portalId });
      
      await handleLoginSuccess(subscriptionData.mobile, portalId);
      
      if (pendingVideo) {
        console.log('🎬 Playing pending video after subscription');
      }
    }
    
    setPendingVideo(null);
    setIsPopupOpen(false);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPendingVideo(null);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isPopupOpen,
        openPopup: () => setIsPopupOpen(true),
        closePopup,
        checkAndPlayVideo,
        handleSubscribe
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
