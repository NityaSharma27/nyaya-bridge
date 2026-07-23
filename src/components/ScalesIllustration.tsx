export function ScalesIllustration() {
  return (
    <svg
      viewBox="0 0 320 260"
      className="mx-auto h-48 w-auto md:h-56"
      role="img"
      aria-label="Illustration of scales balancing the old and new penal codes"
    >
      <rect x="130" y="228" width="60" height="8" rx="2" fill="#450920" opacity="0.85" />
      <polygon points="150,150 170,150 178,228 142,228" fill="#450920" opacity="0.75" />

      <rect x="157" y="60" width="6" height="92" fill="#450920" opacity="0.85" />
      <circle cx="160" cy="58" r="7" fill="#450920" />

      <g className="scales-beam" style={{ transformOrigin: "160px 58px" }}>
        <line x1="50" y1="58" x2="270" y2="58" stroke="#450920" strokeWidth="4" strokeLinecap="round" />

        {/* Left pan -- IPC */}
        <line x1="55" y1="60" x2="40" y2="118" stroke="#A53860" strokeWidth="1.5" />
        <line x1="55" y1="60" x2="70" y2="118" stroke="#A53860" strokeWidth="1.5" />
        <path
          d="M 30 118 Q 55 148 80 118"
          fill="#A53860"
          fillOpacity="0.2"
          stroke="#A53860"
          strokeWidth="2"
        />
        <text x="55" y="168" textAnchor="middle" fontSize="12" fill="#A53860" fontFamily="var(--font-mono)" letterSpacing="1">
          IPC
        </text>

        {/* Right pan -- BNS */}
        <line x1="265" y1="60" x2="250" y2="118" stroke="#DA627D" strokeWidth="1.5" />
        <line x1="265" y1="60" x2="280" y2="118" stroke="#DA627D" strokeWidth="1.5" />
        <path
          d="M 240 118 Q 265 148 290 118"
          fill="#DA627D"
          fillOpacity="0.2"
          stroke="#DA627D"
          strokeWidth="2"
        />
        <text x="265" y="168" textAnchor="middle" fontSize="12" fill="#DA627D" fontFamily="var(--font-mono)" letterSpacing="1">
          BNS
        </text>
      </g>
    </svg>
  );
}
