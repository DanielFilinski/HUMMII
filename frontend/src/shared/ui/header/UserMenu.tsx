import Link from 'next/link';
import { User, LogOut, Briefcase, ShoppingBag } from 'lucide-react';
import { PrimaryButton } from '../button';

interface UserMenuProps {
  user: {
    name?: string;
    email?: string;
  };
  activeRole?: string;
  locale: string;
  onLogout: () => void;
}

export function UserMenu({ user, activeRole, locale, onLogout }: UserMenuProps) {
  return (
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

      <PrimaryButton
       
      >
        <LogOut className="h-4 w-4" />
        Logout
      </PrimaryButton>
    </div>
  );
}
