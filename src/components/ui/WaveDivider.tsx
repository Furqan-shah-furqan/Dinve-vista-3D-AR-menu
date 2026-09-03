import React from 'react';

interface WaveDividerProps {
  position?: 'top' | 'bottom';
  fillColor?: string;
  className?: string;
  variant?: 'smooth' | 'playful' | 'drip';
}

export function WaveDivider({
  position = 'bottom',
  fillColor = '#faf7f2',
  className = '',
  variant = 'smooth',
}: WaveDividerProps) {
  return (
    <div
      className={`w-full overflow-hidden leading-none select-none pointer-events-none ${
        position === 'top' ? 'rotate-180 -mt-1' : '-mb-1'
      } ${className}`}
    >
      {variant === 'smooth' && (
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-10 md:h-16"
        >
          <path
            d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,60 L1200,120 L0,120 Z"
            fill={fillColor}
          />
        </svg>
      )}

      {variant === 'playful' && (
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-12 md:h-20"
        >
          <path
            d="M0,0 C200,120 400,-20 600,80 C800,180 1000,20 1200,90 L1200,120 L0,120 Z"
            fill={fillColor}
          />
        </svg>
      )}

      {variant === 'drip' && (
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-12 md:h-18"
        >
          <path
            d="M0,0 C80,40 120,80 160,80 C200,80 220,10 280,20 C340,30 380,100 440,100 C500,100 540,20 600,30 C660,40 700,90 760,90 C820,90 860,10 920,20 C980,30 1020,110 1080,110 C1140,110 1170,40 1200,30 L1200,120 L0,120 Z"
            fill={fillColor}
          />
        </svg>
      )}
    </div>
  );
}
