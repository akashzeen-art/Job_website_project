import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useJobs } from "@/context/JobsContext";
import { initiatePayment } from "@/services/paymentApi";
import { fetchPortalPricing, type PortalPricing } from "@/services/pricingApi";
import { PricingOfferCard, offerFromPortalPricing } from "@/components/PricingOfferCard";
import { inferKind, type JobKind } from "@/lib/catalog";
import type { Job } from "@/lib/types";
import { getClickIdFromUrl, getMsisdnFromUrl, validateClickId } from "@/utils/clickIdManager";
import { handlePostPaymentFlow, cleanPostPaymentUrl } from "@/utils/postPaymentHandler";
import { MISSING_PORTAL_ID_MESSAGE, persistPortalId, resolvePortalId } from "@/utils/portalId";
import { redirectIfSubscribed, verifyAndSyncSubscription } from "@/utils/subscriptionFlow";
import { isSubscriptionActive } from "@/utils/accessControlGuard";

type JobPref = "typing" | "chat" | "phone" | "any";
type Experience = "none" | "under1" | "1to3";
type Hours = "part" | "full" | "flex";

const JOB_OPTIONS: {
  id: JobPref;
  label: string;
  icon: string;
  kinds: JobKind[];
}[] = [
  { id: "typing", label: "Typing & data tasks", icon: "⌨️", kinds: ["typing", "dataentry", "excel", "survey"] },
  { id: "chat", label: "Chat & content support", icon: "💬", kinds: ["wfh", "content", "freelance"] },
  { id: "phone", label: "Phone & helper roles", icon: "📱", kinds: ["wfh", "fresher", "freelance", "survey"] },
  {
    id: "any",
    label: "Any simple India role",
    icon: "★",
    kinds: ["survey", "dataentry", "typing", "wfh", "fresher", "freelance", "content", "excel"],
  },
];

const EXPERIENCE_OPTIONS: { id: Experience; label: string }[] = [
  { id: "none", label: "No experience — fresher welcome" },
  { id: "under1", label: "Less than 1 year" },
  { id: "1to3", label: "1–3 years experience" },
];

const HOURS_OPTIONS: { id: Hours; label: string }[] = [
  { id: "part", label: "1–3 hours / day (part-time)" },
  { id: "full", label: "4–8 hours / day (full-time)" },
  { id: "flex", label: "Flexible / weekends" },
];

function matchesExperience(job: Job, experience: Experience | null): boolean {
  if (!experience) return true;
  const blob = `${job.title} ${job.department} ${job.stream ?? ""}`.toLowerCase();
  const isFresher =
    /\b(fresher|trainee|graduate|12th|entry.?level|apprentice)\b/.test(blob) || job.kind === "fresher";
  if (experience === "none") {
    return isFresher || ["survey", "dataentry", "typing", "wfh"].includes(job.kind ?? "");
  }
  if (experience === "under1") return !/\b(senior|lead|manager|staff|principal)\b/.test(blob);
  return !isFresher || ["excel", "content", "freelance", "wfh"].includes(job.kind ?? "");
}

function matchesHours(job: Job, hours: Hours | null): boolean {
  if (!hours) return true;
  const blob = `${job.title} ${job.workplaceType ?? ""} ${job.city}`.toLowerCase();
  const remote =
    /\b(remote|wfh|work from home|freelance|part.?time)\b/.test(blob) || job.city === "Remote India";
  if (hours === "part") return remote || /\b(part.?time|survey|microtask|flexible)\b/.test(blob);
  if (hours === "flex") {
    return remote || job.kind === "freelance" || job.kind === "wfh" || job.kind === "survey";
  }
  return !/\bpart.?time\b/.test(blob);
}

