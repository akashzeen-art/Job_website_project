import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { API_ENDPOINTS } from "@/config/env";
import {
  clearSubscriptionCache,
  getMobileForVerification,
  getPortalIdForVerification,
  verifyAccessWithAPI,
} from "@/utils/accessControlGuard";
import { verifyAndSyncSubscription } from "@/utils/subscriptionFlow";
import { resolvePortalId } from "@/utils/portalId";
import { getClickIdFromUrl, validateClickId } from "@/utils/clickIdManager";

export type PendingAction =
  | { type: "navigate"; to: string }
  | { type: "external"; url: string }
  | { type: "callback" };

type SubscriptionContextType = {
  isPopupOpen: boolean;
  openPopup: (pending?: PendingAction) => void;
  closePopup: () => void;
  pendingAction: PendingAction | null;
  runPendingAction: () => void;
  checkAccess: (pending?: PendingAction) => Promise<boolean>;
  handleSubscribe: (mobile: string) => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const clickSent = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        clearSubscriptionCache();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (clickSent.current) return;
    if (window.location.pathname === "/checkout") return;

    const portalId = resolvePortalId();
    const clickId = getClickIdFromUrl();
    if (!portalId || !clickId || !validateClickId(clickId)) return;

    const callKey = `${clickId}-${portalId}`;
    const tracker = (window as Window & { _apiCallTracker?: Record<string, boolean> })._apiCallTracker;
    if (tracker?.[callKey]) return;

    if (!tracker) {
      (window as Window & { _apiCallTracker?: Record<string, boolean> })._apiCallTracker = {};
    }
    (window as Window & { _apiCallTracker?: Record<string, boolean> })._apiCallTracker![callKey] = true;

    clickSent.current = true;
    fetch(API_ENDPOINTS.paymentPortal(portalId, clickId)).catch(() => undefined);
  }, []);

  const runPendingAction = useCallback(() => {
    if (!pendingAction) return;

    if (pendingAction.type === "navigate") {
      window.location.href = pendingAction.to;
    } else if (pendingAction.type === "external") {
      window.open(pendingAction.url, "_blank", "noopener,noreferrer");
    }

    setPendingAction(null);
  }, [pendingAction]);

  const openPopup = useCallback((pending?: PendingAction) => {
    if (pending) setPendingAction(pending);
    setIsPopupOpen(true);
  }, []);

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    setPendingAction(null);
  }, []);

  const checkAccess = useCallback(
    async (pending?: PendingAction) => {
      const mobile = getMobileForVerification();
      const portalId = getPortalIdForVerification();

      if (!portalId) {
        openPopup(pending);
        return false;
      }

      if (!mobile) {
        openPopup(pending);
        return false;
      }

      const hasAccess = await verifyAccessWithAPI(mobile, portalId);
      if (hasAccess) return true;

      clearSubscriptionCache();
      openPopup(pending);
      return false;
    },
    [openPopup],
  );

  const handleSubscribe = useCallback(
    async (mobile: string) => {
      const portalId = getPortalIdForVerification();
      if (!portalId) {
        setIsPopupOpen(false);
        return;
      }

      try {
        const isActive = await verifyAndSyncSubscription(mobile, portalId);
        setIsPopupOpen(false);
        if (isActive) runPendingAction();
      } catch {
        setIsPopupOpen(false);
      }
    },
    [runPendingAction],
  );

  return (
    <SubscriptionContext.Provider
      value={{
        isPopupOpen,
        openPopup,
        closePopup,
        pendingAction,
        runPendingAction,
        checkAccess,
        handleSubscribe,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
