'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button/Button';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRole } from '@/hooks/use-role';
import { Logo } from './Logo';
import { Navigation } from './Navigation';
import { LanguageSelector } from './LanguageSelector';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { Menu, X } from 'lucide-react';

export function Header() {
  const t = useTranslations('landing.header');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuthStore();
  const { activeRole, isActiveContractor } = useRole();

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
  };

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto px-10">
        <div className="flex h-[60px] items-center justify-between py-[18px]">
          
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Logo locale={locale} />

            {/* Desktop Navigation */}
            <div className="hidden desktop:flex">
              <Navigation items={navItems} pathname={pathname} />
            </div>
          </div>
          

          {/* Desktop Actions */}
          <div className="hidden items-center gap-4 desktop:flex">
            {/* Language Selector */}
            <LanguageSelector
              currentLocale={locale}
              availableLocales={availableLocales}
              onLocaleChange={switchLocale}
              label={t('language')}
            />

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <UserMenu
                user={user}
                activeRole={activeRole}
                locale={locale}
                onLogout={handleLogout}
              />
            ) : (
              <Link href={`/${locale}/auth/login`}>
                <Button variant="primary" size="md">
                  {t('signInSignUp')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Actions - Always show Register button */}
          <div className="flex items-center gap-3 desktop:hidden">
            {/* Auth Button - Always visible */}
            {!isAuthenticated && (
              <Link href={`/${locale}/auth/login`}>
                <Button variant="primary" size="sm">
                  {t('signInSignUp')}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-text-primary transition-colors hover:bg-background-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        navItems={navItems}
        pathname={pathname}
        locale={locale}
        availableLocales={availableLocales}
        isAuthenticated={isAuthenticated}
        user={user}
        activeRole={activeRole}
        onClose={() => setIsMobileMenuOpen(false)}
        onLocaleChange={switchLocale}
        onLogout={handleLogout}
        languageLabel={t('language')}
        signInLabel={t('signInSignUp')}
      />
    </header>
  );
}




