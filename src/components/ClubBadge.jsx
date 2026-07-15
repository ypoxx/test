/**
 * ClubBadge — generisches Vereinswappen als Inline-SVG (Schild-Form).
 *
 * Rendert ein flaches Vektor-Badge im "Flutlicht-Gold"-Stil der App:
 * Grundfarbe aus dem übergebenen Farbton, helle Akzentstreifen, zentriertes
 * 2-3-Buchstaben-Kürzel. Für `short === 'MSV'` wird ein Special-Case mit
 * blau-weißen Zebra-Streifen und Gold-Kontur gerendert.
 *
 * Die Komponente ist bewusst dependency-frei und wird (noch) nirgends
 * importiert — Phase 2 legt sie nur als Baustein an.
 *
 * @param {object} props
 * @param {string} props.short - Vereinskürzel, 2-3 Buchstaben (z. B. "MSV", "RWE", "S04").
 * @param {number} [props.hue=215] - Farbton (0-360) für die Grundfarbe hsl(hue 65% 32%). Bei "MSV" ignoriert.
 * @param {number} [props.size=40] - Breite in px; die Höhe ergibt sich aus dem Schild-Seitenverhältnis (48:56).
 * @returns {JSX.Element} Inline-SVG-Wappen.
 */
export default function ClubBadge({ short, hue = 215, size = 40 }) {
  const label = String(short || '?').toUpperCase().slice(0, 3);
  const isMsv = label === 'MSV';

  const base = `hsl(${hue} 65% 32%)`;
  const light = `hsl(${hue} 55% 46%)`;
  const dark = `hsl(${hue} 70% 20%)`;

  // Schild-Form (48x56): flache Oberkante, spitz zulaufender Fuß.
  const shield = 'M24 2 L45 8 V26 C45 39 36 49 24 54 C12 49 3 39 3 26 V8 Z';
  // Eindeutige IDs, damit mehrere Badges auf einer Seite sich nicht in die Quere kommen.
  const clipId = `cb-clip-${isMsv ? 'msv' : `h${Math.round(hue)}`}-${label}`;

  return (
    <svg
      width={size}
      height={(size * 56) / 48}
      viewBox="0 0 48 56"
      role="img"
      aria-label={`Vereinswappen ${label}`}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={shield} />
        </clipPath>
      </defs>

      {/* Grundschild */}
      <path
        d={shield}
        fill={isMsv ? '#FFFFFF' : base}
        stroke={isMsv ? '#FFCB2D' : dark}
        strokeWidth="2"
      />

      <g clipPath={`url(#${clipId})`}>
        {isMsv ? (
          /* MSV: blau-weiße Zebra-Streifen, vertikal */
          <>
            <rect x="7" y="0" width="7" height="56" fill="#0A7AD1" />
            <rect x="20.5" y="0" width="7" height="56" fill="#0A7AD1" />
            <rect x="34" y="0" width="7" height="56" fill="#0A7AD1" />
          </>
        ) : (
          /* Generisch: zwei helle, schräge Akzentstreifen */
          <>
            <path d="M-4 40 L28 -6 L37 -6 L5 40 Z" fill={light} opacity=".55" />
            <path d="M8 46 L44 -4 L49 -4 L13 46 Z" fill={light} opacity=".3" />
          </>
        )}
        {/* Kopf-Balken als ruhiger Grund für das Kürzel */}
        <rect
          x="0"
          y="19"
          width="48"
          height="17"
          fill={isMsv ? '#0A2A5E' : dark}
          opacity={isMsv ? 1 : 0.85}
        />
      </g>

      {/* Innen-Hairline */}
      <path
        d="M24 5.2 L42 10.4 V25.6 C42 36.6 34.4 45.3 24 50 C13.6 45.3 6 36.6 6 25.6 V10.4 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity=".35"
        strokeWidth="1"
      />

      {/* Kürzel */}
      <text
        x="24"
        y="32.5"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Arial, sans-serif"
        fontSize={label.length > 2 ? 12.5 : 14}
        fontWeight="800"
        letterSpacing=".5"
        fill="#FFFFFF"
      >
        {label}
      </text>
    </svg>
  );
}
