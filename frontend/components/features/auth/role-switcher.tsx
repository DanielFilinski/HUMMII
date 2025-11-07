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
import { switchUserRole } from '@/lib/api/users';

/**
 * RoleSwitcher component - allows users to switch between their roles
 * Shows different UI based on user's role count:
 * - Single role (CLIENT or CONTRACTOR): Button to add the other role
 * - Two roles (CLIENT + CONTRACTOR): Button to switch between them
 * - Multiple roles including ADMIN: Dropdown menu for all roles
 */
export function RoleSwitcher() {
  const { user, activeRole, setActiveRole, setUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return null;
  }

  const hasClient = user.roles.includes('CLIENT');
  const hasContractor = user.roles.includes('CONTRACTOR');
  const hasAdmin = user.roles.includes('ADMIN');
  const roleCount = user.roles.length;
  const currentActiveRole = activeRole || user.roles[0];

  const roleConfig: Record<UserRole, {
    label: string;
    icon: typeof Briefcase;
    color: string;
    description: string;
    buttonColor: string;
    buttonHoverColor: string;
  }> = {
    CLIENT: {
      label: 'Client Mode',
      icon: Briefcase,
      color: 'bg-blue-500',
      description: 'Create orders, hire contractors',
      buttonColor: 'bg-blue-600',
      buttonHoverColor: 'hover:bg-blue-700',
    },
    CONTRACTOR: {
      label: 'Contractor Mode',
      icon: Wrench,
      color: 'bg-green-500',
      description: 'Respond to orders, offer services',
      buttonColor: 'bg-green-600',
      buttonHoverColor: 'hover:bg-green-700',
    },
    ADMIN: {
      label: 'Admin Mode',
      icon: Shield,
      color: 'bg-purple-500',
      description: 'Platform management',
      buttonColor: 'bg-purple-600',
      buttonHoverColor: 'hover:bg-purple-700',
    },
  };

  // Handle adding a new role via API
  const handleAddRole = async (roleToAdd: 'CLIENT' | 'CONTRACTOR') => {
    setIsLoading(true);
    try {
      const response = await switchUserRole(roleToAdd);
      
      // Update user in store with new roles
      setUser({
        ...user,
        roles: response.roles,
      });
      
      // Set the new role as active
      setActiveRole(roleToAdd);
    } catch (error: any) {
      console.error('Failed to switch role:', error);
      alert(error.response?.data?.message || 'Failed to switch role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle switching between existing roles (no API call needed)
  const handleSwitchRole = (roleToSwitch: UserRole) => {
    if (user.roles.includes(roleToSwitch)) {
      setActiveRole(roleToSwitch);
      setIsOpen(false);
    }
  };

  // Case 1: User has only CLIENT role - show button to add CONTRACTOR
  if (roleCount === 1 && hasClient) {
    const config = roleConfig.CONTRACTOR;
    const Icon = config.icon;

    return (
      <button
        onClick={() => handleAddRole('CONTRACTOR')}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 ${config.buttonColor} text-white rounded-lg ${config.buttonHoverColor} transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed`}
        aria-label="Switch to Contractor"
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {isLoading ? 'Loading...' : 'Switch to Contractor'}
        </span>
      </button>
    );
  }

  // Case 2: User has only CONTRACTOR role - show button to add CLIENT
  if (roleCount === 1 && hasContractor) {
    const config = roleConfig.CLIENT;
    const Icon = config.icon;

    return (
      <button
        onClick={() => handleAddRole('CLIENT')}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 ${config.buttonColor} text-white rounded-lg ${config.buttonHoverColor} transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed`}
        aria-label="Switch to Client"
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {isLoading ? 'Loading...' : 'Switch to Client'}
        </span>
      </button>
    );
  }

  // Case 3: User has both CLIENT and CONTRACTOR (and possibly ADMIN) - show switch button or dropdown
  if (hasClient && hasContractor) {
    // If user has only CLIENT + CONTRACTOR (2 roles), show simple switch button
    if (roleCount === 2) {
      const otherRole: UserRole = currentActiveRole === 'CLIENT' ? 'CONTRACTOR' : 'CLIENT';
      const otherConfig = roleConfig[otherRole];
      const OtherIcon = otherConfig.icon;

      return (
        <button
          onClick={() => handleSwitchRole(otherRole)}
          className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm`}
          aria-label={`Switch to ${otherConfig.label}`}
        >
          <div className={`p-1.5 rounded ${otherConfig.color} text-white`}>
            <OtherIcon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-gray-900">
            Switch to {otherConfig.label}
          </span>
        </button>
      );
    }

    // If user has ADMIN role or more than 2 roles, show dropdown
    const currentConfig = roleConfig[currentActiveRole as UserRole];
    const CurrentIcon = currentConfig.icon;

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          aria-label="Switch role"
          aria-expanded={isOpen}
        >
          <div className={`p-1.5 rounded ${currentConfig.color} text-white`}>
            <CurrentIcon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-gray-900">{currentConfig.label}</span>
          <ChevronDown 
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-2">
                <p className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wide font-semibold">
                  Switch Mode
                </p>
                {user.roles.map((role) => {
                  const config = roleConfig[role];
                  const Icon = config.icon;
                  const isActive = currentActiveRole === role;

                  return (
                    <button
                      key={role}
                      onClick={() => handleSwitchRole(role)}
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

  // Case 4: User has only ADMIN or other edge cases - show nothing or dropdown
  return null;
}

