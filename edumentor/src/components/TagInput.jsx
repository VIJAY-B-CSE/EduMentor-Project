import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';

const TagInput = ({ 
  tags = [], 
  onChange, 
  placeholder = "Enter comma-separated values", 
  maxTags = 50,
  className = "",
  disabled = false 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const addTag = (tagText) => {
    const trimmedTag = tagText.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      const newTags = [...tags, trimmedTag];
      onChange(newTags);
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (e) => {
    if (disabled) return;
    setInputValue(e.target.value);
  };

  const handlePaste = (e) => {
    if (disabled) return;
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const tagsToAdd = pastedText
      .split(/[,\n]/)
      .map(tag => tag.trim())
      .filter(tag => tag && !tags.includes(tag));
    
    if (tagsToAdd.length > 0) {
      const newTags = [...tags, ...tagsToAdd.slice(0, maxTags - tags.length)];
      onChange(newTags);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue.trim()) {
      addTag(inputValue);
      setInputValue('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          min-h-[44px] w-full px-3 py-2 border rounded-lg transition-colors
          ${isFocused ? 'border-[#1F6FEB] ring-2 ring-[#1F6FEB] ring-opacity-20' : 'border-[#E6EEF8]'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-text'}
          ${tags.length > 0 ? 'py-2' : 'py-3'}
        `}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {/* Tags Display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#F7F9FB] text-[#101827] text-sm rounded-full border border-[#E6EEF8]"
              >
                <span className="truncate max-w-[200px]">{tag}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(tag);
                    }}
                    className="ml-1 hover:bg-[#E6EEF8] rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3 text-[#A6B4C8] hover:text-[#FF6B6B]" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
          disabled={disabled}
          className={`
            w-full border-none outline-none bg-transparent text-[#101827] placeholder-[#A6B4C8]
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
        />
      </div>

      {/* Helper Text */}
      <div className="mt-1 text-xs text-[#A6B4C8]">
        {tags.length > 0 && (
          <span>
            {tags.length}/{maxTags} tags • Press Enter or comma to add
          </span>
        )}
        {tags.length === 0 && (
          <span>Type and press Enter or comma to add tags</span>
        )}
      </div>
    </div>
  );
};

export default TagInput;
