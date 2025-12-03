import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  href: string;
}

interface NavigationProps {
  items: NavigationItem[];
  pathname: string;
}

export function Navigation({ items, pathname }: NavigationProps) {
  return (
    <nav className="hidden items-center gap-6 desktop:flex xl:gap-8">
      {items.map((item) => (
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
  );
}
