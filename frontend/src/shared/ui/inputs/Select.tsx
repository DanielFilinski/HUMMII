'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@shared/ui/icons/Icon';
import { Typography } from '@shared/ui/typography/Typography';
import type { IconName } from '@shared/ui/icons/Icon';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Список опций */
  options: SelectOption[];
  /** Выбранное значение */
  value?: string;
  /** Обработчик изменения значения */
  onChange?: (value: string) => void;
  /** Placeholder для поиска */
  placeholder?: string;
  /** Лейбл поля */
  label?: string;
  /** Состояние ошибки */
  error?: boolean;
  /** Текст ошибки */
  errorText?: string;
  /** Вспомогательный текст */
  helperText?: string;
  /** Неактивное состояние */
  disabled?: boolean;
  /** Полная ширина */
  fullWidth?: boolean;
  /** Разрешить поиск */
  searchable?: boolean;
  /** Иконка слева */
  leftIcon?: IconName;
  /** Дополнительный класс */
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  label,
  error = false,
  errorText,
  helperText,
  disabled = false,
  fullWidth = false,
  searchable = true,
  leftIcon,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  const inputClasses = `
    w-full
    px-4 py-3
    bg-surface-sunken
    text-text-primary
    text-base
    rounded-[10px]
    border
    transition-all
    duration-200
    cursor-pointer
    disabled:bg-surface-sunken
    disabled:text-text-disabled
    disabled:cursor-not-allowed
    disabled:border-border-secondary
    ${error ? 'border-feedback-error' : isOpen ? 'border-border-focus' : 'border-border-primary hover:border-border-focus'}
    ${leftIcon ? 'pl-11' : 'pl-4'}
    pr-10
  `;

  const dropdownClasses = `
    absolute
    top-full
    left-0
    right-0
    mt-2
    bg-background-card
    border
    border-border-primary
    rounded-[10px]
    shadow-lg
    max-h-64
    overflow-y-auto
    z-50
    scrollbar-custom
  `;

  const optionClasses = (isSelected: boolean, isHighlighted: boolean) => `
    px-4
    py-3
    cursor-pointer
    transition-colors
    duration-150
    ${isSelected ? 'bg-accent-tertiary text-text-primary' : 'text-text-primary'}
    ${isHighlighted && !isSelected ? 'bg-surface-hover' : ''}
    ${!isSelected && !isHighlighted ? 'hover:bg-surface-hover' : ''}
  `;

  const containerClasses = fullWidth ? 'w-full' : '';

  return (
    <div className={`relative ${containerClasses} ${className}`} ref={containerRef}>
      {label && (
        <label className="block mb-2">
          <Typography variant="bodySm" color="primary" weight="medium">
            {label}
          </Typography>
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Icon
              name={leftIcon}
              size="sm"
              color={error ? 'error' : disabled ? 'disabled' : 'secondary'}
            />
          </div>
        )}

        <div
          className={inputClasses}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
        >
          {searchable && isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent outline-none text-text-primary placeholder:text-text-tertiary"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={selectedOption ? 'text-text-primary' : 'text-text-tertiary'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isOpen && searchable ? (
            <button
              className="pointer-events-auto p-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setSearchQuery('');
              }}
              type="button"
            >
              <Icon name="x" size="sm" color={disabled ? 'disabled' : 'secondary'} />
            </button>
          ) : (
            <Icon
              name={isOpen ? 'arrow-up' : 'arrow-down'}
              size="sm"
              color={disabled ? 'disabled' : 'secondary'}
            />
          )}
        </div>
      </div>

      {isOpen && !disabled && (
        <div className={dropdownClasses}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <div
                  key={option.value}
                  className={optionClasses(isSelected, isHighlighted)}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <Typography
                    variant="body"
                    color={isSelected ? 'primary' : 'primary'}
                  >
                    {option.label}
                  </Typography>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3">
              <Typography variant="body" color="tertiary">
                No results found
              </Typography>
            </div>
          )}
        </div>
      )}

      {errorText && error && (
        <div className="mt-1.5">
          <Typography variant="note" color="error">
            {errorText}
          </Typography>
        </div>
      )}

      {helperText && !error && (
        <div className="mt-1.5">
          <Typography variant="note" color="secondary">
            {helperText}
          </Typography>
        </div>
      )}
    </div>
  );
};
