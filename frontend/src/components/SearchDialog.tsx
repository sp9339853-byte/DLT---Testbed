import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { SearchResultItem } from '../types';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.search(trimmed);
        setResults(data);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex].link);
      }
    }
  };

  const handleSelect = (link: string) => {
    onClose();
    navigate(link);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-surface-warm border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] m-4"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border bg-background">
          <Search className="w-5 h-5 text-text-muted mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search benchmarks, experiments, reports, settings..."
            className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-base"
          />
          {loading && <Loader2 className="w-4 h-4 text-primary-interaction animate-spin shrink-0 mx-2" />}
          {query && !loading && (
            <button onClick={() => setQuery('')} className="p-1 text-text-muted hover:text-text-primary rounded">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-mono text-text-muted bg-surface-secondary border border-border rounded">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {query.trim() === '' && (
            <div className="p-6 text-center text-text-secondary">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-interaction">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <h4 className="font-medium text-text-primary mb-1">Quick Search</h4>
              <p className="text-xs text-text-muted mb-4">Jump directly to any page, benchmark result, or setting</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Benchmark Lab', 'Reports', 'PoS Heavy Load', 'Infrastructure', 'AI Advisor', 'Throughput'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="text-xs px-3 py-1.5 rounded-md bg-surface-secondary hover:bg-border text-text-primary border border-border transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() !== '' && !loading && results.length === 0 && (
            <div className="p-8 text-center text-text-secondary">
              <p className="text-base font-medium text-text-primary mb-1">No matching results found</p>
              <p className="text-xs text-text-muted">
                No benchmarks, experiments, or settings matched &ldquo;{query}&rdquo;.
              </p>
            </div>
          )}

          {results.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item.link)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary/10 border-primary-interaction/20 text-primary-interaction' : 'hover:bg-surface-secondary'
                }`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-text-primary text-sm truncate">{item.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-secondary text-text-muted border border-border">
                      {item.category}
                    </span>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary-interaction">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary truncate">{item.description}</p>
                </div>
                <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'translate-x-1 text-primary-interaction' : 'text-text-muted'}`} />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-surface-secondary/50 flex items-center justify-between text-[11px] text-text-muted">
          <span>Navigate with <kbd className="font-mono bg-surface-warm px-1 rounded border border-border">↑</kbd> <kbd className="font-mono bg-surface-warm px-1 rounded border border-border">↓</kbd></span>
          <span>Select with <kbd className="font-mono bg-surface-warm px-1 rounded border border-border">ENTER</kbd></span>
        </div>
      </div>
    </div>
  );
};
