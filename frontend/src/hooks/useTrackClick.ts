'use client';

import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useCallback } from 'react';

export function useTrackClick() {
  const { trackClick } = useAnalytics();

  const trackProductClick = useCallback((productId: string, productTitle: string) => {
    trackClick({
      elementType: 'product',
      elementId: productId,
      elementText: productTitle
    });
  }, [trackClick]);

  const trackButtonClick = useCallback((buttonId: string, buttonText: string) => {
    trackClick({
      elementType: 'button',
      elementId: buttonId,
      elementText: buttonText
    });
  }, [trackClick]);

  const trackLinkClick = useCallback((linkText: string, linkHref: string) => {
    trackClick({
      elementType: 'link',
      elementText: linkText,
      elementId: linkHref
    });
  }, [trackClick]);

  const trackCTAClick = useCallback((ctaText: string) => {
    trackClick({
      elementType: 'cta',
      elementText: ctaText
    });
  }, [trackClick]);

  return {
    trackProductClick,
    trackButtonClick,
    trackLinkClick,
    trackCTAClick,
    trackClick
  };
}