function filterMatches(
  jobs: Job[],
  jobPref: JobPref | null,
  experience: Experience | null,
  hours: Hours | null,
): Job[] {
  const option = JOB_OPTIONS.find((item) => item.id === jobPref);
  const kinds = new Set(option?.kinds ?? []);
  const out: Job[] = [];
  for (const job of jobs) {
    const kind = job.kind ?? inferKind(job);
    if (jobPref && !kinds.has(kind)) continue;
    if (!matchesExperience(job, experience)) continue;
    if (!matchesHours(job, hours)) continue;
    out.push(job);
  }
  return out;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { jobs } = useJobs();
  const [step, setStep] = useState(1);
  const [jobPref, setJobPref] = useState<JobPref | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [hours, setHours] = useState<Hours | null>(null);
  const [mobile, setMobile] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [payError, setPayError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PortalPricing | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [portalId, setPortalId] = useState<string | null>(null);
  const [clickId, setClickId] = useState<string | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  useEffect(() => {
    const id = resolvePortalId();
    const click = getClickIdFromUrl();
    setPortalId(id);
    setClickId(click);
    if (id) persistPortalId(id);
  }, []);

  useEffect(() => {
    const msisdn = getMsisdnFromUrl();
    if (!msisdn || !portalId) return;

    setMobile(msisdn.replace(/\D/g, "").slice(-10));
    handlePostPaymentFlow(msisdn, portalId).then((isActive) => {
      cleanPostPaymentUrl();
      if (!isActive) return;
      const option = JOB_OPTIONS.find((item) => item.id === jobPref);
      const kind = option?.kinds[0] ?? "typing";
      const params = new URLSearchParams();
      params.set("kind", kind);
      if (experience === "none") params.set("stream", "Any Graduate");
      navigate(`/?${params.toString()}`);
    });
  }, [portalId, jobPref, experience, navigate]);

  useEffect(() => {
    if (step !== 4) return;
    if (!portalId) {
      setPayError(MISSING_PORTAL_ID_MESSAGE);
      setPriceLoading(false);
      setPricing(null);
      return;
    }

    let alive = true;
    setPriceLoading(true);
    setPayError(null);

    fetchPortalPricing(portalId, clickId || "")
      .then((data) => {
        if (!alive) return;
        setPricing(data);
        setPortalId(data.portalId);
        persistPortalId(data.portalId);
      })
      .catch((error) => {
        if (!alive) return;
        setPricing(null);
        setPayError(error instanceof Error ? error.message : "Could not load price. Please try again.");
      })
      .finally(() => {
        if (alive) setPriceLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [step, portalId, clickId]);

  const matched = useMemo(
    () => filterMatches(jobs, jobPref, experience, hours),
    [jobs, jobPref, experience, hours],
  );

  const stepPreviewCount = useMemo(() => {
    if (step === 1) return jobPref ? filterMatches(jobs, jobPref, null, null).length : jobs.length;
    if (step === 2) return filterMatches(jobs, jobPref, experience, null).length;
    if (step === 3) return filterMatches(jobs, jobPref, experience, hours).length;
    return matched.length;
  }, [jobs, jobPref, experience, hours, matched.length, step]);

  const progress = (step / 4) * 100;
  const mobileValid = /^[6-9]\d{9}$/.test(mobile);

  function pickJob(id: JobPref) {
    setJobPref(id);
    setStep(2);
  }

  function pickExperience(id: Experience) {
    setExperience(id);
    setStep(3);
  }

  function pickHours(id: Hours) {
    setHours(id);
    setPayError(null);
    setStep(4);
  }

  async function onPay() {
    setPayError(null);

    if (!mobileValid) {
      setPayError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!agreed) {
      setPayError("Please agree to the terms to continue.");
      return;
    }
    if (!portalId) {
      setPayError(MISSING_PORTAL_ID_MESSAGE);
      return;
    }
    if (!pricing) {
      setPayError("Price is still loading. Please wait.");
      return;
    }

    setPaying(true);

    try {
      const isActive = await isSubscriptionActive(mobile, portalId);
      if (isActive) {
        await verifyAndSyncSubscription(mobile, portalId);
        window.location.href = redirectIfSubscribed(mobile, portalId, clickId);
        return;
      }
    } catch {
      setPaying(false);
      setPayError("Could not verify subscription status. Please try again.");
      return;
    }

    if (!validateClickId(clickId)) {
      setPaying(false);
      setPayError("Unable to subscribe. ");
      return;
    }

    try {
      sessionStorage.setItem(
        "meridian:checkout",
        JSON.stringify({
          mobile: `+91${mobile}`,
          jobPref,
          experience,
          hours,
          matched: matched.length,
          at: Date.now(),
        }),
      );
    } catch {
      /* ignore */
    }

    initiatePayment({
      portalId: parseInt(portalId, 10),
      clickId: clickId!,
      mobile,
      packType: pricing.packType,
      price: pricing.price,
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex h-dvh max-h-dvh flex-col overflow-hidden bg-white text-[#0f172a]">
      <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 py-3 sm:py-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <header className="shrink-0 text-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f0ff] px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-[#1d4ed8]">
              ✓ MERIDIAN INDIA MATCH
            </span>
            <h1 className="mt-2 text-[1.35rem] font-bold leading-tight tracking-[-0.02em] text-[#0b1220] sm:text-[1.5rem]">
              Find India roles that fit your desk
            </h1>
            <p className="mt-1 text-[12px] text-[#64748b]">Step {step}/4</p>
          </header>

          {step < 4 ? (
            <>
              <div className="relative mt-3 flex shrink-0 items-center bg-[#16a34a] px-3 py-2 text-white">
                <p className="pr-14 text-[11px] font-bold tracking-[0.02em] sm:text-xs">
                  Typical starter range ₹350–₹600 / hour
                </p>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-[#14532d] px-1.5 py-0.5 text-[9px] font-bold uppercase">
                  India
                </span>
              </div>
              <div className="h-1 shrink-0 bg-[#e2e8f0]">
                <div
                  className="h-full bg-[#38bdf8] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="shrink-0 border-b border-[#eef2f7] bg-[#f8fafc] px-3 py-1.5 text-center text-[11px] text-[#475569]">
                <strong className="text-[#0f172a]">{stepPreviewCount.toLocaleString("en-IN")}</strong> roles in
                range
              </div>
            </>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-3">
            {step === 1 ? (
              <StepBlock title="1. What kind of work do you want?">
                <div className="grid min-h-0 flex-1 content-start gap-2">
                  {JOB_OPTIONS.map((option) => (
                    <OptionCard
                      key={option.id}
                      icon={option.icon}
                      label={option.label}
                      meta={`${filterMatches(jobs, option.id, null, null).length.toLocaleString("en-IN")} roles`}
                      active={jobPref === option.id}
                      onClick={() => pickJob(option.id)}
                    />
                  ))}
                </div>
              </StepBlock>
            ) : null}

            {step === 2 ? (
              <StepBlock title="2. What is your work experience?" onBack={() => setStep(1)}>
                <div className="grid min-h-0 flex-1 content-start gap-2">
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <OptionCard
                      key={option.id}
                      label={option.label}
                      meta={`${filterMatches(jobs, jobPref, option.id, null).length.toLocaleString("en-IN")} roles`}
                      active={experience === option.id}
                      onClick={() => pickExperience(option.id)}
                    />
                  ))}
                </div>
              </StepBlock>
            ) : null}

            {step === 3 ? (
              <StepBlock title="3. How many hours can you work daily?" onBack={() => setStep(2)}>
                <div className="grid min-h-0 flex-1 content-start gap-2">
                  {HOURS_OPTIONS.map((option) => (
                    <OptionCard
                      key={option.id}
                      label={option.label}
                      meta={`${filterMatches(jobs, jobPref, experience, option.id).length.toLocaleString("en-IN")} roles`}
                      active={hours === option.id}
                      onClick={() => pickHours(option.id)}
                    />
                  ))}
                </div>
              </StepBlock>
            ) : null}

            {step === 4 ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <h2 className="shrink-0 text-[1.05rem] font-bold text-[#0b1220]">
                  4. Unlock matched India roles
                </h2>

                <div className="mt-4 shrink-0">
                  <PricingOfferCard
                    offer={pricing ? offerFromPortalPricing(pricing) : null}
                    loading={priceLoading}
                    variant="checkout"
                    footer={
                      <>
                        <span className="font-semibold text-[#16a34a]">Already subscribed?</span> Enter
                        your mobile number to login.
                      </>
                    }
                  />
                </div>

                <label className="mt-4 block shrink-0 text-[13px] font-bold text-[#16a34a]">
                  Mobile number
                </label>
                <div className="mt-1.5 flex shrink-0 overflow-hidden rounded-lg border-2 border-[#86efac]">
                  <span className="flex items-center bg-[#f0fdf4] px-3 text-sm font-semibold text-[#16a34a]">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={mobile}
                    onChange={(event) => {
                      setMobile(event.target.value.replace(/\D/g, "").slice(0, 10));
                      setPayError(null);
                    }}
                    className="h-11 min-w-0 flex-1 bg-white px-3 text-[15px] text-[#0f172a] outline-none"
                  />
                </div>

                <label className="mt-3 flex shrink-0 items-start gap-2.5 text-[12px] text-[#64748b]">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => {
                      setAgreed(event.target.checked);
                      setPayError(null);
                    }}
                    className="mt-0.5 h-4 w-4 accent-[#16a34a]"
                  />
                  <span>I agree with terms and I am above 18 years</span>
                </label>

                {payError ? (
                  <p className="mt-2 shrink-0 text-center text-[12px] font-medium text-[#dc2626]">
                    {payError}
                  </p>
                ) : (
                  <p className="mt-2 shrink-0 text-center text-[11px] text-[#94a3b8]">
                    {matched.length.toLocaleString("en-IN")} roles ready after unlock
                  </p>
                )}

                <div className="mt-auto shrink-0 pt-3">
                  <button
                    type="button"
                    onClick={onPay}
                    disabled={paying || priceLoading || !pricing}
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-[#16a34a] text-[15px] font-bold tracking-[0.06em] text-white uppercase shadow-[0_8px_20px_rgba(22,163,74,0.28)] transition hover:bg-[#15803d] disabled:opacity-50"
                  >
                    {paying ? "Processing..." : "Pay now"}
                  </button>
                  <div className="mt-3 flex items-center justify-between text-[12px] text-[#64748b]">
                    <button type="button" onClick={() => setStep(3)} className="font-medium">
                      ← Back
                    </button>
                    <a href="mailto:help@meridian.jobs" className="font-medium hover:text-[#0f172a]">
                      Need help? Contact Us
                    </a>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* {step < 4 ? (
          <p className="mt-2 shrink-0 text-center text-[11px] text-[#64748b]">
            <Link to="/" className="font-semibold text-[#1d4ed8]">
              Full board
            </Link>
          </p>
        ) : null} */}
      </div>
    </div>
  );
}

function StepBlock({
  title,
  children,
  onBack,
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h2 className="shrink-0 text-[1rem] font-bold leading-snug text-[#0b1220]">{title}</h2>
      <div className="mt-2 flex min-h-0 flex-1 flex-col">{children}</div>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mt-2 shrink-0 self-start text-xs font-medium text-[#64748b]"
        >
          ← Back
        </button>
      ) : null}
    </div>
  );
}

function OptionCard({
  label,
  meta,
  icon,
  active,
  onClick,
}: {
  label: string;
  meta?: string;
  icon?: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 text-left ${
        active ? "border-[#2563eb] shadow-[0_0_0_1px_#2563eb]" : "border-[#e2e8f0]"
      }`}
    >
      {icon ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9] text-base">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-[#0f172a] sm:text-[14px]">{label}</span>
        {meta ? <span className="block text-[11px] text-[#64748b]">{meta}</span> : null}
      </span>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
          active ? "bg-[#2563eb] text-white" : "bg-[#f1f5f9] text-[#64748b]"
        }`}
      >
        →
      </span>
    </button>
  );
}
