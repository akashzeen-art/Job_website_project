import { useState, useEffect, useRef } from "react";
import { getPortalIdFromUrl, getClickIdFromUrl, getMsisdnFromUrl, validateClickId } from "../utils/clickIdManager";
import { API_ENDPOINTS } from "@/config/env";
import { handlePostPaymentFlow, cleanPostPaymentUrl } from "@/utils/postPaymentHandler";
import { verifyAndSyncSubscription, redirectIfSubscribed } from "@/utils/subscriptionFlow";
import { isSubscriptionActive } from "@/utils/accessControlGuard";

export default function DirectCheckout() {
  const [formData, setFormData] = useState({ mobile: "" });
  const [priceLoading, setPriceLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingReturn, setVerifyingReturn] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [urlParams, setUrlParams] = useState({ clickid: "", id: "" });
  const [price, setPrice] = useState<number | null>(null);
  const [servicePack, setServicePack] = useState<string | null>(null);
  const [portalId, setPortalId] = useState<string | null>(null);
  const [logo, setLogo] = useState<string>("/logo.png");
  const [banner, setBanner] = useState<string>("/bgcheckout.png");
  const [subscribedRedirecting, setSubscribedRedirecting] = useState(false);
  const configFetched = useRef(false);
  const returnHandled = useRef(false);

  const searchParams = new URLSearchParams(window.location.search);
  const paymentStatus = searchParams.get("payment");
  const msisdnParam = getMsisdnFromUrl();

  useEffect(() => {
    if (configFetched.current) return;

    const id = getPortalIdFromUrl() || "1";
    const clickid = getClickIdFromUrl();

    setUrlParams({ clickid: clickid || "", id });
    configFetched.current = true;
    fetchPaymentConfig(clickid || "", id);
  }, []);

  useEffect(() => {
    if (returnHandled.current) return;

    const msisdn = msisdnParam;
    const resolvedPortalId = portalId || urlParams.id || getPortalIdFromUrl() || "1";

    if (!msisdn) return;

    returnHandled.current = true;
    setVerifyingReturn(true);
    setFormData({ mobile: msisdn });

    handlePostPaymentFlow(msisdn, resolvedPortalId)
      .then((isActive) => {
        cleanPostPaymentUrl();

        if (isActive) {
          setSubscribedRedirecting(true);
          window.location.href = redirectIfSubscribed(
            msisdn,
            resolvedPortalId,
            urlParams.clickid || getClickIdFromUrl(),
          );
        }
      })
      .finally(() => setVerifyingReturn(false));
  }, [msisdnParam, portalId, urlParams.clickid, urlParams.id]);

  useEffect(() => {
    if (paymentStatus === "failed") {
      setSubmitError("Payment failed. Please try again.");
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.toString());
    }
  }, [paymentStatus]);

  const resolvePriceFromAPI = (apiResponse: any) => {
    if (apiResponse.multiplePackType && typeof apiResponse.multiplePackType === "object") {
      const keys = Object.keys(apiResponse.multiplePackType);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const value = apiResponse.multiplePackType[firstKey];

        if (firstKey && value !== null && value !== undefined && value !== "") {
          const numValue = Number(value);
          if (!isNaN(numValue) && isFinite(numValue)) {
            return { packType: firstKey, price: numValue };
          }
        }
      }
    }

    if (apiResponse.packType && apiResponse.price !== null && apiResponse.price !== undefined && apiResponse.price !== "") {
      const numValue = Number(apiResponse.price);
      if (!isNaN(numValue) && isFinite(numValue)) {
        return { packType: apiResponse.packType, price: numValue };
      }
    }

    return null;
  };

  const fetchPaymentConfig = async (clickid: string, planId: string) => {
    const callKey = `${clickid}-${planId}`;
    if ((window as any)._apiCallTracker?.[callKey]) return;

    if (!(window as any)._apiCallTracker) (window as any)._apiCallTracker = {};
    (window as any)._apiCallTracker[callKey] = true;

    setPriceLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.paymentPortal(planId, clickid));
      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const config = await response.json();
      const resolved = resolvePriceFromAPI(config);
      const resolvedPortalId = String(config.portalId || planId);

      setPortalId(resolvedPortalId);
      localStorage.setItem("portalId", resolvedPortalId);

      if (resolved) {
        setPrice(resolved.price);
        setServicePack(resolved.packType);
      } else {
        setPrice(null);
        setServicePack(null);
      }

      if (config.logo) setLogo(config.logo);
      if (config.banner) setBanner(config.banner);
    } catch {
      const fallbackPortalId = planId;
      setPrice(null);
      setServicePack(null);
      setPortalId(fallbackPortalId);
      setSubmitError("Could not load price. Please refresh and try again.");
    } finally {
      setPriceLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "mobile" && value.length > 10) return;
    setSubmitError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (price === null) {
      setSubmitError("Price information is not available. Please try again later.");
      return;
    }

    if (formData.mobile.length !== 10) {
      setSubmitError("Please enter a valid 10-digit mobile number");
      return;
    }

    setSubmitting(true);

    const resolvedPortalId = portalId || urlParams.id || "1";
    const effectiveClickId = urlParams.clickid || getClickIdFromUrl() || "";

    try {
      const isActive = await isSubscriptionActive(formData.mobile, resolvedPortalId);

      if (isActive) {
        await verifyAndSyncSubscription(formData.mobile, resolvedPortalId);
        window.location.href = redirectIfSubscribed(
          formData.mobile,
          resolvedPortalId,
          effectiveClickId,
        );
        return;
      }
    } catch (error) {
      console.error("SubStatus check failed:", error);
      setSubmitting(false);
      setSubmitError("Could not verify subscription status. Please try again.");
      return;
    }

    if (!validateClickId(effectiveClickId)) {
      setSubmitting(false);
      setSubmitError("Unable To Subscribe.");
      return;
    }

    const orderData = {
      portalId: parseInt(resolvedPortalId, 10),
      mobile: formData.mobile,
      email: "",
      clickId: effectiveClickId,
      servicePack: servicePack || "DAILY",
      amount: price,
    };

    try {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = API_ENDPOINTS.paymentInitiate;

      Object.keys(orderData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String((orderData as any)[key]);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch {
      setSubmitting(false);
      setSubmitError("Payment submission failed. Please try again.");
    }
  };

  if (priceLoading || verifyingReturn || subscribedRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-white/80 text-sm">
            {subscribedRedirecting ? "Redirecting..." : verifyingReturn ? "Verifying subscription..." : "Loading checkout..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-black">
      <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url('${banner}')` }}></div>
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-5xl font-bold text-white text-center mb-2">गरमा गरम !</h2>
          <p className="text-2xl font-medium text-purple-300 text-center mb-6">Webseries</p>

          <div className="text-center mb-6">
            <img
              src={logo}
              alt="Product"
              className="max-w-[50%] h-auto mx-auto rounded-lg shadow-lg"
            />
          </div>

          <div className="border border-purple-400/30 rounded-lg p-4 mb-6">
            <p className="text-white text-center">
              Proceed further to complete the payment of{" "}
              {price !== null && servicePack ? (
                <strong className="text-purple-300">Rs.{price} ({servicePack})</strong>
              ) : (
                <strong className="text-gray-400">Unavailable</strong>
              )}{" "}
              for your order.
            </p>
            <p className="text-white/80 text-center text-sm mt-3">
              Already Subscribed? <br />
              Enter your mobile number to login.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Mobile Number</label>
              <div className="flex bg-white/10 border border-white/20 rounded-lg overflow-hidden">
                <span className="px-4 py-3 text-white border-r border-white/20 select-none flex items-center justify-center whitespace-nowrap">+91</span>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit mobile number"
                  required
                  className="w-full px-3 py-3 bg-transparent text-white placeholder-white/100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={submitting}
                />
              </div>
              {submitError && <p className="text-red-400 text-sm mt-2 font-bold text-center">{submitError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
              disabled={submitting || price === null}
            >
              {submitting ? "Processing..." : "Complete Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
