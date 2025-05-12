import Image from 'next/image'

export function LaporKampusLogo({ width = 150, height = 36, className, ...props }) {
  return (
    <Image
      src="/LogoLaporKampus.png"
      alt="Lapor Kampus Logo"
      width={width}
      height={height}
      className={`mx-4 ${className || ''}`}
      priority={true}
      {...props}
    />
  )
}