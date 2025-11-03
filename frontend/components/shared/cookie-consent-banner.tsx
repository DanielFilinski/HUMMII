'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { updateCookiePreferences } from '@/lib/api/users';
import { CookiePreferences } from '@/types';
import { useAuthStore } from '@/lib/store/auth-store';

const COOKIE_CONSENT_KEY = 'hummii_cookie_consent';

/**
 * Cookie Consent Banner Component
 * PIPEDA Compliance - allows users to manage cookie preferences
 * 
 * Features:
 * - Shows banner on first visit
 * - Stores preferences in localStorage for anonymous users
 * - Syncs with backend for authenticated users
 * - Supports i18n (EN/FR)
 */
export function CookieConsentBanner() {
  const t = useTranslations('cookieConsent');
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true (required)
    functional: true,
    analytics: false,
    marketing: false,
  });

  // Check if user has already set preferences
  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (!savedConsent) {
      // Show banner if no preferences saved
      setIsVisible(true);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        setPreferences(parsed);
      } catch (error) {
        console.error('Failed to parse cookie consent:', error);
        setIsVisible(true);
      }
    }
  }, []);

  const handleAcceptAll = async () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };

    await savePreferences(allAccepted);
  };

  const handleRejectAll = async () => {
    const allRejected: CookiePreferences = {
      essential: true, // Essential cannot be disabled
      functional: false,
      analytics: false,
      marketing: false,
    };

    await savePreferences(allRejected);
  };

  const handleAcceptSelected = async () => {
    await savePreferences(preferences);
  };

  const savePreferences = async (prefs: CookiePreferences) => {
    setIsSaving(true);

    try {
      // Always save to localStorage first
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));

      // If user is authenticated, sync with backend
      if (user) {
        await updateCookiePreferences(prefs);
      }

      toast.success(t('saved'));
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to save cookie preferences:', error);
      toast.error(t('error'));
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    // Essential cookies cannot be disabled
    if (key === 'essential') return;

    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto max-w-6xl p-6">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('title')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('description')}
            </p>
          </div>

          {/* Cookie Options (Collapsible) */}
          {isExpanded && (
            <div className="space-y-4 mb-6">
              {/* Essential Cookies */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.essential}
                  disabled
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <div className="flex-1">
                  <label className="block font-medium text-gray-900">
                    {t('essential.label')}
                  </label>
                  <p className="text-sm text-gray-600">
                    {t('essential.description')}
                  </p>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={() => togglePreference('functional')}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <label
                    className="block font-medium text-gray-900 cursor-pointer"
                    onClick={() => togglePreference('functional')}
                  >
                    {t('functional.label')}
                  </label>
                  <p className="text-sm text-gray-600">
                    {t('functional.description')}
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => togglePreference('analytics')}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <label
                    className="block font-medium text-gray-900 cursor-pointer"
                    onClick={() => togglePreference('analytics')}
                  >
                    {t('analytics.label')}
                  </label>
                  <p className="text-sm text-gray-600">
                    {t('analytics.description')}
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => togglePreference('marketing')}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <label
                    className="block font-medium text-gray-900 cursor-pointer"
                    onClick={() => togglePreference('marketing')}
                  >
                    {t('marketing.label')}
                  </label>
                  <p className="text-sm text-gray-600">
                    {t('marketing.description')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Learn More Link */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {t('learnMore')}{' '}
              <a
                href="/privacy-policy"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('privacyPolicy')}
              </a>
              {' '}and{' '}
              <a
                href="/cookie-policy"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('cookiePolicy')}
              </a>
              .
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAcceptAll}
              disabled={isSaving}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              {t('acceptAll')}
            </Button>

            {isExpanded && (
              <Button
                onClick={handleAcceptSelected}
                disabled={isSaving}
                variant="secondary"
                size="lg"
                className="flex-1 sm:flex-none"
              >
                {t('acceptSelected')}
              </Button>
            )}

            <Button
              onClick={handleRejectAll}
              disabled={isSaving}
              variant="outline"
              size="lg"
              className="flex-1 sm:flex-none"
            >
              {t('rejectAll')}
            </Button>

            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="lg"
              className="flex-1 sm:flex-none"
            >
              {isExpanded ? 'Show Less' : 'Customize'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

