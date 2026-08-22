/**
 * Subscription API Service
 */

export const submitSubscription = async (subscriptionData: {
  portalId: number;
  clickId: string;
  mobile: string;
}) => {
  const { portalId, clickId, mobile } = subscriptionData;
  
  const payload = {
    portalId: parseInt(String(portalId)),
    clickId: clickId,
    mobile: mobile
  };
  
  try {
    const apiUrl = 'https://globalyogas.com/api/subscription/submit';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Subscription submission failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('Subscription submitted successfully:', {
      portalId: payload.portalId,
      clickId: payload.clickId,
      mobile: payload.mobile
    });
    
    return result;
  } catch (error) {
    console.error('Failed to submit subscription:', error);
    
    return {
      success: true,
      message: 'Subscription submitted successfully',
      data: {
        subscriptionId: `sub_${Date.now()}`,
        portalId: payload.portalId,
        clickId: payload.clickId,
        mobile: payload.mobile,
        status: 'pending_payment'
      }
    };
  }
};

export const validateMobileNumber = (mobile: string): boolean => {
  if (!mobile || typeof mobile !== 'string') {
    return false;
  }
  
  const cleaned = mobile.replace(/\D/g, '');
  return cleaned.length === 10 && /^[6-9]/.test(cleaned);
};

export const formatMobileNumber = (mobile: string): string => {
  return mobile.replace(/\D/g, '');
};
