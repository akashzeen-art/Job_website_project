/**
 * Post-Payment Handler Utility
 */

import { verifyAndSyncSubscription } from './subscriptionFlow';

export const handlePostPaymentFlow = async (msisdn: string, portalId: string | number) => {
  try {
    console.log('🔄 Checking post-payment subscription status:', { msisdn, portalId });
    const isActive = await verifyAndSyncSubscription(msisdn, portalId);

    if (isActive) {
      console.log('✅ Post-payment: User is active subscriber');
      return true;
    }

    console.log('❌ Post-payment: User subscription not active');
    return false;
  } catch (error) {
    console.error('❌ Post-payment status check failed:', error);
    localStorage.removeItem('isSubscribed');
    localStorage.removeItem('userMobile');
    localStorage.removeItem('subscriptionData');
    return false;
  }
};

export const cleanPostPaymentUrl = () => {
  const url = new URL(window.location.href);
  const clickid = url.searchParams.get('clickid');
  const id = url.searchParams.get('id');

  if (url.searchParams.has('msisdn')) {
    url.search = '';

    if (clickid) url.searchParams.set('clickid', clickid);
    if (id) url.searchParams.set('id', id);

    window.history.replaceState({}, '', url.toString());
    console.log('🔧 URL cleaned after post-payment processing');
  }
};
