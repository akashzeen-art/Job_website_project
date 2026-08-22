import { API_ENDPOINTS } from "@/config/env";
import { fetchApiText } from "@/utils/apiFetch";

const isValidMobile = (mobile: string): boolean =>
  Boolean(mobile && mobile.trim() !== "" && mobile !== "undefined" && mobile !== "null");

const isValidPortalId = (portalId: string | number): boolean =>
  portalId !== undefined && portalId !== null && String(portalId).trim() !== "";

export const checkSubStatus = async (
  mobile: string,
  portalId: string | number,
): Promise<boolean> => {
  if (!isValidMobile(mobile)) {
    throw new Error("Invalid mobile number");
  }
  if (!isValidPortalId(portalId)) {
    throw new Error("Invalid portalId");
  }

  const cleanMobile = mobile.trim();
  const cleanPortalId = String(portalId).trim();
  const url = API_ENDPOINTS.subStatus(cleanMobile, cleanPortalId);
  const raw = await fetchApiText(url);
  return raw.trim().toUpperCase() === "ACTIVE";
};

export const buildSubscribedRedirectUrl = (
  mobile: string,
  portalId: string | number,
  portalSuccessUrl?: string,
): string => {
  if (portalSuccessUrl) {
    return portalSuccessUrl.startsWith("http")
      ? `${portalSuccessUrl}${mobile}`
      : `https://${portalSuccessUrl}${mobile}`;
  }
  return `/?msisdn=${encodeURIComponent(mobile)}`;
};
