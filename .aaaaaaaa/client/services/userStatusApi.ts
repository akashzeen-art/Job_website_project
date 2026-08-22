/**
 * Subscription status via GET /api/payment/subStatus
 *
 * Request:  ?mobile={mobile}&portalId={portalId}
 * Response: plain text "ACTIVE" | "INACTIVE" (not JSON)
 */

import { API_ENDPOINTS } from '@/config/env';
import { fetchApiText } from '@/utils/apiFetch';

const isValidMobile = (mobile: string): boolean =>
  Boolean(mobile && mobile.trim() !== '' && mobile !== 'undefined' && mobile !== 'null');

const isValidPortalId = (portalId: string | number): boolean =>
  portalId !== undefined && portalId !== null && String(portalId).trim() !== '';

/**
 * GET https://globalyogas.com/api/payment/subStatus?mobile=...&portalId=...
 *
 * Reads plain text body.
 * Returns true only when trimmed uppercase text === "ACTIVE".
 * Returns false for "INACTIVE" (or any other non-ACTIVE body).
 */
export const checkSubStatus = async (
  mobile: string,
  portalId: string | number,
): Promise<boolean> => {
  if (!isValidMobile(mobile)) {
    throw new Error('Invalid mobile number');
  }
  if (!isValidPortalId(portalId)) {
    throw new Error('Invalid portalId');
  }

  const cleanMobile = mobile.trim();
  const cleanPortalId = String(portalId).trim();
  const url = API_ENDPOINTS.subStatus(cleanMobile, cleanPortalId);

  console.log('🔍 SubStatus:', url);

  const raw = await fetchApiText(url);
  const status = raw.trim().toUpperCase();
  const isActive = status === 'ACTIVE';

  console.log('✅ SubStatus:', status, '→', isActive ? 'subscribed' : 'not subscribed');

  return isActive;
};

export const buildSubscribedRedirectUrl = (
  mobile: string,
  portalId: string | number,
  portalSuccessUrl?: string,
): string => {
  if (portalSuccessUrl) {
    return portalSuccessUrl.startsWith('http')
      ? `${portalSuccessUrl}${mobile}`
      : `https://${portalSuccessUrl}${mobile}`;
  }
  return `/?msisdn=${encodeURIComponent(mobile)}&id=${encodeURIComponent(String(portalId))}`;
};
