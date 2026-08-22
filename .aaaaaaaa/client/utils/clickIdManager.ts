/**
 * ClickID Management Utility
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_PARTIAL_REGEX = /[0-9a-f]{4,}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export const validateClickId = (clickId: string | null | undefined): boolean => {
  if (!clickId || clickId === 'null' || clickId === 'undefined' || clickId === 'NaN' || clickId.trim() === '') {
    return false;
  }
  if (UUID_REGEX.test(clickId) || UUID_PARTIAL_REGEX.test(clickId)) {
    return false;
  }
  return true;
};

export const getClickIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('clickid');
};

export const getPortalIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
};

export const getMsisdnFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('msisdn');
};

export const updateUrlWithClickId = (clickId: string, portalId: string | number) => {
  const url = new URL(window.location.href);
  url.searchParams.set('clickid', clickId);
  if (portalId) {
    url.searchParams.set('id', String(portalId));
  }
  
  window.history.replaceState({}, '', url.toString());
};

export const initializeClickId = () => {
  const portalId = getPortalIdFromUrl() || '1';
  const clickId = getClickIdFromUrl();
  return { clickId: validateClickId(clickId) ? clickId : null, portalId };
};
