import React, { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { ChevronDown, Search, X, Check, MapPin } from 'lucide-react';

interface SearchableDropdownProps<T> {
  options: T[];
  value?: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  labelKey?: keyof T;
  displayKey?: keyof T;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  optionClassName?: string;
  allowClear?: boolean;
  noResultsMessage?: string;
  onSearch?: (value: string) => void;
  buttonClassName?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
}

export function SearchableDropdown<T extends Record<string, any>>({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  labelKey = 'label' as keyof T,
  displayKey = labelKey,
  disabled = false,
  className = '',
  menuClassName = '',
  optionClassName = '',
  allowClear = true,
  noResultsMessage = 'No results found',
  onSearch,
  buttonClassName = '',
  showIcon = false,
  icon,
}: SearchableDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) => {
    const searchLower = searchTerm.toLowerCase();
    const displayValue = String(option[displayKey] || '').toLowerCase();
    return displayValue.includes(searchLower);
  });

  const selectedDisplay = value ? String(value[displayKey] || '') : '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
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

  const handleSelect = (option: T) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

 

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-2.5
          bg-white border border-gray-300 rounded-lg
          text-left text-gray-900
          hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
          transition-colors duration-200
          ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}
          ${buttonClassName}
        `}
      >
        <div className="flex items-center gap-2 flex-1">
          {showIcon && (icon || <MapPin size={15} strokeWidth={1.8} className="text-slate-400" />)}
          <span className={`truncate ${!selectedDisplay ? 'text-gray-500' : ''}`}>
            {selectedDisplay || placeholder}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {allowClear && selectedDisplay && (
            <X
              size={16}
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            />
          )}
          <ChevronDown
            size={18}
            className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className={`absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden ${menuClassName}`}>
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                  onSearch?.(e.target.value)
                }}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {noResultsMessage}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = value && String(value[labelKey]) === String(option[labelKey]);
                const isHighlighted = index === highlightedIndex;
                
                return (
                  <div
                    key={String(option[labelKey])}
                    onClick={() => handleSelect(option)}
                    className={`
                      px-4 py-2 cursor-pointer transition-colors duration-150
                      flex items-center justify-between
                      ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                      ${isHighlighted && !isSelected ? 'bg-gray-100' : ''}
                      hover:bg-gray-100
                    `}
                  >
                    <span className={`truncate ${optionClassName}`}>{String(option[displayKey] || '')}</span>
                    {isSelected && <Check size={16} className="text-blue-600" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
    
  );
}
