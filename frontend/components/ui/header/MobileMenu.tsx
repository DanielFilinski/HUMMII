import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { User, LogOut, LayoutDashboard, Briefcase, ShoppingBag, Check } from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
}

interface Locale {
  code: string;
  label: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  navItems: NavigationItem[];
  pathname: string;
  locale: string;
  availableLocales: Locale[];
  isAuthenticated: boolean;
  user?: {
    name?: string;
    email?: string;
  };
  activeRole?: string;
  onClose: () => void;
  onLocaleChange: (locale: string) => void;
  onLogout: () => void;
  languageLabel: string;
  signInLabel: string;
}

export function MobileMenu({
  isOpen,
  navItems,
  pathname,
  locale,
  availableLocales,
  isAuthenticated,
  user,
  activeRole,
  onClose,
  onLocaleChange,
  onLogout,
  languageLabel,
  signInLabel,
}: MobileMenuProps) {
  if (!isOpen) return null;

  const handleLocaleChange = (newLocale: string) => {
    onLocaleChange(newLocale);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="border-t border-gray-200 bg-white py-4 desktop:hidden">
      {/* Navigation Links */}
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
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
          {languageLabel}
        </div>
        <div className="space-y-1">
          {availableLocales.map((loc) => (
            <button
              key={loc.code}
              onClick={() => handleLocaleChange(loc.code)}
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

            <Link href={`/${locale}/dashboard`} onClick={onClose}>
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
            <Link href={`/${locale}/auth/login`} onClick={onClose}>
              <Button variant="primary" size="md" fullWidth>
                {signInLabel}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
