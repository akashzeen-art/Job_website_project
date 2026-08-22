/**
 * Access Control Guard
 */

import { checkSubStatus } from '../services/userStatusApi';
import { verifyAndSyncSubscription } from './subscriptionFlow';

export const verifyAccessWithAPI = async (mobile: string, portalId: string | number) => {
  if (!mobile || mobile.trim() === '' || mobile === 'undefined' || mobile === 'null') {
    console.error('❌ BLOCKED: Status API call with invalid mobile:', mobile);
    return false;
  }

  if (!portalId) {
    console.error('❌ BLOCKED: Missing portalId');
    return false;
  }

  try {
    console.log('🔍 Verifying access via SubStatus API:', { mobile, portalId });
    const isActive = await verifyAndSyncSubscription(mobile, portalId);
    console.log('📊 SubStatus result:', { isActive });
    return isActive;
  } catch (error) {
    console.error('❌ Access denied: API verification failed', error);
    return false;
  }
};

export const clearSubscriptionCache = () => {
  localStorage.removeItem('isSubscribed');
  localStorage.removeItem('subscriptionData');
  console.log('🧹 Subscription cache cleared');
};

export const getMobileForVerification = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const msisdn = urlParams.get('msisdn');

  if (msisdn && msisdn.trim() !== '' && msisdn !== 'undefined' && msisdn !== 'null') {
    const cleanMobile = msisdn.trim();
    localStorage.setItem('userMobile', cleanMobile);
    return cleanMobile;
  }

  const storedMobile = localStorage.getItem('userMobile');
  if (storedMobile && storedMobile.trim() !== '' && storedMobile !== 'undefined' && storedMobile !== 'null') {
    return storedMobile.trim();
  }

  return null;
};

export const getPortalIdForVerification = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const fromUrl = urlParams.get('id');
  if (fromUrl && fromUrl.trim() !== '') return fromUrl.trim();

  const stored = localStorage.getItem('portalId');
  if (stored && stored.trim() !== '') return stored.trim();

  return '1';
};

export const normalizeUrlWithMobile = (mobile: string, portalId: string | number = '1') => {
  if (!mobile || mobile.trim() === '') return;

  const cleanMobile = mobile.trim();
  const currentUrl = new URL(window.location.href);

  currentUrl.searchParams.set('msisdn', cleanMobile);
  currentUrl.searchParams.set('id', portalId.toString());
  currentUrl.searchParams.delete('clickid');

  window.history.replaceState({}, '', currentUrl.toString());
  localStorage.setItem('userMobile', cleanMobile);
  localStorage.setItem('portalId', String(portalId));
};

/** Lightweight check without mutating cache (used before payment). */
export const isSubscriptionActive = checkSubStatus;
