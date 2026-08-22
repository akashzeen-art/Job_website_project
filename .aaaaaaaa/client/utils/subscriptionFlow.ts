/**
 * Shared subscription state + access checks used by checkout and main app flow.
 */

import { checkSubStatus, buildSubscribedRedirectUrl } from '@/services/userStatusApi';

export const persistActiveSubscription = (mobile: string, portalId: string | number) => {
  const cleanMobile = mobile.trim();
  localStorage.setItem('isSubscribed', 'true');
  localStorage.setItem('userMobile', cleanMobile);
  localStorage.setItem('portalId', String(portalId));
  localStorage.setItem(
    'subscriptionData',
    JSON.stringify({ active: true, mobile: cleanMobile, portalId }),
  );
};

export const clearActiveSubscription = () => {
  localStorage.removeItem('isSubscribed');
  localStorage.removeItem('subscriptionData');
};

export const getStoredMobile = (): string | null => {
  const fromUrl = new URLSearchParams(window.location.search).get('msisdn');
  if (fromUrl && fromUrl.trim() !== '' && fromUrl !== 'undefined' && fromUrl !== 'null') {
    return fromUrl.trim();
  }

  const stored = localStorage.getItem('userMobile');
  if (stored && stored.trim() !== '' && stored !== 'undefined' && stored !== 'null') {
    return stored.trim();
  }

  return null;
};

export const getStoredPortalId = (): string => {
  const fromUrl = new URLSearchParams(window.location.search).get('id');
  if (fromUrl && fromUrl.trim() !== '') return fromUrl.trim();

  const stored = localStorage.getItem('portalId');
  if (stored && stored.trim() !== '') return stored.trim();

  return '1';
};

/**
 * Calls subStatus API and syncs local subscription cache.
 */
export const verifyAndSyncSubscription = async (
  mobile: string,
  portalId: string | number,
): Promise<boolean> => {
  const isActive = await checkSubStatus(mobile, portalId);

  if (isActive) {
    persistActiveSubscription(mobile, portalId);
    return true;
  }

  clearActiveSubscription();
  localStorage.setItem('userMobile', mobile.trim());
  return false;
};

export const redirectIfSubscribed = (
  mobile: string,
  portalId: string | number,
  clickId?: string | null,
) => {
  const base = buildSubscribedRedirectUrl(mobile, portalId);
  if (!clickId) return base;

  const url = new URL(base, window.location.origin);
  url.searchParams.set('clickid', clickId);
  return url.pathname + url.search;
};
