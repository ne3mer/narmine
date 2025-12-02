'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export const EnamadLogo = () => {
  const [shouldShowFallback, setShouldShowFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to switch to fallback if image takes too long (e.g., blocked IP)
    const timer = setTimeout(() => {
      if (isLoading) {
        setShouldShowFallback(true);
        setIsLoading(false);
      }
    }, 2000); // 2 seconds timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setShouldShowFallback(true);
    setIsLoading(false);
  };

  if (shouldShowFallback) {
    return (
      <a 
        referrerPolicy='origin' 
        target='_blank' 
        href='https://trustseal.enamad.ir/?id=680511&Code=S8Sj9eDCgNjtTBrbUHTvNkd1d2dAqOnD'
        className="relative block h-32 w-28 overflow-hidden rounded-xl bg-white p-2 shadow-md transition-transform hover:scale-105"
      >
        <Image
          src="/images/enamad.png"
          alt="نماد اعتماد الکترونیکی"
          fill
          className="object-contain p-1"
        />
      </a>
    );
  }

  return (
    <a 
      referrerPolicy='origin' 
      target='_blank' 
      href='https://trustseal.enamad.ir/?id=680511&Code=S8Sj9eDCgNjtTBrbUHTvNkd1d2dAqOnD'
      className="relative block h-32 w-28 overflow-hidden rounded-xl bg-white p-2 shadow-md transition-transform hover:scale-105"
    >
      <img 
        referrerPolicy='origin' 
        src='https://trustseal.enamad.ir/logo.aspx?id=680511&Code=S8Sj9eDCgNjtTBrbUHTvNkd1d2dAqOnD' 
        alt='نماد اعتماد الکترونیکی' 
        style={{ cursor: 'pointer', width: '100%', height: '100%', objectFit: 'contain' }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </a>
  );
};
