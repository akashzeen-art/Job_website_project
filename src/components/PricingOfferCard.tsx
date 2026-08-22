import type { ReactNode } from "react";
import type { ParsedPlanPricing, PortalPricing } from "@/services/pricingApi";

type OfferLike = {
  price?: number;
  discountedPrice?: number;
  originalPrice: number;
  discountLabel?: string;
  discount?: string;
  discountPercent?: number;
  savings?: number;
  durationLabel?: string;
};

type Props = {
  offer: OfferLike | null;
  loading?: boolean;
  variant?: "site" | "checkout";
  footer?: ReactNode;
};

export function PricingOfferCard({ offer, loading = false, variant = "site", footer }: Props) {
  const price = offer?.price ?? offer?.discountedPrice ?? null;
  const discountLabel = offer?.discountLabel ?? offer?.discount ?? null;
  const discountPercent = offer?.discountPercent ?? (price ? 50 : null);

  if (variant === "checkout") {
    return (
      <div className="relative shrink-0 rounded-xl border-2 border-[#86efac] bg-white px-4 pb-4 pt-6 text-center">
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#16a34a] px-3 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
          {loading ? "..." : discountLabel ?? "50% OFF"}
        </span>
        {loading || !offer || price === null ? (
          <p className="py-4 text-sm text-[#64748b]">Loading price...</p>
        ) : (
          <>
            <p className="text-sm text-[#94a3b8] line-through">₹{offer.originalPrice}</p>
            <p className="mt-0.5 text-[1.65rem] font-bold leading-none text-[#16a34a]">
              ₹{price}{" "}
              {offer.durationLabel ? (
                <span className="text-[1.1rem] font-semibold">({offer.durationLabel})</span>
              ) : null}
            </p>
            {offer.savings ? (
              <p className="mt-2 text-[11px] font-medium text-[#16a34a]">
                You save ₹{offer.savings} ({discountPercent}% off)
              </p>
            ) : null}
          </>
        )}
        {footer ? <div className="mt-3 text-[12px] text-[#64748b]">{footer}</div> : null}
      </div>
    );
  }

  return (
    <div className="relative border border-line bg-bg/60 px-4 pb-4 pt-6 text-center">
      <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 border border-gold bg-surface px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-gold uppercase">
        {loading ? "..." : discountLabel ?? "50% OFF"}
      </span>
      {loading || !offer || price === null ? (
        <p className="py-4 text-sm text-muted">Loading price...</p>
      ) : (
        <>
          <p className="text-sm text-muted line-through">₹{offer.originalPrice}</p>
          <p className="mt-1 font-display text-[2rem] leading-none text-gold">
            ₹{price}
            {offer.durationLabel ? (
              <span className="ml-1 text-base font-normal text-muted">({offer.durationLabel})</span>
            ) : null}
          </p>
          {offer.savings ? (
            <p className="mt-2 text-[11px] tracking-[0.12em] text-gold uppercase">
              Save ₹{offer.savings} · {discountPercent}% off
            </p>
          ) : null}
        </>
      )}
      {footer ? <div className="mt-3 text-sm text-muted">{footer}</div> : null}
    </div>
  );
}

export function offerFromPortalPricing(pricing: PortalPricing): OfferLike {
  return {
    price: pricing.price,
    originalPrice: pricing.originalPrice,
    discountLabel: pricing.discountLabel,
    discountPercent: pricing.discountPercent,
    savings: pricing.savings,
    durationLabel: pricing.durationLabel,
  };
}

export function offerFromPrimaryPlan(plans: ParsedPlanPricing["plans"]): OfferLike | null {
  const preferred = ["monthly", "weekly", "daily"];
  for (const key of preferred) {
    const plan = plans[key];
    if (plan) {
      return {
        discountedPrice: plan.discountedPrice,
        originalPrice: plan.originalPrice,
        discount: plan.discount,
        discountPercent: plan.discountPercent,
        savings: plan.savings,
        durationLabel: plan.durationLabel,
      };
    }
  }
  const firstKey = Object.keys(plans)[0];
  const plan = firstKey ? plans[firstKey] : null;
  if (!plan) return null;
  return {
    discountedPrice: plan.discountedPrice,
    originalPrice: plan.originalPrice,
    discount: plan.discount,
    discountPercent: plan.discountPercent,
    savings: plan.savings,
    durationLabel: plan.durationLabel,
  };
}
