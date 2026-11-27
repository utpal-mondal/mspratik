import { Search } from "lucide-react";
import DateRangePicker, { type DateRange } from "@/components/ui/DateRangePicker";

interface FilterSectionProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateRange: DateRange | null;
  onDateRangeChange: (range: DateRange | null) => void;
}

const searchInputClass =
  "h-10 w-full rounded border border-[#C5CFDB] bg-white pl-9 pr-3 text-[13px] text-[#17222E] placeholder-[#7B8896] outline-none transition focus:border-[#0F2A47] focus:ring-2 focus:ring-[#0F2A47]/10";

const labelClass =
  "mb-1 block text-sm font-bold text-[#3B4957]";

const FilterSection: React.FC<FilterSectionProps> = ({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-full sm:w-80">
        <label className={labelClass}>Date</label>
        <DateRangePicker
          value={dateRange}
          onChange={onDateRangeChange}
          align="right"
          className="w-full"
          height={40}
        />
      </div>

      <div className="w-full sm:w-72">
        <label className={labelClass}>Search</label>
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8896]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search folio no, party, branch or remark..."
            className={searchInputClass}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
