import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  locale: string;
}

export function Logo({ locale }: LogoProps) {
  return (
    <Link href={`/${locale}`} className="flex-shrink-0">
      {/* Mobile logo */}
      <Image
        src="/images/logo/Logo.svg"
        alt="Hummii"
        width={40}
        height={40}
        className="h-8 w-auto mobile:block tablet:hidden desktop:hidden"
        priority
      />
      {/* Desktop and Tablet logo */}
      <Image
        src="/images/logo/name.svg"
        alt="Hummii"
        width={120}
        height={40}
        className="h-8 w-auto mobile:hidden tablet:block desktop:block lg:h-10"
        priority
      />
    </Link>
  );
}
