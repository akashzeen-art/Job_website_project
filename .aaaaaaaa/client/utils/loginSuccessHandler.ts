/**
 * Login Success Handler
 */

import { checkSubStatus, buildSubscribedRedirectUrl } from '../services/userStatusApi';
import { persistActiveSubscription } from './subscriptionFlow';

export const handleLoginSuccess = async (mobile: string, portalId: string | number = '1') => {
  if (!mobile || mobile.trim() === '') {
    console.error('❌ Login success: Invalid mobile number');
    return false;
  }

  const cleanMobile = mobile.trim();

  try {
    console.log('🔍 Login success: Verifying subscription status', { mobile: cleanMobile, portalId });

    const isActive = await checkSubStatus(cleanMobile, portalId);

    console.log('📊 Login verification result:', { isActive });

    if (isActive) {
      const redirectUrl = buildSubscribedRedirectUrl(cleanMobile, portalId);
      console.log('✅ Subscribed user - redirecting to:', redirectUrl);

      persistActiveSubscription(cleanMobile, portalId);

      window.location.href = redirectUrl;
      return true;
    }

    console.log('❌ User not subscribed - staying on current page');
    localStorage.removeItem('isSubscribed');
    localStorage.removeItem('subscriptionData');
    localStorage.setItem('userMobile', cleanMobile);
    return false;
  } catch (error) {
    console.error('❌ Login verification failed:', error);
    localStorage.removeItem('isSubscribed');
    localStorage.removeItem('subscriptionData');
    localStorage.setItem('userMobile', cleanMobile);
    return false;
  }
};
