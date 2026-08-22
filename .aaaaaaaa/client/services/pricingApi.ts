/**
 * Pricing API Service
 */

import { API_ENDPOINTS } from '@/config/env';

export const fetchPricingData = async (portalId: string | number, clickId: string) => {
  const apiUrl = API_ENDPOINTS.paymentPortal(portalId, clickId);
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

export const parsePricingForUI = (apiData: any) => {
  const { multiplePackType, price } = apiData;
  
  const plans: any = {};
  
  if (multiplePackType?.WEEKLY) {
    plans.weekly = {
      discountedPrice: parseInt(multiplePackType.WEEKLY),
      originalPrice: calculateOriginalPrice(parseInt(multiplePackType.WEEKLY), 'weekly'),
      discount: calculateDiscount(parseInt(multiplePackType.WEEKLY), calculateOriginalPrice(parseInt(multiplePackType.WEEKLY), 'weekly'))
    };
  }
  
  if (multiplePackType?.MONTHLY) {
    plans.monthly = {
      discountedPrice: parseInt(multiplePackType.MONTHLY),
      originalPrice: calculateOriginalPrice(parseInt(multiplePackType.MONTHLY), 'monthly'),
      discount: calculateDiscount(parseInt(multiplePackType.MONTHLY), calculateOriginalPrice(parseInt(multiplePackType.MONTHLY), 'monthly'))
    };
  }
  
  return {
    portalId: apiData.portalId,
    currencyCode: apiData.currencyCode || 'INR',
    plans
  };
};

const calculateOriginalPrice = (discountedPrice: number, planType: string) => {
  const discountRate = 0.5;
  return Math.round(discountedPrice / (1 - discountRate));
};

const calculateDiscount = (discountedPrice: number, originalPrice: number) => {
  const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  return `${discount}% OFF`;
};
