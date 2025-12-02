'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button/Button';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRole } from '@/hooks/use-role';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  Globe,
  User,
  LogOut,
  LayoutDashboard,
  Briefcase,
  ShoppingBag,
  Check,
} from 'lucide-react';

export function Header() {
  const t = useTranslations('landing.header');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuthStore();
  const { activeRole, isActiveClient, isActiveContractor } = useRole();

  // Navigation items for guests
  const guestNavItems = [
    { label: t('categories'), href: `/${locale}/categories` },
    { label: t('howItWorks'), href: `/${locale}/how-it-works` },
    { label: t('postTask'), href: `/${locale}/post-task` },
    { label: t('becomeContractor'), href: `/${locale}/become-contractor` },
  ];

  // Navigation items for authenticated clients
  const clientNavItems = [
    { label: t('categories'), href: `/${locale}/categories` },
    { label: 'My Tasks', href: `/${locale}/client/tasks` },
    { label: 'Find Contractors', href: `/${locale}/contractors` },
    { label: 'Messages', href: `/${locale}/messages` },
  ];

  // Navigation items for authenticated contractors
  const contractorNavItems = [
    { label: 'Browse Tasks', href: `/${locale}/tasks` },
    { label: 'My Services', href: `/${locale}/contractor/services` },
    { label: 'Messages', href: `/${locale}/messages` },
    { label: 'My Profile', href: `/${locale}/contractor/profile` },
  ];

  // Select navigation based on authentication and role
  const navItems = isAuthenticated
    ? isActiveContractor()
      ? contractorNavItems
      : clientNavItems
    : guestNavItems;

  const availableLocales = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'French' },
  ];

  const switchLocale = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    const newPathname = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPathname);
    setIsLanguageMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex-shrink-0">
            <Image
              src="/images/logo/name.svg"
              alt="Hummii"
              width={120}
              height={40}
              className="h-8 w-auto lg:h-10"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 desktop:flex xl:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-desktop-body-sm font-medium transition-colors hover:text-accent-1',
                  pathname === item.href
                    ? 'text-accent-1'
                    : 'text-text-primary'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-4 desktop:flex">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-desktop-body-sm font-medium text-text-primary transition-colors hover:bg-background-2"
                aria-label={t('language')}
              >
                <Globe className="h-5 w-5" />
                <span className="uppercase">{locale}</span>
              </button>

              {/* Language Dropdown */}
              {isLanguageMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsLanguageMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    {availableLocales.map((loc) => (
                      <button
                        key={loc.code}
                        onClick={() => switchLocale(loc.code)}
                        className={cn(
                          'flex w-full items-center justify-between px-4 py-3 text-left text-desktop-body-sm transition-colors hover:bg-accent-1/5',
                          locale === loc.code
                            ? 'bg-accent-1/10 text-accent-1'
                            : 'text-text-primary'
                        )}
                      >
                        <span>{loc.label}</span>
                        {locale === loc.code && (
                          <Check className="h-4 w-4 text-accent-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Role Badge */}
                {activeRole && (
                  <div className="flex items-center gap-2 rounded-lg bg-accent-1/10 px-3 py-1.5">
                    {activeRole === 'CONTRACTOR' ? (
                      <Briefcase className="h-4 w-4 text-accent-1" />
                    ) : (
                      <ShoppingBag className="h-4 w-4 text-accent-1" />
                    )}
                    <span className="text-desktop-body-sm font-medium text-accent-1">
                      {activeRole === 'CONTRACTOR' ? 'Contractor' : 'Client'}
                    </span>
                  </div>
                )}

                {/* User Menu */}
                <Link
                  href={`/${locale}/dashboard`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-desktop-body-sm font-medium text-text-primary transition-colors hover:bg-background-2"
                >
                  <User className="h-5 w-5" />
                  <span>{user?.name}</span>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href={`/${locale}/auth/login`}>
                <Button variant="primary" size="md">
                  {t('signInSignUp')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="desktop:hidden rounded-lg p-2 text-text-primary transition-colors hover:bg-background-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white py-4 desktop:hidden">
            {/* Navigation Links */}
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'rounded-lg px-4 py-3 text-mobile-body font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-accent-1/10 text-accent-1'
                      : 'text-text-primary hover:bg-background-2'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Language Selector (Mobile) */}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="mb-2 px-4 text-mobile-body-sm font-medium text-text-secondary">
                {t('language')}
              </div>
              <div className="space-y-1">
                {availableLocales.map((loc) => (
                  <button
                    key={loc.code}
                    onClick={() => switchLocale(loc.code)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-mobile-body transition-colors',
                      locale === loc.code
                        ? 'bg-accent-1/10 text-accent-1'
                        : 'text-text-primary hover:bg-background-2'
                    )}
                  >
                    <span>{loc.label}</span>
                    {locale === loc.code && (
                      <Check className="h-5 w-5 text-accent-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Auth Section (Mobile) */}
            <div className="mt-4 border-t border-gray-200 pt-4">
              {isAuthenticated ? (
                <div className="space-y-3 px-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 rounded-lg bg-background-2 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-1 text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-mobile-body font-medium text-text-primary">
                        {user?.name}
                      </div>
                      <div className="text-mobile-body-sm text-text-secondary">
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  {/* Role Badge */}
                  {activeRole && (
                    <div className="flex items-center gap-2 rounded-lg bg-accent-1/10 px-3 py-2">
                      {activeRole === 'CONTRACTOR' ? (
                        <Briefcase className="h-5 w-5 text-accent-1" />
                      ) : (
                        <ShoppingBag className="h-5 w-5 text-accent-1" />
                      )}
                      <span className="text-mobile-body font-medium text-accent-1">
                        {activeRole === 'CONTRACTOR'
                          ? 'Contractor Mode'
                          : 'Client Mode'}
                      </span>
                    </div>
                  )}

                  <Link
                    href={`/${locale}/dashboard`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" size="md" fullWidth className="gap-2">
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="px-4">
                  <Link
                    href={`/${locale}/auth/login`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="primary" size="md" fullWidth>
                      {t('signInSignUp')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}




