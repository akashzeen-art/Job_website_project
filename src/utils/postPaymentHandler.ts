import { verifyAndSyncSubscription } from "@/utils/subscriptionFlow";

export const handlePostPaymentFlow = async (msisdn: string, portalId: string | number) => {
  try {
    return await verifyAndSyncSubscription(msisdn, portalId);
  } catch {
    localStorage.removeItem("isSubscribed");
    localStorage.removeItem("userMobile");
    localStorage.removeItem("subscriptionData");
    return false;
  }
};

export const cleanPostPaymentUrl = () => {
  const url = new URL(window.location.href);
  const clickid = url.searchParams.get("clickid");

  if (url.searchParams.has("msisdn") || url.searchParams.has("id")) {
    url.searchParams.delete("msisdn");
    url.searchParams.delete("id");
    if (clickid) url.searchParams.set("clickid", clickid);
    window.history.replaceState({}, "", url.toString());
  }
};
