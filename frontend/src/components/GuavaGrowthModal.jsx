import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

/* ---------- smooth interpolation helpers ---------- */
const clamp = (v, a = 0, b = 100) => Math.min(b, Math.max(a, v));

export default function GuavaGrowthModal({
  isOpen,
  totalBytes = 0,
  isServerDone = false,
  onMovieFinished,
}) {
  const [p, setP] = useState(0);
  const [shown, setShown] = useState(false);

  // Keep refs up-to-date to prevent stale closures in the 120 FPS rAF loop
  const serverDoneRef = useRef(isServerDone);
  serverDoneRef.current = isServerDone;
  const bytesRef = useRef(totalBytes);
  bytesRef.current = totalBytes;
  const doneCbRef = useRef(onMovieFinished);
  doneCbRef.current = onMovieFinished;

  useEffect(() => {
    if (!isOpen) {
      setP(0);
      setShown(false);
      return;
    }

    let rafId;
    let finishStartTime = null;
    let fromPercent = 0;
    let currentPercent = 0;
    let isTerminated = false;

    // Smooth entry transition
    const showTimer = setTimeout(() => setShown(true), 20);
    const startTime = performance.now();

    // Dynamically calculate paced progression based on input size
    const mb = Math.max(0.1, bytesRef.current / (1024 * 1024));
    const secondsTo85 = clamp(10 + mb * 8, 12, 60);

    const frameTick = (now) => {
      if (serverDoneRef.current) {
        if (finishStartTime === null) {
          finishStartTime = now;
          fromPercent = currentPercent;
        }

        // Smooth finale: glide to 100% over 1.8 seconds once backend finishes
        const finaleDuration = Math.max(1800, (100 - fromPercent) * 45);
        const progressRatio = Math.min(1, (now - finishStartTime) / finaleDuration);
        currentPercent = fromPercent + (100 - fromPercent) * progressRatio;

        if (progressRatio >= 1 && !isTerminated) {
          isTerminated = true;
          setP(100);
          setTimeout(() => setShown(false), 600);
          setTimeout(() => {
            if (doneCbRef.current) doneCbRef.current();
          }, 850);
          return;
        }
      } else {
        // Paced asymptotic glide towards 88% while server processes
        const elapsedSec = (now - startTime) / 1000;
        const target = (elapsedSec / secondsTo85) * 85;
        currentPercent = Math.max(currentPercent, Math.min(88, target));
      }

      setP(currentPercent);
      if (!isTerminated) {
        rafId = requestAnimationFrame(frameTick);
      }
    };

    rafId = requestAnimationFrame(frameTick);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(showTimer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const pct = Math.min(100, Math.floor(p));
  const isComplete = pct >= 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      style={{
        opacity: shown ? 1 : 0,
        transition: 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes guava-wheel-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .guava-wheel-gpu {
          animation: guava-wheel-spin 2.2s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .guava-wheel-gpu { animation: none; }
        }
      `}</style>

      {/* Compact Box Container */}
      <div
        className="w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl border border-green-200/80 flex flex-col items-center text-center"
        style={{
          transform: shown ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(12px)',
          transition: 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Memory Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef8ed] border border-[#58a757]/30 text-green-900 text-[11px] font-bold tracking-tight mb-4 shadow-sm">
          {isComplete ? (
            <>
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Complete &bull; Ready</span>
            </>
          ) : (
            <>
              <ShieldCheck size={13} className="text-[#58a757]" />
              <span>RAM In-Memory &bull; {(totalBytes / (1024 * 1024)).toFixed(2)} MB</span>
            </>
          )}
        </div>

        {/* 120 FPS Spinning Guava Wheel */}
        <div className="relative w-24 h-24 my-1 flex items-center justify-center">
          <svg
            className={`w-24 h-24 drop-shadow-md ${isComplete ? 'scale-105' : 'guava-wheel-gpu'}`}
            viewBox="0 0 100 100"
            fill="none"
            style={{ transition: 'transform 400ms ease' }}
          >
            {/* Outer Green Rind */}
            <circle cx="50" cy="50" r="46" fill="#58a757" stroke="#2d6a33" strokeWidth="2.5" />

            {/* Inner Pale Yellow Ring */}
            <circle cx="50" cy="50" r="39" fill="#e2ed9e" />

            {/* Juicy Pink Guava Flesh */}
            <circle cx="50" cy="50" r="32" fill="#f46a78" />

            {/* Guava Core Radial Segments */}
            <circle cx="50" cy="50" r="26" fill="#f7838e" opacity="0.6" />

            {/* Seeds distributed in circle */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <g key={i} transform={`rotate(${angle} 50 50)`}>
                <ellipse cx="50" cy="33" rx="1.8" ry="3" fill="#dc3545" />
                <circle cx="50" cy="32" r="0.8" fill="#ffccd2" />
              </g>
            ))}

            {/* Center Core Accent */}
            <circle cx="50" cy="50" r="4.5" fill="#fbd3d8" />
          </svg>
        </div>

        {/* Percentage Counter */}
        <div className="text-3xl font-black text-green-950 mt-3 font-mono tracking-tight tabular-nums">
          {pct}%
        </div>

        <p className="text-xs font-semibold text-[#f46a78] mt-0.5">
          {isComplete ? 'Finished processing!' : 'Peeling & converting pages...'}
        </p>

        {/* Smooth 120 FPS Progress Bar */}
        <div className="w-full bg-green-100/70 rounded-full h-2.5 mt-4 overflow-hidden p-0.5 border border-green-200">
          <div
            className="bg-gradient-to-r from-[#58a757] via-[#f46a78] to-[#dc3545] h-full rounded-full"
            style={{
              width: `${p}%`,
              transition: 'width 80ms linear',
            }}
          />
        </div>

        <span className="text-[10px] font-medium text-neutral-400 mt-3">
          100% client-side memory &bull; Zero disk storage
        </span>
      </div>
    </div>
  );
}