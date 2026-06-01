import React from 'react';

const SVGS = {
  up: (
    <svg viewBox="0 0 140 140" width="100%" height="100%">
      <polygon points="70,4 130,35 130,105 70,136 10,105 10,35" fill="#FE60A0" stroke="#FF99C4" strokeWidth="1.5" />
      <polygon points="70,16 118,42 118,98 70,124 22,98 22,42" fill="none" stroke="#fff" strokeWidth="0.7" opacity="0.4" />
      <polygon points="70,30 104,50 104,90 70,110 36,90 36,50" fill="#C0005A" opacity="0.4" />
      <line x1="70" y1="4" x2="70" y2="136" stroke="#FFB3D0" strokeWidth="0.5" opacity="0.5" />
      <line x1="10" y1="35" x2="130" y2="105" stroke="#FFB3D0" strokeWidth="0.5" opacity="0.5" />
      <line x1="130" y1="35" x2="10" y2="105" stroke="#FFB3D0" strokeWidth="0.5" opacity="0.5" />
      <path d="M58 80 L70 56 L82 80 Z" fill="#fff" opacity="0.95" />
      <rect x="62" y="80" width="16" height="10" rx="2" fill="#fff" opacity="0.95" />
    </svg>
  ),
  trust: (
    <svg viewBox="0 0 140 140" width="100%" height="100%">
      <polygon points="70,130 6,16 134,16" fill="#080812" stroke="#8B8BFF" strokeWidth="1.8" />
      <polygon points="70,16 134,130 6,130" fill="none" stroke="#8B8BFF" strokeWidth="0.8" opacity="0.35" />
      <polygon points="70,108 22,26 118,26" fill="#0E0E2A" stroke="#8B8BFF" strokeWidth="0.6" opacity="0.5" />
      <ellipse cx="70" cy="73" rx="22" ry="13" fill="none" stroke="#8B8BFF" strokeWidth="1.2" />
      <circle cx="70" cy="73" r="7" fill="#8B8BFF" opacity="0.9" />
      <circle cx="70" cy="73" r="3" fill="#080812" />
      <line x1="6" y1="16" x2="134" y2="16" stroke="#8B8BFF" strokeWidth="1.5" />
    </svg>
  ),
  ground: (
    <svg viewBox="0 0 140 140" width="100%" height="100%">
      <circle cx="70" cy="70" r="62" fill="#000" stroke="#5A9BFF" strokeWidth="2" />
      <ellipse cx="70" cy="70" rx="62" ry="22" fill="none" stroke="#5A9BFF" strokeWidth="0.8" opacity="0.5" />
      <ellipse cx="70" cy="70" rx="62" ry="38" fill="none" stroke="#5A9BFF" strokeWidth="0.6" opacity="0.3" />
      <line x1="8" y1="70" x2="132" y2="70" stroke="#5A9BFF" strokeWidth="0.8" opacity="0.6" />
      <line x1="70" y1="8" x2="70" y2="132" stroke="#5A9BFF" strokeWidth="0.8" opacity="0.6" />
      <circle cx="70" cy="70" r="8" fill="#5A9BFF" opacity="0.9" />
      <circle cx="70" cy="70" r="3" fill="#000" />
    </svg>
  ),
  phlox: (
    <svg viewBox="0 0 140 140" width="100%" height="100%">
      <rect x="8" y="8" width="124" height="124" rx="40" fill="#FF6B35" stroke="#CC4400" strokeWidth="1.8" transform="rotate(45 70 70)" />
      <ellipse cx="70" cy="46" rx="8" ry="18" fill="#fff" opacity="0.85" />
      <ellipse cx="70" cy="94" rx="8" ry="18" fill="#fff" opacity="0.85" />
      <ellipse cx="46" cy="70" rx="18" ry="8" fill="#fff" opacity="0.85" />
      <ellipse cx="94" cy="70" rx="18" ry="8" fill="#fff" opacity="0.85" />
      <circle cx="70" cy="70" r="10" fill="#FF6B35" stroke="#fff" strokeWidth="1.5" />
      <circle cx="70" cy="70" r="4" fill="#fff" />
    </svg>
  ),
  page: (
    <svg viewBox="0 0 140 148" width="100%" height="100%">
      <path d="M20 10 Q20 4 26 4 L114 4 Q120 4 120 10 L120 120 Q120 126 114 126 L60 126 Q54 126 50 132 L46 138 Q42 144 36 144 L26 144 Q20 144 20 138 Z" fill="#7B5CFF" stroke="#B399FF" strokeWidth="1.5" />
      <rect x="34" y="22" width="52" height="5" rx="2.5" fill="#fff" opacity="0.85" />
      <rect x="34" y="34" width="42" height="3.5" rx="1.5" fill="#fff" opacity="0.5" />
      <rect x="34" y="44" width="48" height="3.5" rx="1.5" fill="#fff" opacity="0.5" />
      <rect x="34" y="54" width="36" height="3.5" rx="1.5" fill="#fff" opacity="0.5" />
    </svg>
  ),
  relay: (
    <svg viewBox="0 0 140 140" width="100%" height="100%">
      <polygon points="42,4 98,4 136,42 136,98 98,136 42,136 4,98 4,42" fill="#185FA5" stroke="#5A9BFF" strokeWidth="1.8" />
      <path d="M78 18 L52 72 L72 72 L62 118 L92 54 L72 54 L82 18 Z" fill="#fff" opacity="0.92" />
    </svg>
  ),
  verse: (
    <svg viewBox="0 0 140 160" width="100%" height="100%">
      <path d="M70 6 L130 28 L130 90 Q130 138 70 154 Q10 138 10 90 L10 28 Z" fill="#FF4E7C" stroke="#CC1A50" strokeWidth="1.8" />
      <polygon points="70,44 75,60 92,60 79,70 84,86 70,77 56,86 61,70 48,60 65,60" fill="#fff" opacity="0.95" />
      <polygon points="70,52 73,61 83,61 75,67 78,77 70,71 62,77 65,67 57,61 67,61" fill="#FF4E7C" />
    </svg>
  ),
  grave: (
    <svg viewBox="0 0 140 140" width="100%" height="100%">
      <rect x="22" y="50" width="96" height="84" rx="2" fill="#7C3AED" stroke="#5B21B6" strokeWidth="1.5" />
      <path d="M22 50 Q22 6 70 6 Q118 6 118 50" fill="#7C3AED" stroke="#5B21B6" strokeWidth="1.5" />
      <path d="M35 50 Q35 18 70 18 Q105 18 105 50" fill="none" stroke="#2DFFD3" strokeWidth="1" />
      <path d="M56 82 Q56 62 70 62 Q84 62 84 82" fill="none" stroke="#2DFFD3" strokeWidth="1.2" />
      <rect x="60" y="82" width="20" height="24" rx="1" fill="#2DFFD3" opacity="0.15" stroke="#2DFFD3" strokeWidth="0.8" />
      <line x1="70" y1="62" x2="70" y2="44" stroke="#2DFFD3" strokeWidth="1" />
      <line x1="62" y1="50" x2="78" y2="50" stroke="#2DFFD3" strokeWidth="1" />
    </svg>
  ),
  discover: (
    <svg viewBox="0 0 140 140" width="100%" height="100%">
      <polygon points="70,4 136,70 70,136 4,70" fill="#0066CC" stroke="#66AAFF" strokeWidth="1.8" />
      <circle cx="70" cy="70" r="14" fill="none" stroke="#fff" strokeWidth="1.2" />
      <circle cx="70" cy="70" r="6" fill="#fff" opacity="0.9" />
      <line x1="70" y1="46" x2="70" y2="56" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="84" x2="70" y2="94" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="46" y1="70" x2="56" y2="70" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="84" y1="70" x2="94" y2="70" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  everything: (
    <svg viewBox="0 0 140 140" width="100%" height="100%">
      <circle cx="70" cy="70" r="64" fill="#E8E4DC" stroke="#999" strokeWidth="1.5" />
      <circle cx="70" cy="70" r="44" fill="none" stroke="#aaa" strokeWidth="0.5" />
      <circle cx="70" cy="70" r="30" fill="none" stroke="#999" strokeWidth="0.5" />
      <circle cx="70" cy="26" r="8" fill="#fff" stroke="#999" strokeWidth="0.8" />
      <circle cx="70" cy="114" r="8" fill="#fff" stroke="#999" strokeWidth="0.8" />
      <circle cx="26" cy="70" r="8" fill="#fff" stroke="#999" strokeWidth="0.8" />
      <circle cx="114" cy="70" r="8" fill="#fff" stroke="#999" strokeWidth="0.8" />
      <circle cx="70" cy="70" r="5" fill="#333" />
    </svg>
  ),
  jump: (
    <svg viewBox="0 0 140 140" width="100%" height="100%">
      <path d="M70 6 L106 50 L90 50 L90 110 L50 110 L50 50 L34 50 Z" fill="#13103A" stroke="#A855F7" strokeWidth="1.8" />
      <path d="M50 110 L38 134 L70 122 L102 134 L90 110 Z" fill="#A855F7" opacity="0.5" stroke="#A855F7" strokeWidth="1" />
      <circle cx="70" cy="36" r="6" fill="#A855F7" opacity="0.8" />
      <circle cx="70" cy="36" r="2.5" fill="#fff" />
    </svg>
  ),
  turn: (
    <svg viewBox="0 0 140 140" width="100%" height="100%">
      <circle cx="70" cy="70" r="64" fill="#1A1A1A" stroke="#F5F0E8" strokeWidth="1.5" />
      <circle cx="70" cy="70" r="34" fill="none" stroke="#383838" strokeWidth="0.6" />
      <path d="M70 6 L74 50 L70 70 L66 50 Z" fill="#F5F0E8" opacity="0.7" />
      <path d="M134 70 L92 66 L70 70 L92 74 Z" fill="#F5F0E8" opacity="0.7" />
      <path d="M70 134 L66 90 L70 70 L74 90 Z" fill="#F5F0E8" opacity="0.7" />
      <path d="M6 70 L48 74 L70 70 L48 66 Z" fill="#F5F0E8" opacity="0.7" />
      <circle cx="70" cy="70" r="10" fill="#1A1A1A" stroke="#F5F0E8" strokeWidth="1" />
      <circle cx="70" cy="70" r="3" fill="#F5F0E8" />
    </svg>
  ),
};

export default function HouseCoatOfArms({ houseId, size = 80 }) {
  const svg = SVGS[houseId];
  return (
    <div style={{ width: size, height: size, display: 'inline-flex' }}>
      {svg || null}
    </div>
  );
}
