import { useEffect, useState } from "react";
import {
  getPackTypeFromPlan,
  getPriceForPlan,
  initiatePayment,
} from "@/services/paymentApi";
import { fetchPricingData, parsePricingForUI, type ParsedPlanPricing } from "@/services/pricingApi";
import { PricingOfferCard, offerFromPrimaryPlan } from "@/components/PricingOfferCard";
import { getClickIdFromUrl, validateClickId } from "@/utils/clickIdManager";
import {
  MISSING_PORTAL_ID_MESSAGE,
  persistPortalId,
  resolvePortalId,
} from "@/utils/portalId";
import { verifyAndSyncSubscription } from "@/utils/subscriptionFlow";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mobile: string) => void;
};

export function SubscriptionModal({ isOpen, onClose, onSubmit }: Props) {
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pricingData, setPricingData] = useState<ParsedPlanPricing | null>(null);
  const [portalId, setPortalId] = useState<string | null>(null);
  const [clickId, setClickId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setStep(1);
    setMobileNumber("");
    setError("");
    setLoading(false);
    setPricingData(null);

    const currentPortalId = resolvePortalId();
    const currentClickId = getClickIdFromUrl();

    setPortalId(currentPortalId);
    setClickId(currentClickId);

    if (!currentPortalId) {
      setError(MISSING_PORTAL_ID_MESSAGE);
      return;
    }

    void loadPricingData(currentPortalId, currentClickId || "");
  }, [isOpen]);

  async function loadPricingData(nextPortalId: string, nextClickId: string) {
    setLoading(true);
    setError("");

    try {
      const apiData = await fetchPricingData(nextPortalId, nextClickId);
      const parsed = parsePricingForUI(apiData, nextPortalId);
      const resolvedPortalId = String(parsed.portalId);
      persistPortalId(resolvedPortalId);
      setPortalId(resolvedPortalId);
      setPricingData(parsed);
    } catch (loadError) {
      setPricingData(null);
      setError(
        loadError instanceof Error ? loadError.message : "Could not load pricing. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleMobileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setMobileNumber(event.target.value.replace(/\D/g, "").slice(0, 10));
    setError("");
  }

  async function handleInitialSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!portalId) {
      setError(MISSING_PORTAL_ID_MESSAGE);
      return;
    }

    if (mobileNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      const isActive = await verifyAndSyncSubscription(mobileNumber, portalId);
      if (isActive) {
        onSubmit(mobileNumber);
        return;
      }
    } catch {
      /* continue to payment */
    } finally {
      setLoading(false);
    }

    if (!validateClickId(clickId)) {
      setError("Unable to subscribe. Open the site from your campaign link.");
      return;
    }

    if (!pricingData) {
      setError("Price not loaded yet. Please try again.");
      return;
    }

    setStep(2);
  }

  async function handlePlanSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!portalId) {
      setError(MISSING_PORTAL_ID_MESSAGE);
      return;
    }

    if (!pricingData) {
      setError("Price not loaded yet. Please try again.");
      return;
    }

    if (!validateClickId(clickId)) {
      setError("Unable to subscribe. Open the site from your campaign link.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const packType = getPackTypeFromPlan(selectedPlan);
      const price = getPriceForPlan(pricingData, selectedPlan);

      initiatePayment({
        portalId: parseInt(portalId, 10),
        clickId: clickId!,
        mobile: mobileNumber,
        packType,
        price,
      });

      onSubmit(mobileNumber);
    } catch {
      setError("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:pb-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md border border-line bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-modal-title"
      >
        <div className="hairline" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center text-lg leading-none text-muted transition hover:text-text"
          aria-label="Close"
        >
          ×
        </button>

        <div className="px-5 py-6 sm:px-6 sm:py-7">
          <p className="text-center text-[10px] tracking-[0.24em] text-gold uppercase">
            Meridian · India match
          </p>

          {step === 1 ? (
            <form onSubmit={handleInitialSubmit}>
              <h3
                id="subscription-modal-title"
                className="mt-3 text-center font-display text-[1.65rem] leading-tight text-text sm:text-3xl"
              >
                Unlock matched roles
              </h3>
              <p className="mt-2 text-center text-sm leading-6 text-muted">
                Enter mobile to login or continue to payment
              </p>

              {pricingData || loading ? (
                <div className="mt-4">
                  <PricingOfferCard
                    offer={pricingData ? offerFromPrimaryPlan(pricingData.plans) : null}
                    loading={loading}
                    variant="site"
                    footer={
                      <>
                        <span className="font-medium text-text">Already subscribed?</span> Enter your
                        mobile number to login.
                      </>
                    }
                  />
                </div>
              ) : null}

              <div className="mt-5">
                <label
                  htmlFor="subscription-mobile"
                  className="block text-[11px] tracking-[0.18em] text-gold uppercase"
                >
                  Mobile number
                </label>
                <div className="mt-2 flex border border-line bg-bg">
                  <span className="flex h-12 items-center border-r border-line bg-surface-2 px-3 text-sm font-medium text-gold">
                    +91
                  </span>
                  <input
                    type="tel"
                    id="subscription-mobile"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="10-digit mobile"
                    value={mobileNumber}
                    onChange={handleMobileChange}
                    maxLength={10}
                    className="h-12 min-w-0 flex-1 bg-transparent px-3 text-base text-text outline-none placeholder:text-muted/60"
                    required
                    disabled={loading || !portalId}
                  />
                </div>
                {error ? (
                  <p className="mt-2 text-center text-sm text-wine">{error}</p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={loading || !portalId}
                className="mt-5 flex h-12 w-full items-center justify-center bg-wine text-xs tracking-[0.16em] text-text uppercase transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Checking..." : "Continue"}
              </button>
            </form>
          ) : null}

          {step === 2 ? (
            <form onSubmit={handlePlanSubmit}>
              <p className="mt-2 text-center text-sm text-muted">
                Mobile · <span className="text-text">{mobileNumber}</span>
              </p>
              <h3 className="mt-3 text-center font-display text-[1.65rem] leading-tight text-text sm:text-3xl">
                Select plan
              </h3>

              <div className="mt-4 space-y-2">
                {pricingData?.plans.weekly ? (
                  <PlanOption
                    name="weekly"
                    label="Weekly"
                    selected={selectedPlan === "weekly"}
                    discountedPrice={pricingData.plans.weekly.discountedPrice}
                    originalPrice={pricingData.plans.weekly.originalPrice}
                    discount={pricingData.plans.weekly.discount}
                    discountPercent={pricingData.plans.weekly.discountPercent}
                    savings={pricingData.plans.weekly.savings}
                    durationLabel={pricingData.plans.weekly.durationLabel}
                    disabled={loading}
                    onSelect={setSelectedPlan}
                  />
                ) : null}

                {pricingData?.plans.monthly ? (
                  <PlanOption
                    name="monthly"
                    label="Monthly"
                    selected={selectedPlan === "monthly"}
                    discountedPrice={pricingData.plans.monthly.discountedPrice}
                    originalPrice={pricingData.plans.monthly.originalPrice}
                    discount={pricingData.plans.monthly.discount}
                    discountPercent={pricingData.plans.monthly.discountPercent}
                    savings={pricingData.plans.monthly.savings}
                    durationLabel={pricingData.plans.monthly.durationLabel}
                    disabled={loading}
                    onSelect={setSelectedPlan}
                  />
                ) : null}
              </div>

              {error ? <p className="mt-3 text-center text-sm text-wine">{error}</p> : null}

              <button
                type="submit"
                disabled={loading || !pricingData || !portalId}
                className="mt-5 flex h-12 w-full items-center justify-center bg-wine text-xs tracking-[0.16em] text-text uppercase transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Pay now"}
              </button>
            </form>
          ) : null}
        </div>

        <div className="hairline" />
      </div>
    </div>
  );
}

function PlanOption({
  name,
  label,
  selected,
  discountedPrice,
  originalPrice,
  discount,
  discountPercent,
  savings,
  durationLabel,
  disabled,
  onSelect,
}: {
  name: string;
  label: string;
  selected: boolean;
  discountedPrice: number;
  originalPrice: number;
  discount: string;
  discountPercent: number;
  savings: number;
  durationLabel: string;
  disabled?: boolean;
  onSelect: (plan: string) => void;
}) {
  return (
    <label
      className={`card-hover block cursor-pointer border bg-surface p-4 transition ${
        selected ? "border-gold bg-surface-2" : "border-line"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          name="plan"
          value={name}
          checked={selected}
          onChange={() => onSelect(name)}
          disabled={disabled}
          className="mt-1 accent-[var(--color-gold)]"
        />
        <div className="min-w-0 flex-1">
          <span className="text-sm tracking-[0.12em] text-text uppercase">{label}</span>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-display text-3xl text-gold">₹{discountedPrice}</span>
            <span className="text-sm text-muted line-through">₹{originalPrice}</span>
            <span className="text-[11px] tracking-[0.14em] text-gold uppercase">{discount}</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {durationLabel} · Save ₹{savings} ({discountPercent}% off)
          </p>
        </div>
      </div>
    </label>
  );
}
