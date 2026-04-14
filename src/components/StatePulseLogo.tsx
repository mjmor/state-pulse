/**
 * StatePulse brand mark — simplified abstract US silhouette with an EKG pulse line.
 *
 * The US map strokes with `currentColor` so it inherits the parent's text colour
 * (dark green on light backgrounds, ivory on the dark-green sidebar).
 * The pulse line is always rendered in the brand orange (#E8781E).
 *
 * viewBox: 56 × 36
 */
export function StatePulseLogo({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  // Maintain the 56:36 aspect ratio
  const width = Math.round((size * 56) / 36);

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 56 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="StatePulse logo"
      role="img"
    >
      {/* ── Continental US silhouette ────────────────────────────────────── */}
      <path
        d="
          M 5,9
          Q 6,6 9,6
          L 26,4
          L 44,4 48,3
          Q 53,2 55,6
          Q 56,9 56,13
          L 55,17
          Q 56,21 54,24
          L 53,27
          Q 52,31 51,33
          L 49,35
          Q 47,36 46,34
          Q 44,32 43,30
          Q 41,29 40,31
          L 36,33
          Q 28,35 22,34
          Q 16,33 14,30
          L 12,27
          L 10,31
          Q 7,30 5,25
          Q 3,21 4,15
          Q 3,12 5,9
          Z
        "
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── EKG / heartbeat pulse line ───────────────────────────────────── */}
      <polyline
        points="6,19 15,19 17,17 19,19 22,19 23,25 25,8 27,27 29,19 31,14 33,19 50,19"
        fill="none"
        stroke="#E8781E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
