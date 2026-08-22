import { API_ENDPOINTS } from '@/config/env';
import {
  getMobileForVerification,
  getPortalIdForVerification,
} from '@/utils/accessControlGuard';

export interface UserEventPayload {
  mobile: string;
  portalId: number;
  event: string;
}

export const buildWatchEventName = (title: string, minutes: number): string => {
  const cleanTitle = title.trim();
  if (minutes <= 0) return cleanTitle;
  return `${cleanTitle} ${minutes} min`;
};

export const sendUserEvent = async (event: string): Promise<void> => {
  const mobile = getMobileForVerification();
  const portalId = getPortalIdForVerification();
  const trimmedEvent = event.trim();

  if (!mobile || !trimmedEvent) return;

  const payload: UserEventPayload = {
    mobile,
    portalId: Number(portalId) || 1,
    event: trimmedEvent,
  };

  try {
    await fetch(API_ENDPOINTS.userEvent(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    /* fire-and-forget analytics */
  }
};

export const trackVideoWatchMinute = (title: string, minutes: number): void => {
  if (minutes <= 0) return;
  void sendUserEvent(buildWatchEventName(title, minutes));
};
