

export function LaporKampusLogo({ width = 150, height = 36, className, ...props }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="currentColor"
      >
        Lapor Kampus
      </text>
    </svg>
  );
}
