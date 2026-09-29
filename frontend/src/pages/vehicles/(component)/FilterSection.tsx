import { Search, X } from "lucide-react";

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
    <div className="mb-2 flex items-center gap-1.5">
      <div className="relative w-full max-w-xs">
        <Search
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={12}
        />
        <input
          type="text"
          placeholder="Search number, owner or RC..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-7 pr-6 py-1 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
        />
        {searchQuery !== "" && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title="Clear search"
          >
            <X size={11} />
          </button>
        )}
      </div>

      <select
        value={vehicleType}
        onChange={(e) => onVehicleTypeChange(e.target.value)}
        className="px-2 py-1 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-gray-700"
      >
        <option value="">All Types</option>
        <option value="self">Self</option>
        <option value="others">Others</option>
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="px-2 py-1 border border-gray-200 rounded-md text-[11px] text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
};

export default FilterSection;
