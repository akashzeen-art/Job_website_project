import { API_ENDPOINTS } from "@/config/env";
import { checkSubStatus } from "@/services/userStatusApi";

export type PaymentStatusResult = "SUCCESS" | "PENDING" | "FAILED";

export interface PaymentStatusResponse {
  status: PaymentStatusResult;
  txnId: string;
  message?: string;
}

export interface PaymentStatusCheckOptions {
  mobile?: string | null;
  portalId?: string | number | null;
}

export const fetchPaymentStatus = async (
  txnId: string,
  options?: PaymentStatusCheckOptions,
): Promise<PaymentStatusResponse> => {
  const response = await fetch(API_ENDPOINTS.paymentStatus(txnId));

  if (response.ok) {
    const json = (await response.json()) as PaymentStatusResponse;
    return { ...json, txnId };
  }

  if (response.status === 404 && options?.mobile && options?.portalId) {
    const isActive = await checkSubStatus(options.mobile, options.portalId);
    if (isActive) {
      return { status: "SUCCESS", txnId, message: "Subscription active" };
    }
    return { status: "PENDING", txnId, message: "Awaiting payment confirmation" };
  }

  const text = await response.text().catch(() => "");
  throw new Error(text || `Payment status check failed (${response.status})`);
};

export interface PollPaymentStatusOptions extends PaymentStatusCheckOptions {
  maxAttempts?: number;
  intervalMs?: number;
}

export const pollPaymentStatus = async (
  txnId: string,
  options: PollPaymentStatusOptions,
): Promise<PaymentStatusResult> => {
  const maxAttempts = options.maxAttempts ?? 30;
  const intervalMs = options.intervalMs ?? 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const result = await fetchPaymentStatus(txnId, options);
    if (result.status === "SUCCESS" || result.status === "FAILED") {
      return result.status;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return "PENDING";
};

export const initiatePayment = (orderData: {
  portalId: number;
  clickId: string;
  mobile: string;
  packType: string;
  price: number;
}) => {
  const { portalId, clickId, mobile, packType, price } = orderData;
  const form = document.createElement("form");
  form.method = "POST";
  form.action = API_ENDPOINTS.paymentInitiate;

  const payload = {
    portalId,
    mobile,
    email: "",
    clickId,
    servicePack: packType,
    amount: price,
  };

  for (const [key, value] of Object.entries(payload)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
};

export const getPackTypeFromPlan = (selectedPlan: string) => {
  switch (selectedPlan.toLowerCase()) {
    case "weekly":
      return "WEEKLY";
    case "monthly":
      return "MONTHLY";
    default:
      return "MONTHLY";
  }
};

export const getPriceForPlan = (
  pricingData: { plans?: Record<string, { discountedPrice: number }> },
  selectedPlan: string,
) => {
  const plan = pricingData.plans?.[selectedPlan.toLowerCase()];
  return plan?.discountedPrice ?? 0;
};
