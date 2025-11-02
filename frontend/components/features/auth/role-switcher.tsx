'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { UserRole } from '@/types';
import { useState } from 'react';
import { 
  Briefcase,      // CLIENT icon
  Wrench,         // CONTRACTOR icon
  Shield,         // SHIELD icon for ADMIN
  ChevronDown 
} from 'lucide-react';

/**
 * RoleSwitcher component - allows users to switch between their roles
 * Security: Only shows roles that user actually has
 * UX: Persists selection in localStorage via zustand persist
 */
export function RoleSwitcher() {
  const { user, activeRole, setActiveRole } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  // Security: Only show if user has multiple roles
  if (!user || user.roles.length <= 1) {
    return null;
  }

  const roleConfig: Record<UserRole, {
    label: string;
    icon: typeof Briefcase;
    color: string;
    description: string;
  }> = {
    CLIENT: {
      label: 'Client Mode',
      icon: Briefcase,
      color: 'bg-blue-500',
      description: 'Create orders, hire contractors',
    },
    CONTRACTOR: {
      label: 'Contractor Mode',
      icon: Wrench,
      color: 'bg-green-500',
      description: 'Respond to orders, offer services',
    },
    ADMIN: {
      label: 'Admin Mode',
      icon: Shield,
      color: 'bg-purple-500',
      description: 'Platform management',
    },
  };

  const currentRole = activeRole ? roleConfig[activeRole] : roleConfig[user.roles[0]];
  const CurrentIcon = currentRole.icon;

  return (
    <div className="relative">
      {/* Current Role Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        aria-label="Switch role"
        aria-expanded={isOpen}
      >
        <div className={`p-1.5 rounded ${currentRole.color} text-white`}>
          <CurrentIcon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-gray-900">{currentRole.label}</span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <p className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wide font-semibold">
                Switch Mode
              </p>
              
              {user.roles.map((role) => {
                const config = roleConfig[role];
                const Icon = config.icon;
                const isActive = activeRole === role;

                return (
                  <button
                    key={role}
                    onClick={() => {
                      setActiveRole(role);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left
                      transition-colors
                      ${isActive 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                      }
                    `}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <div className={`p-2 rounded ${config.color} text-white flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {config.label}
                        </span>
                        {isActive && (
                          <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {config.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

