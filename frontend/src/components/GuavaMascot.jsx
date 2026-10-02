import React from 'react';

export default function GuavaMascot({ status = 'idle' }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 text-center select-none">
      <div className="relative w-28 h-28 flex items-center justify-center my-1 animate-guavaBounce">
        <svg className="w-28 h-28 drop-shadow-md hover:scale-105 transition-transform" viewBox="0 0 140 140" fill="none">
          <path d="M70 12 C72 7, 76 6, 80 8 C79 12, 74 15, 71 16 Z" fill="#2d6a33" />
          <path d="M72 16 C85 10, 102 16, 98 28 C86 28, 76 22, 72 16 Z" fill="#58a757" stroke="#2d6a33" strokeWidth="1.5" />
          <path d="M75 16 Q88 19 96 25" stroke="#c2db52" strokeWidth="1" fill="none" />
          <ellipse cx="70" cy="74" rx="54" ry="50" fill="#58a757" stroke="#2d6a33" strokeWidth="3" />
          <ellipse cx="70" cy="75" rx="46" ry="43" fill="#e2ed9e" />
          <ellipse cx="70" cy="75" rx="39" ry="36" fill="#f46a78" />
          <circle cx="56" cy="67" r="2.2" fill="#dc3545" />
          <circle cx="84" cy="67" r="2.2" fill="#dc3545" />
          <circle cx="58" cy="85" r="2.2" fill="#dc3545" />
          <circle cx="82" cy="85" r="2.2" fill="#dc3545" />
          <circle cx="70" cy="90" r="2.2" fill="#dc3545" />
          <circle cx="70" cy="62" r="2.2" fill="#dc3545" />
          <circle cx="62" cy="73" r="3.2" fill="#221e22" />
          <circle cx="63.5" cy="71.5" r="1.1" fill="#ffffff" />
          <circle cx="78" cy="73" r="3.2" fill="#221e22" />
          <circle cx="79.5" cy="71.5" r="1.1" fill="#ffffff" />
          <ellipse cx="56" cy="77" rx="3" ry="1.8" fill="#ffffff" opacity="0.45" />
          <ellipse cx="84" cy="77" rx="3" ry="1.8" fill="#ffffff" opacity="0.45" />
          <path d="M65 78 Q70 83 75 78" stroke="#221e22" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#58a757]/30 shadow-sm text-xs font-bold text-[#2d6a33]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#f46a78] animate-pulse"></span>
        <span>100% In-Memory • Natural Pink Guava Privacy</span>
      </div>
    </div>
  );
}