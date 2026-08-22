import { verifyAndSyncSubscription } from "@/utils/subscriptionFlow";
import { resolvePortalId } from "@/utils/portalId";

export const verifyAccessWithAPI = async (mobile: string, portalId: string | number | null) => {
  if (!mobile || mobile.trim() === "" || mobile === "undefined" || mobile === "null") {
    return false;
  }
  if (!portalId) return false;

  try {
    return await verifyAndSyncSubscription(mobile, portalId);
  } catch {
    return false;
  }
};

export const clearSubscriptionCache = () => {
  localStorage.removeItem("isSubscribed");
  localStorage.removeItem("subscriptionData");
};

export const getMobileForVerification = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const msisdn = urlParams.get("msisdn");

  if (msisdn && msisdn.trim() !== "" && msisdn !== "undefined" && msisdn !== "null") {
    const cleanMobile = msisdn.trim();
    localStorage.setItem("userMobile", cleanMobile);
    return cleanMobile;
  }

  const storedMobile = localStorage.getItem("userMobile");
  if (storedMobile && storedMobile.trim() !== "" && storedMobile !== "undefined" && storedMobile !== "null") {
    return storedMobile.trim();
  }

  return null;
};

export const getPortalIdForVerification = (): string | null => resolvePortalId();

export const normalizeUrlWithMobile = (mobile: string, portalId: string | number) => {
  if (!mobile || mobile.trim() === "") return;
  if (!portalId) return;

  const cleanMobile = mobile.trim();
  const currentUrl = new URL(window.location.href);

  currentUrl.searchParams.set("msisdn", cleanMobile);
  currentUrl.searchParams.delete("clickid");

  window.history.replaceState({}, "", currentUrl.toString());
  localStorage.setItem("userMobile", cleanMobile);
  localStorage.setItem("portalId", String(portalId));
};

export { checkSubStatus as isSubscriptionActive } from "@/services/userStatusApi";
