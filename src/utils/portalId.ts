import { getPortalIdFromUrl } from "@/utils/clickIdManager";

const INVALID = new Set(["undefined", "null", "NaN", ""]);

export const isValidPortalId = (value: string | number | null | undefined): value is string | number => {
  if (value === undefined || value === null) return false;
  const clean = String(value).trim();
  return clean.length > 0 && !INVALID.has(clean);
};

/** URL `id` param, then localStorage — never a hardcoded default. */
export const resolvePortalId = (): string | null => {
  const fromUrl = getPortalIdFromUrl();
  if (isValidPortalId(fromUrl)) return String(fromUrl).trim();

  const stored = localStorage.getItem("portalId");
  if (isValidPortalId(stored)) return stored.trim();

  return null;
};

/** Save portal id for API calls only — does not modify the browser URL. */
export const persistPortalId = (portalId: string | number) => {
  if (!isValidPortalId(portalId)) return;
  localStorage.setItem("portalId", String(portalId).trim());
};

export const requirePortalId = (): string => {
  const portalId = resolvePortalId();
  if (!portalId) {
    throw new Error("Missing portal id. Open the site with ?id=YOUR_PORTAL_ID in the URL.");
  }
  return portalId;
};

export const MISSING_PORTAL_ID_MESSAGE =
  "Portal id is missing. Please open this page from your campaign link with ?id= in the URL.";
