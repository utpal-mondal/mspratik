import { Plus } from "lucide-react";

interface PageHeaderProps {
  total: number;
  onAdd: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ total, onAdd }) => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold tracking-[0.1em] uppercase text-[#4D6178]">
          Cargo Master · {total} records
        </div>
        <h3 className="m-0 text-[25px] leading-[1.2] font-semibold text-[#0F2A47]">
          Cargo
        </h3>
        <div className="text-[15px] leading-[1.5] text-[#4D5B6A]">
          Manage cargo and their availability status.
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 h-11 px-5 bg-[#0F2A47] text-white border border-[#0F2A47] rounded font-medium text-sm cursor-pointer transition-colors hover:bg-[#17395E]"
        >
          <Plus size={15} />
          Add Cargo
        </button>
      </div>
    </div>
  );
};

export default PageHeader;
