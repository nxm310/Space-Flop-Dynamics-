import React, { useState, useEffect, useRef } from 'react';
import { searchStarCitizenItems, SCItemDefinition, STAR_CITIZEN_DATABASE } from '../data/starCitizenDatabase';
import { Search, Sparkles, ChevronDown, Check, Layers } from 'lucide-react';

interface AutocompleteSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: SCItemDefinition) => void;
  filterCategory?: string;
  placeholder?: string;
  className?: string;
  minChars?: number;
  label?: string;
}

export const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({
  value,
  onChange,
  onSelect,
  filterCategory,
  placeholder = 'Tapez 3 lettres (ex: Quan, Bex, CF-337, FR-86)...',
  className = '',
  minChars = 2,
  label
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [results, setResults] = useState<SCItemDefinition[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search when query changes
  useEffect(() => {
    if (value && value.trim().length >= minChars) {
      const matches = searchStarCitizenItems(value, filterCategory, 12);
      setResults(matches);
      setIsOpen(matches.length > 0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [value, filterCategory, minChars]);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SCItemDefinition) => {
    onChange(item.name);
    if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Minerai Raffiné': return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
      case 'Minerai Brut': return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'Gemme FPS': return 'bg-purple-950/80 text-purple-300 border-purple-500/40';
      case 'Salvage & Matériaux': return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      case 'Armement Vaisseau': return 'bg-red-950/80 text-rose-300 border-rose-500/40';
      case 'Composant Vaisseau': return 'bg-sky-950/80 text-sky-300 border-sky-500/40';
      case 'Arme FPS': return 'bg-orange-950/80 text-orange-300 border-orange-500/40';
      case 'Armure FPS': return 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-slate-300 mb-1 font-mono text-xs">{label}</label>}

      <div className="relative">
        <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen && e.target.value.length >= minChars) setIsOpen(true);
          }}
          onFocus={() => {
            if (value && value.length >= minChars) {
              const matches = searchStarCitizenItems(value, filterCategory, 12);
              setResults(matches);
              setIsOpen(matches.length > 0);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all placeholder-slate-500"
        />

        {value.length >= minChars && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-cyan-400/80 bg-slate-800 px-1.5 py-0.5 rounded">
            {results.length} trouvé{results.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-slate-950/95 border border-cyan-500/50 rounded-xl shadow-2xl backdrop-blur-md p-1.5 space-y-1 divide-y divide-slate-800/40 font-mono text-xs">
          <div className="px-2 py-1 text-[10px] text-slate-400 uppercase tracking-widest flex items-center justify-between border-b border-slate-800">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Base Officielle Star Citizen</span>
            </span>
            <span className="text-cyan-400 text-[9px]">Cliquez pour sélectionner</span>
          </div>

          {results.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className="p-2 hover:bg-cyan-950/50 hover:border-cyan-500/40 rounded-lg cursor-pointer transition-all flex items-center justify-between gap-3 group"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.name}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>

                {item.description && (
                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block">
                  Unité : <strong className="text-slate-200">{item.defaultUnit}</strong>
                </span>
                {item.unitValueUEC && (
                  <span className="text-[10px] text-amber-400 font-bold">
                    ~{item.unitValueUEC.toLocaleString()} aUEC
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
