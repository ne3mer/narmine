'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/icons/Icon';

export const EnamadLogo = () => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <a 
        referrerPolicy='origin' 
        target='_blank' 
        href='https://trustseal.enamad.ir/?id=680511&Code=S8Sj9eDCgNjtTBrbUHTvNkd1d2dAqOnD'
        className="flex h-32 w-28 flex-col items-center justify-center gap-2 rounded-xl bg-white p-2 text-center shadow-md transition-transform hover:scale-105 border border-slate-100"
      >
        <div className="rounded-full bg-blue-50 p-3">
          <Icon name="shield" size={32} className="text-blue-600" />
        </div>
        <span className="text-[10px] font-bold text-slate-700">نماد اعتماد الکترونیکی</span>
        <span className="text-[8px] text-slate-400">کلیک کنید</span>
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
        onError={() => setError(true)}
      />
    </a>
  );
};
