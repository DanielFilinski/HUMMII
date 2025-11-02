'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navigation component for protected actions examples
 * Shows links to example pages
 */
export function ProtectedActionsExamplesNav() {
  const pathname = usePathname();
  
  const examples = [
    {
      href: '/en/examples/simple-protected',
      title: 'Simple Example',
      description: 'Basic protected action',
      icon: '🔒',
    },
    {
      href: '/en/examples/protected-actions',
      title: 'Full Demo',
      description: 'All patterns & examples',
      icon: '🎯',
    },
  ];

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-blue-800 mb-2">
            Protected Actions Examples
          </p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <Link
                key={example.href}
                href={example.href}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  pathname === example.href
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-700 hover:bg-blue-100'
                }`}
              >
                <span>{example.icon}</span>
                <span>{example.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

