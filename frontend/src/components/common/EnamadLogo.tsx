'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export const EnamadLogo = () => {
  const [showOfficial, setShowOfficial] = useState(false);

  useEffect(() => {
    // Try to load the official image in the background
    const img = new window.Image();
    img.src = 'https://trustseal.enamad.ir/logo.aspx?id=680511&Code=S8Sj9eDCgNjtTBrbUHTvNkd1d2dAqOnD';
    
    img.onload = () => {
      setShowOfficial(true);
    };

    // No need to handle error/timeout explicitly as we default to fallback
  }, []);

  if (showOfficial) {
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
        />
      </a>
    );
  }

  // Default / Fallback view
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
        priority
        unoptimized // Ensure it loads without processing issues
      />
    </a>
  );
};
