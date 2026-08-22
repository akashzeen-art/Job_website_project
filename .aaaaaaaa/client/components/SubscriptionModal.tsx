import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { getPortalIdFromUrl, getClickIdFromUrl, validateClickId } from "../utils/clickIdManager";
import { fetchPricingData, parsePricingForUI } from "../services/pricingApi";
import { verifyAndSyncSubscription } from "../utils/subscriptionFlow";
import { initiatePayment, getPackTypeFromPlan, getPriceForPlan } from "../services/paymentApi";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mobile: string) => void;
}

export default function SubscriptionModal({ isOpen, onClose, onSubmit }: SubscriptionModalProps) {
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pricingData, setPricingData] = useState<any>(null);
  const [portalId, setPortalId] = useState<string | null>(null);
  const [clickId, setClickId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setMobileNumber('');
      setError('');
      setLoading(false);
      
      const currentPortalId = getPortalIdFromUrl() || '1';
      const currentClickId = getClickIdFromUrl();
      
      setPortalId(currentPortalId);
      setClickId(currentClickId);
      
      loadPricingData(currentPortalId, currentClickId || '');
    }
  }, [isOpen]);

  const loadPricingData = async (portalId: string, clickId: string) => {
    setLoading(true);
    setError('');
    
    try {
      const apiData = await fetchPricingData(portalId, clickId);
      const parsedData = parsePricingForUI(apiData);
      setPricingData(parsedData);
    } catch (error) {
      const fallbackData = {
        portalId: parseInt(portalId),
        currencyCode: 'INR',
        plans: {
          weekly: {
            discountedPrice: 65,
            originalPrice: 130,
            discount: '50% OFF'
          },
          monthly: {
            discountedPrice: 75,
            originalPrice: 125,
            discount: '60% OFF'
          }
        }
      };
      setPricingData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(cleaned);
    setError('');
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mobileNumber || mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      const isActive = await verifyAndSyncSubscription(mobileNumber, portalId!);

      if (isActive) {
        onSubmit(mobileNumber);
        return;
      }
    } catch (error) {
      console.log('Status check failed, continuing with subscription');
    } finally {
      setLoading(false);
    }

    if (!validateClickId(clickId)) {
      setError('Unable To Subscribe.');
      return;
    }

    setStep(2);
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      setError('Please select a subscription plan');
      return;
    }
    
    if (!portalId || !mobileNumber || !pricingData) {
      setError('Missing required information. Please try again.');
      return;
    }

    if (!validateClickId(clickId)) {
      setError('Unable To Subscribe.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const packType = getPackTypeFromPlan(selectedPlan);
      const price = getPriceForPlan(pricingData, selectedPlan);
      
      const orderData = {
        portalId: parseInt(portalId),
        clickId: clickId,
        mobile: mobileNumber,
        packType: packType,
        price: price
      };
      
      await initiatePayment(orderData);
      onSubmit(mobileNumber);
      
    } catch (error) {
      setError('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {step === 1 && (
          <form onSubmit={handleInitialSubmit}>
            <h3 className="text-2xl font-bold text-black mb-6 text-center">Enter Mobile Number</h3>
            
            <div className="mb-6">
              <label htmlFor="mobileInput" className="block text-black font-semibold mb-2">
                Mobile Number
              </label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-red-500">
                <span className="px-4 py-3 bg-gray-100 text-black border-r border-gray-300 select-none flex items-center whitespace-nowrap">+91</span>
                <input
                  type="tel"
                  id="mobileInput"
                  placeholder="xxxxxxxxxx"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  maxLength={10}
                  className="w-full px-3 py-3 focus:outline-none"
                  required
                  disabled={loading}
                />
              </div>
              {error && <div className="text-red-500 text-sm mt-2 font-bold text-center">{error}</div>}
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Subscribe Now'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handlePlanSubmit}>
            <div className="text-center mb-4">
              <p className="text-black">Mobile: {mobileNumber}</p>
            </div>
            
            <h3 className="text-2xl font-bold text-black mb-6 text-center">Select Plan</h3>

            {pricingData?.plans?.weekly && (
              <label className="block mb-4 p-4 border-2 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                <input
                  type="radio"
                  name="plan"
                  value="weekly"
                  checked={selectedPlan === 'weekly'}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  disabled={loading}
                  className="mr-3"
                />
                <span className="font-bold text-black">Weekly</span>
                <div className="ml-6">
                  <span className="text-2xl font-bold text-red-600">₹{pricingData.plans.weekly.discountedPrice}</span>
                  <span className="text-black line-through ml-2">₹{pricingData.plans.weekly.originalPrice}</span>
                  <span className="ml-2 text-green-600">{pricingData.plans.weekly.discount}</span>
                </div>
              </label>
            )}

            {pricingData?.plans?.monthly && (
              <label className="block mb-4 p-4 border-2 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                <input
                  type="radio"
                  name="plan"
                  value="monthly"
                  checked={selectedPlan === 'monthly'}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  disabled={loading}
                  className="mr-3"
                />
                <span className="font-bold text-black">Monthly</span>
                <div className="ml-6">
                  <span className="text-2xl font-bold text-red-600">₹{pricingData.plans.monthly.discountedPrice}</span>
                  <span className="text-black line-through ml-2">₹{pricingData.plans.monthly.originalPrice}</span>
                  <span className="ml-2 text-green-600">{pricingData.plans.monthly.discount}</span>
                  <p className="text-sm text-black mt-1">Unlimited Videos & Web Series</p>
                </div>
              </label>
            )}

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
              disabled={loading || !pricingData}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
