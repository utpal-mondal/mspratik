import { Search, X } from "lucide-react";

interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  searchQuery,
  onSearchChange,
  onReset,
}) => {
  return (
    <div className="mb-2 flex items-center gap-1.5">
      <div className="relative w-full max-w-xs">
        <Search
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={12}
        />
        <input
          type="text"
          placeholder="Search name or phone..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-7 pr-6 py-1 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
        />
        {searchQuery !== "" && (
          <button
            type="button"
            onClick={onReset}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title="Clear search"
          >
            <X size={11} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterSection;
