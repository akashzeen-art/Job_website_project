import { checkSubStatus, buildSubscribedRedirectUrl } from "@/services/userStatusApi";
import { persistActiveSubscription } from "@/utils/subscriptionFlow";
import { isValidPortalId } from "@/utils/portalId";

export const handleLoginSuccess = async (mobile: string, portalId: string | number | null) => {
  if (!mobile || mobile.trim() === "") return false;
  if (!isValidPortalId(portalId)) return false;

  const cleanMobile = mobile.trim();

  try {
    const isActive = await checkSubStatus(cleanMobile, portalId);

    if (isActive) {
      persistActiveSubscription(cleanMobile, portalId);
      const redirectUrl = buildSubscribedRedirectUrl(cleanMobile, portalId);
      window.location.href = redirectUrl;
      return true;
    }

    localStorage.removeItem("isSubscribed");
    localStorage.removeItem("subscriptionData");
    localStorage.setItem("userMobile", cleanMobile);
    return false;
  } catch {
    localStorage.removeItem("isSubscribed");
    localStorage.removeItem("subscriptionData");
    localStorage.setItem("userMobile", cleanMobile);
    return false;
  }
};
