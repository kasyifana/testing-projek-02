import type React from 'react';

interface LaporKampusLogoProps extends React.SVGProps<SVGSVGElement> {
  // Additional props can be defined here if needed
}

export function LaporKampusLogo({ width = 150, height = 36, className, ...props }: LaporKampusLogoProps) {
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
