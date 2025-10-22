import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

const MultiSelect = ({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Select options",
  className = "",
  disabled = false,
  maxSelections = 10,
  searchable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSelect = (option) => {
    if (disabled) return;
    
    if (selectedValues.includes(option)) {
      // Remove if already selected
      onChange(selectedValues.filter(val => val !== option));
    } else if (selectedValues.length < maxSelections) {
      // Add if not at max selections
      onChange([...selectedValues, option]);
    }
  };

  const handleRemove = (value) => {
    if (disabled) return;
    onChange(selectedValues.filter(val => val !== value));
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Enter' && filteredOptions.length === 1) {
      handleSelect(filteredOptions[0]);
      setSearchTerm('');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Values Display */}
      <div
        className={`
          min-h-[44px] w-full px-3 py-2 border rounded-lg transition-colors cursor-pointer
          ${isOpen ? 'border-[#1F6FEB] ring-2 ring-[#1F6FEB] ring-opacity-20' : 'border-[#E6EEF8]'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          ${selectedValues.length > 0 ? 'py-2' : 'py-3'}
        `}
        onClick={handleToggle}
      >
        {selectedValues.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedValues.map((value, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#1F6FEB] text-white text-sm rounded-full"
              >
                <span className="truncate max-w-[150px]">{value}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(value);
                    }}
                    className="ml-1 hover:bg-[#1557c0] rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
            {selectedValues.length < maxSelections && (
              <span className="text-[#A6B4C8] text-sm self-center">
                +{maxSelections - selectedValues.length} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-[#A6B4C8]">{placeholder}</span>
        )}
        
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A6B4C8] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E6EEF8] rounded-lg shadow-lg max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-[#E6EEF8]">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search options..."
                className="w-full px-3 py-2 border border-[#E6EEF8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F6FEB] focus:border-transparent"
              />
            </div>
          )}
          
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between px-4 py-3 cursor-pointer transition-colors
                    ${selectedValues.includes(option) 
                      ? 'bg-[#F7F9FB] text-[#1F6FEB]' 
                      : 'hover:bg-[#F7F9FB] text-[#101827]'
                    }
                  `}
                  onClick={() => handleSelect(option)}
                >
                  <span className="truncate">{option}</span>
                  {selectedValues.includes(option) && (
                    <Check className="h-4 w-4 text-[#1F6FEB]" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-[#A6B4C8] text-sm">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            )}
          </div>
          
          {selectedValues.length > 0 && (
            <div className="p-2 border-t border-[#E6EEF8] bg-[#F7F9FB]">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-[#FF6B6B] hover:text-[#ff5252] transition-colors"
              >
                Clear all selections
              </button>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-1 text-xs text-[#A6B4C8]">
        {selectedValues.length > 0 && (
          <span>
            {selectedValues.length}/{maxSelections} selected
          </span>
        )}
        {selectedValues.length === 0 && (
          <span>Click to select options</span>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
