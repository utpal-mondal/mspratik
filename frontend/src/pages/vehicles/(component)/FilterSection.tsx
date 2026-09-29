import { Search, X, ChevronDown } from "lucide-react";

interface FilterSectionProps {
  searchQuery: string;
  vehicleType: string;
  onSearchChange: (value: string) => void;
  onVehicleTypeChange: (value: string) => void;
  onReset: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  searchQuery,
  vehicleType,
  onSearchChange,
  onVehicleTypeChange,
  onReset,
}) => {
  const hasFilters = searchQuery !== "" || vehicleType !== "";

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
      <div className="relative w-full max-w-xs">
        <Search
          className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={13}
        />
        <input
          type="text"
          placeholder="Search number, owner or RC..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-7 py-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
        />
        {searchQuery !== "" && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title="Clear search"
          >
            <X size={11} />
          </button>
        )}
      </div>

      <div className="relative">
        <select
          value={vehicleType}
          onChange={(e) => onVehicleTypeChange(e.target.value)}
          className="appearance-none pl-3 pr-7 py-1.5 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-gray-700 capitalize"
        >
          <option value="">All Types</option>
          <option value="self">Self</option>
          <option value="others">Others</option>
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="px-2.5 py-1.5 text-[11px] text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
};

export default FilterSection;
