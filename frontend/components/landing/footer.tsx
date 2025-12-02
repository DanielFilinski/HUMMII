'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Footer() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const discoverLinks = [
    { href: `/${locale}/categories`, label: 'Categories' },
    { href: `/${locale}/how-it-works`, label: 'How It Works' },
    { href: `/${locale}/post-task`, label: 'Post a Task' },
    { href: `/${locale}/become-contractor`, label: 'Become a Tasker' },
  ];

  const companyLinks = [
    { href: `/${locale}/terms`, label: 'Terms and Conditions' },
    { href: `/${locale}/privacy`, label: 'Privacy Policy' },
    { href: `/${locale}/cookie-policy`, label: 'Cookie Policy' },
  ];

  const socialLinks = [
    { name: 'Instagram', href: '#', icon: 'instagram' },
    { name: 'Twitter', href: '#', icon: 'twitter' },
    { name: 'Facebook', href: '#', icon: 'facebook' },
  ];

  return (
    <footer className="w-full bg-white shadow-[0px_-10px_10px_0px_rgba(198,194,187,0.2)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Left: Discover */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-medium text-text-secondary">
              Discover
            </h3>
            <div className="flex flex-col gap-4">
              {discoverLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xl font-medium transition-colors hover:text-accent-1 ${
                    link.label === 'Become a Tasker'
                      ? 'text-accent-1'
                      : 'text-text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: Logo and Copyright */}
          <div className="flex flex-col items-center justify-between gap-6">
            <Link href={`/${locale}`} className="flex items-center">
              <div className="flex items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-1">
                  <span className="text-2xl font-bold text-white">H</span>
                </div>
                <span className="ml-2 text-2xl font-bold text-text-primary">HUMMII</span>
              </div>
            </Link>
            <p className="text-center text-base font-normal leading-6 text-black">
              © 2025 All rights reserved.
            </p>
          </div>

          {/* Right: Company Links and Social */}
          <div className="flex flex-col gap-8">
            {/* Company Links */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-medium text-text-secondary">
                Company
              </h3>
              <div className="flex flex-col gap-4">
                {companyLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xl font-medium text-text-primary transition-colors hover:text-accent-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Follow Us */}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-xl font-medium text-text-secondary">
                Follow Us
              </h3>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-accent-1"
                    aria-label={social.name}
                  >
                    <span className="text-xs font-bold text-gray-600 hover:text-white">
                      {social.icon.charAt(0).toUpperCase()}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-medium text-text-secondary">
                Language
              </h3>
              <div className="flex items-center gap-3">
                <svg
                  className="h-6 w-6 text-text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                <span className="text-xl font-medium text-text-primary">
                  {locale.toUpperCase()}
                </span>
                <button className="rotate-180 transition-transform hover:scale-110">
                  <svg
                    className="h-6 w-6 text-text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Need Help */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-medium text-text-secondary">
                Need Help?
              </h3>
              <Link href={`/${locale}/support`}>
                <Button
                  size="lg"
                  className="w-full rounded-full bg-accent-1 text-xl font-medium text-white hover:bg-accent-2"
                >
                  Contact support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}




