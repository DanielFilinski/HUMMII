'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Get current locale from pathname
  const locale = pathname.split('/')[1] || 'en';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: `/${locale}/categories`, label: 'Categories' },
    { href: `/${locale}/how-it-works`, label: 'How It Works' },
    { href: `/${locale}/post-task`, label: 'Post a Task' },
    { href: `/${locale}/become-contractor`, label: 'Become a Contractor' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-200 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-1">
                <span className="text-2xl font-bold text-white">H</span>
              </div>
              <span className="ml-2 text-2xl font-bold text-text-primary">HUMMII</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 desktop:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg font-medium transition-colors hover:text-accent-1 ${
                  pathname === link.href ? 'text-accent-1' : 'text-text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side: Auth + Language */}
          <div className="hidden items-center gap-6 desktop:flex">
            {/* Language Switcher */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
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
                <span className="text-lg font-medium text-text-primary">
                  {locale.toUpperCase()}
                </span>
              </div>
              <button
                className="rotate-180 text-text-primary transition-transform hover:scale-110"
                aria-label="Change language"
              >
                <svg
                  className="h-6 w-6"
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

            {/* Sign In / Sign Up Button */}
            <Link href={`/${locale}/login`}>
              <Button
                size="lg"
                className="h-12 rounded-full bg-accent-1 px-8 text-lg font-medium text-white hover:bg-accent-2"
              >
                Sign in/ Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="desktop:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-gray-200 pb-4 pt-4 desktop:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg font-medium transition-colors hover:text-accent-1 ${
                    pathname === link.href ? 'text-accent-1' : 'text-text-primary'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-3">
                <Link href={`/${locale}/login`} onClick={() => setIsMenuOpen(false)}>
                  <Button
                    size="lg"
                    className="w-full rounded-full bg-accent-1 text-lg font-medium text-white hover:bg-accent-2"
                  >
                    Sign in/ Sign Up
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-2">
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
                  <span className="text-lg font-medium text-text-primary">
                    {locale.toUpperCase()}
                  </span>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}




