const trimBase = (value: string | undefined): string =>
  (value ?? '').trim().replace(/\/$/, '');

export const API_ORIGIN = 'https://globalyogas.com';

const resolveApiBaseUrl = (): string => {
  const fromEnv = trimBase(import.meta.env.VITE_API_BASE_URL);
  return fromEnv || API_ORIGIN;
};

export const apiUrl = (path: string): string => {
  const base = resolveApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
};

export const API_ENDPOINTS = {
  get paymentInitiate() {
    return apiUrl('/api/payment/initiate');
  },
  paymentStatus: (txnId: string) =>
    apiUrl(`/api/payment/status?txnId=${encodeURIComponent(txnId)}`),
  /** Plain text ACTIVE | INACTIVE */
  subStatus: (mobile: string, portalId: string | number) =>
    apiUrl(
      `/api/payment/subStatus?mobile=${encodeURIComponent(mobile)}&portalId=${encodeURIComponent(String(portalId))}`,
    ),
  paymentPortal: (portalId: string | number, clickId: string) =>
    apiUrl(`/api/payment/portal/${portalId}?clickid=${encodeURIComponent(clickId)}`),
  subscriptionSubmit: () => apiUrl('/api/subscription/submit'),
  userEvent: () => apiUrl('/api/payment/userevent'),
};
