import React, { useState, useRef, useEffect, useId } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';
import { audio } from '../../services/audioService';

export interface AutocompleteOption {
  id: string;
  label: string;
  subLabel?: string;
  category?: string;
  badge?: string;
  badgeColor?: 'cyan' | 'gold' | 'green' | 'red' | 'purple' | 'slate';
  icon?: React.ReactNode;
}

interface AutocompleteSelectProps {
  options: AutocompleteOption[];
  value: string;
  onChange: (value: string, option?: AutocompleteOption) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  renderOptionExtra?: (option: AutocompleteOption) => React.ReactNode;
}

export const AutocompleteSelect: React.FC<AutocompleteSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner ou rechercher...',
  label,
  required = false,
  disabled = false,
  className = '',
  renderOptionExtra
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const selectedOption = options.find(opt => opt.id === value);

  // Filter options based on search query
  const filteredOptions = options.filter(option => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      option.label.toLowerCase().includes(q) ||
      (option.subLabel && option.subLabel.toLowerCase().includes(q)) ||
      (option.category && option.category.toLowerCase().includes(q)) ||
      (option.badge && option.badge.toLowerCase().includes(q))
    );
  });

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current && filteredOptions.length > 0) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen, filteredOptions.length]);

  const handleSelect = (option: AutocompleteOption) => {
    audio.playSelect();
    onChange(option.id, option);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        audio.playClick();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % Math.max(1, filteredOptions.length));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + filteredOptions.length) % Math.max(1, filteredOptions.length));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };

  const badgeColorClasses = {
    cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    gold: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    red: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    slate: 'bg-slate-700/50 text-slate-300 border-slate-600'
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5 flex items-center justify-between">
          <span>{label} {required && <span className="text-sc-cyan">*</span>}</span>
          {selectedOption?.category && (
            <span className="text-[10px] text-sc-cyan/80 font-normal">[{selectedOption.category}]</span>
          )}
        </label>
      )}

      {/* Main Trigger Button / Input container */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            audio.playClick();
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }
        }}
        className={`w-full min-h-[42px] px-3 py-2 bg-sc-panel/90 border rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-all duration-200 ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-900/50 border-slate-800' :
          isOpen
            ? 'border-sc-cyan shadow-neon-cyan ring-1 ring-sc-cyan/50 bg-sc-panel'
            : 'border-sc-border hover:border-sc-cyan/60 hover:bg-sc-card'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {selectedOption?.icon && (
            <div className="shrink-0 text-sc-cyan">{selectedOption.icon}</div>
          )}
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm font-semibold text-slate-100 truncate">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-mono shrink-0 ${badgeColorClasses[selectedOption.badgeColor || 'cyan']}`}>
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-slate-400 font-sans truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                audio.playClick();
                onChange('', undefined);
                setSearchQuery('');
              }}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
              title="Effacer la sélection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sc-cyan' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-sc-panel/95 backdrop-blur-xl border border-sc-cyan/40 rounded-lg shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input */}
          <div className="p-2 border-b border-sc-border/60 bg-sc-card/60 flex items-center gap-2">
            <Search className="w-4 h-4 text-sc-cyan shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Tapez pour filtrer instantanément..."
              className="w-full bg-transparent border-none text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-0.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Results List */}
          <ul
            ref={listRef}
            className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-800/40 text-sm font-sans"
            role="listbox"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.id === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sc-cyan/15 text-sc-cyan'
                        : isHighlighted
                        ? 'bg-sc-card text-slate-100'
                        : 'text-slate-300 hover:bg-sc-card/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {opt.icon && (
                        <div className={`shrink-0 ${isSelected ? 'text-sc-cyan' : 'text-slate-400'}`}>
                          {opt.icon}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium truncate ${isSelected ? 'font-semibold text-sc-cyan' : ''}`}>
                            {opt.label}
                          </span>
                          {opt.badge && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-mono shrink-0 ${badgeColorClasses[opt.badgeColor || 'cyan']}`}>
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.subLabel && (
                          <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                            {opt.subLabel}
                          </p>
                        )}
                        {renderOptionExtra && renderOptionExtra(opt)}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-sc-cyan shrink-0" />
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-6 text-center text-xs font-mono text-slate-400">
                <p>Aucun résultat pour &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-[10px] text-slate-500 mt-1">Essayez un autre nom de minerai ou de blueprint</p>
              </li>
            )}
          </ul>

          {/* Quick Counter Footer */}
          <div className="px-3 py-1.5 bg-sc-dark/90 border-t border-sc-border/50 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>{filteredOptions.length} élément{filteredOptions.length > 1 ? 's' : ''} trouvé{filteredOptions.length > 1 ? 's' : ''}</span>
            <span className="text-slate-500">↑↓ Navigation | ↵ Valider</span>
          </div>
        </div>
      )}
    </div>
  );
};
