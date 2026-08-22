import { API_ENDPOINTS } from "@/config/env";

export const submitSubscription = async (subscriptionData: {
  portalId: number;
  clickId: string;
  mobile: string;
}) => {
  const payload = {
    portalId: parseInt(String(subscriptionData.portalId), 10),
    clickId: subscriptionData.clickId,
    mobile: subscriptionData.mobile,
  };

  const response = await fetch(API_ENDPOINTS.subscriptionSubmit(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Subscription submission failed: ${response.status}`);
  }

  return response.json();
};

export const validateMobileNumber = (mobile: string): boolean => {
  if (!mobile || typeof mobile !== "string") return false;
  const cleaned = mobile.replace(/\D/g, "");
  return cleaned.length === 10 && /^[6-9]/.test(cleaned);
};

export const formatMobileNumber = (mobile: string): string => mobile.replace(/\D/g, "");
