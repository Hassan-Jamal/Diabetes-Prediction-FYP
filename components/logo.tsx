import React from "react"

export function Logo({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className}>
      {/* Background Circle */}
      <circle cx="100" cy="100" r="95" fill="url(#gradient1)" />
      
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      
      {/* Heart Symbol for Healthcare */}
      <path
        d="M100 70 C90 70, 85 80, 85 90 C85 100, 100 115, 100 115 C100 115, 115 100, 115 90 C115 80, 110 70, 100 70 Z"
        fill="white"
        stroke="none"
      />
      
      {/* Medical Cross */}
      <rect x="85" y="115" width="30" height="8" rx="4" fill="white" />
      <rect x="93" y="107" width="14" height="24" rx="7" fill="white" />
      
      {/* Pulse Lines */}
      <path
        d="M70 130 L75 125 L80 135 L85 120 L90 140 L95 125 L100 145"
        stroke="white"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Shield Protection Symbol */}
      <path
        d="M105 130 L125 130 L125 155 L115 165 L105 155 Z"
        fill="url(#gradient1)"
        stroke="white"
        strokeWidth="3"
        opacity="0.9"
      />
    </svg>
  )
}

export function LogoSmall({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className}>
      {/* Background Circle */}
      <circle cx="100" cy="100" r="95" fill="url(#gradient2)" />
      
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      
      {/* Heart Symbol */}
      <path
        d="M100 70 C90 70, 85 80, 85 90 C85 100, 100 115, 100 115 C100 115, 115 100, 115 90 C115 80, 110 70, 100 70 Z"
        fill="white"
      />
      
      {/* Medical Cross */}
      <rect x="85" y="115" width="30" height="8" rx="4" fill="white" />
      <rect x="93" y="107" width="14" height="24" rx="7" fill="white" />
    </svg>
  )
}

