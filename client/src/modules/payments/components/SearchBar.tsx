import React, { useState, useEffect } from "react";
import { Input } from "../../../components/ui/input";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search by invoice no, client name, ref id...",
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(searchTerm);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm, onChange]);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-xs focus:ring-[#F97316]"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => {
            setSearchTerm("");
            onChange("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
