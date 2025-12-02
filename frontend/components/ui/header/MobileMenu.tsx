import Link from 'next/link';
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/lib/utils';
import { LanguageSelector } from './LanguageSelector';
import { User, LogOut, LayoutDashboard, Briefcase, ShoppingBag } from 'lucide-react';

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
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 desktop:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={cn(
          'fixed right-0 top-[60px] z-50 h-[calc(100vh-60px)] w-80 transform overflow-y-auto border-l border-gray-200 bg-white shadow-xl transition-transform duration-300 desktop:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-4">
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

          {/* Language Selector Component */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <LanguageSelector
              currentLocale={locale}
              availableLocales={availableLocales}
              onLocaleChange={handleLocaleChange}
              label={languageLabel}
            />
          </div>

          {/* Auth Section (Mobile) */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-3 rounded-lg bg-background-2 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-1 text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate text-mobile-body font-medium text-text-primary">
                      {user?.name}
                    </div>
                    <div className="truncate text-mobile-body-sm text-text-secondary">
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
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
