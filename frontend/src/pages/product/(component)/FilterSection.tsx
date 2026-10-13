import { Search, X } from "lucide-react";

interface FilterSectionProps {
  title: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#D5DDE6]">
      <div className="text-base font-semibold text-[#0F2A47]">{title}</div>
      <div className="relative w-full max-w-[260px]">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8896]"
          size={14}
        />
        <input
          type="text"
          placeholder="Search product name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-9 pr-8 border border-[#C5CFDB] rounded bg-white text-[13px] text-[#17222E] placeholder-[#7B8896] focus:outline-none focus:ring-2 focus:ring-[#0F2A47]/20 focus:border-[#0F2A47]"
        />
        {searchQuery !== "" && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#7B8896] hover:text-[#3B4957] rounded transition-colors"
            title="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterSection;
