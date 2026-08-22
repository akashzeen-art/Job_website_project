import { API_ENDPOINTS } from "@/config/env";
import { isValidPortalId, requirePortalId } from "@/utils/portalId";

export const DISCOUNT_RATE = 0.5;

export type DiscountOffer = {
  price: number;
  originalPrice: number;
  discountLabel: string;
  discountPercent: number;
  savings: number;
};

export type PortalPricing = {
  portalId: string;
  currencyCode: string;
  packType: string;
  price: number;
  originalPrice: number;
  discountLabel: string;
  discountPercent: number;
  savings: number;
  durationLabel: string;
};

export type ParsedPlanPricing = {
  portalId: number;
  currencyCode: string;
  plans: Record<
    string,
    {
      packType: string;
      discountedPrice: number;
      originalPrice: number;
      discount: string;
      discountPercent: number;
      savings: number;
      durationLabel: string;
    }
  >;
};

export const calculateOriginalPrice = (discountedPrice: number) =>
  Math.round(discountedPrice / (1 - DISCOUNT_RATE));

export const calculateDiscountPercent = (discountedPrice: number, originalPrice: number) =>
  Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

export const calculateDiscount = (discountedPrice: number, originalPrice: number) => {
  const discount = calculateDiscountPercent(discountedPrice, originalPrice);
  return `${discount}% OFF`;
};

export const buildDiscountOffer = (discountedPrice: number): DiscountOffer => {
  const originalPrice = calculateOriginalPrice(discountedPrice);
  const savings = originalPrice - discountedPrice;
  return {
    price: discountedPrice,
    originalPrice,
    discountLabel: calculateDiscount(discountedPrice, originalPrice),
    discountPercent: calculateDiscountPercent(discountedPrice, originalPrice),
    savings,
  };
};

const packDurationLabel = (packType: string): string => {
  const key = packType.toUpperCase();
  if (key.includes("90") || key === "QUARTERLY") return "90 days";
  if (key === "WEEKLY") return "7 days";
  if (key === "MONTHLY") return "30 days";
  if (key === "DAILY") return "1 day";
  return packType.replace(/_/g, " ").toLowerCase();
};

const planKeyFromPackType = (packType: string): string => {
  const key = packType.toUpperCase();
  if (key === "WEEKLY") return "weekly";
  if (key === "MONTHLY") return "monthly";
  if (key === "DAILY") return "daily";
  return packType.toLowerCase().replace(/\s+/g, "_");
};

const buildPlanEntry = (packType: string, discountedPrice: number) => {
  const offer = buildDiscountOffer(discountedPrice);
  return {
    packType,
    discountedPrice: offer.price,
    originalPrice: offer.originalPrice,
    discount: offer.discountLabel,
    discountPercent: offer.discountPercent,
    savings: offer.savings,
    durationLabel: packDurationLabel(packType),
  };
};

export const getPrimaryPlan = (plans: ParsedPlanPricing["plans"]) => {
  const preferred = ["monthly", "weekly", "daily"];
  for (const key of preferred) {
    if (plans[key]) return plans[key];
  }
  const firstKey = Object.keys(plans)[0];
  return firstKey ? plans[firstKey] : null;
};

const resolvePortalIdFromResponse = (
  apiData: Record<string, unknown>,
  requestPortalId?: string | null,
): string => {
  const fromApi = apiData.portalId;
  if (isValidPortalId(fromApi as string | number)) return String(fromApi).trim();
  if (isValidPortalId(requestPortalId)) return String(requestPortalId).trim();
  throw new Error("Missing portal id in pricing response");
};

export const resolvePriceFromAPI = (apiResponse: Record<string, unknown>) => {
  const multiplePackType = apiResponse.multiplePackType;
  if (multiplePackType && typeof multiplePackType === "object") {
    const keys = Object.keys(multiplePackType as Record<string, unknown>);
    if (keys.length > 0) {
      const packType = keys[0];
      const value = (multiplePackType as Record<string, unknown>)[packType];
      if (packType && value !== null && value !== undefined && value !== "") {
        const numValue = Number(value);
        if (!Number.isNaN(numValue) && Number.isFinite(numValue)) {
          return { packType, price: numValue };
        }
      }
    }
  }

  if (
    apiResponse.packType &&
    apiResponse.price !== null &&
    apiResponse.price !== undefined &&
    apiResponse.price !== ""
  ) {
    const numValue = Number(apiResponse.price);
    if (!Number.isNaN(numValue) && Number.isFinite(numValue)) {
      return { packType: String(apiResponse.packType), price: numValue };
    }
  }

  return null;
};

export const fetchPricingData = async (portalId: string | number, clickId: string) => {
  if (!isValidPortalId(portalId)) {
    throw new Error("Missing portal id for pricing request");
  }

  const response = await fetch(API_ENDPOINTS.paymentPortal(portalId, clickId), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};

export const fetchPortalPricing = async (
  portalId: string | null,
  clickId: string,
): Promise<PortalPricing> => {
  const resolvedPortalId = portalId ?? requirePortalId();
  const apiData = await fetchPricingData(resolvedPortalId, clickId);
  const resolved = resolvePriceFromAPI(apiData);

  if (!resolved) {
    throw new Error("Price unavailable from portal API");
  }

  const portalFromApi = resolvePortalIdFromResponse(apiData, resolvedPortalId);
  const offer = buildDiscountOffer(resolved.price);

  return {
    portalId: portalFromApi,
    currencyCode: String(apiData.currencyCode ?? "INR"),
    packType: resolved.packType,
    price: offer.price,
    originalPrice: offer.originalPrice,
    discountLabel: offer.discountLabel,
    discountPercent: offer.discountPercent,
    savings: offer.savings,
    durationLabel: packDurationLabel(resolved.packType),
  };
};

export const parsePricingForUI = (
  apiData: Record<string, unknown>,
  requestPortalId?: string | null,
): ParsedPlanPricing => {
  const portalId = resolvePortalIdFromResponse(apiData, requestPortalId);
  const multiplePackType = apiData.multiplePackType as Record<string, string> | undefined;
  const plans: ParsedPlanPricing["plans"] = {};

  if (multiplePackType && typeof multiplePackType === "object") {
    for (const [packType, rawValue] of Object.entries(multiplePackType)) {
      if (rawValue === null || rawValue === undefined || rawValue === "") continue;
      const discountedPrice = parseInt(String(rawValue), 10);
      if (Number.isNaN(discountedPrice) || !Number.isFinite(discountedPrice)) continue;
      plans[planKeyFromPackType(packType)] = buildPlanEntry(packType, discountedPrice);
    }
  }

  if (Object.keys(plans).length === 0) {
    const resolved = resolvePriceFromAPI(apiData);
    if (resolved) {
      plans[planKeyFromPackType(resolved.packType)] = buildPlanEntry(resolved.packType, resolved.price);
    }
  }

  if (Object.keys(plans).length === 0) {
    throw new Error("No pricing plans returned from portal API");
  }

  return {
    portalId: Number(portalId),
    currencyCode: String(apiData.currencyCode ?? "INR"),
    plans,
  };
};
