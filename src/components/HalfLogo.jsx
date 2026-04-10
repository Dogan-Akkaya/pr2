export default function HalfLogo({ color = "#E8463A", width = 120 }) {
  return (
    <svg viewBox="0 0 200 110" width={width} style={{ display: "block" }}>
      <path d="M20 108 A80 80 0 0 1 180 108" fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" />
      <path d="M48 108 A52 52 0 0 1 152 108" fill="none" stroke={color} strokeWidth="15" strokeLinecap="round" />
    </svg>
  );
}
