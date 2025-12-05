/**
 * Dropdown Component
 *
 * A searchable dropdown component with:
 * - Search input field with clear button
 * - Filterable options list
 * - Selected state highlighting
 * - Custom scrollbar styling
 * - Keyboard navigation support
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/src/shared/lib/utils';
import { Typography } from '@/src/shared/ui/typography/Typography';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  /**
   * List of dropdown options
   */
  options: DropdownOption[];

  /**
   * Currently selected value
   */
  value?: string;

  /**
   * Change handler
   */
  onChange?: (value: string) => void;

  /**
   * Search input placeholder
   */
  placeholder?: string;

  /**
   * Label for the dropdown
   */
  label?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Full width
   */
  fullWidth?: boolean;

  /**
   * Enable search functionality
   */
  searchable?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  label,
  disabled = false,
  fullWidth = false,
  searchable = true,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(true); // Open by default as per design
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex].value);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };

  return (
    <div
      className={cn('relative', fullWidth ? 'w-full' : 'w-[600px]', className)}
      ref={containerRef}
    >
      {label && (
        <label className="block mb-2">
          <Typography variant="bodySm" color="primary" weight="medium">
            {label}
          </Typography>
        </label>
      )}

      {/* Search Input Field */}
      <div className="relative mb-2">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-6 py-4',
            'bg-white text-text-primary text-[24px]',
            'rounded-[32px]',
            'border-none outline-none',
            'placeholder:text-text-tertiary',
            'disabled:bg-surface-sunken disabled:text-text-disabled disabled:cursor-not-allowed',
            'shadow-sm'
          )}
        />

        {/* Clear Button (X) */}
        {searchQuery && (
          <button
            onClick={handleClear}
            className={cn(
              'absolute right-6 top-1/2 -translate-y-1/2',
              'w-6 h-6 flex items-center justify-center',
              'transition-all duration-200',
              'hover:opacity-70',
              'focus:outline-none'
            )}
            type="button"
            disabled={disabled}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Options List */}
      {isOpen && !disabled && (
        <div
          className={cn(
            'w-full',
            'bg-white',
            'rounded-[24px]',
            'shadow-lg',
            'max-h-[360px]',
            'overflow-y-auto',
            'py-2',
            'dropdown-scrollbar'
          )}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <div
                  key={option.value}
                  className={cn(
                    'px-6 py-4 mx-2',
                    'cursor-pointer',
                    'transition-all duration-200',
                    'rounded-[16px]',
                    isSelected && 'bg-[#D4F4C4]',
                    isHighlighted && !isSelected && 'bg-surface-hover',
                    !isSelected && !isHighlighted && 'hover:bg-surface-hover'
                  )}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <Typography
                    variant="bodyLg"
                    color="primary"
                    className="text-[20px]"
                  >
                    {option.label}
                  </Typography>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-4">
              <Typography variant="body" color="tertiary">
                No results found
              </Typography>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .dropdown-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .dropdown-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          margin: 8px 0;
        }

        .dropdown-scrollbar::-webkit-scrollbar-thumb {
          background: #6ab344;
          border-radius: 4px;
        }

        .dropdown-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5a9e38;
        }

        .dropdown-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #6ab344 transparent;
        }
      `}</style>
    </div>
  );
};
