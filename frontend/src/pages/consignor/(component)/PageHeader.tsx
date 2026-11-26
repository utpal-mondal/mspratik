import { Plus } from "lucide-react";

interface PageHeaderProps {
  total: number;
  onAdd: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ total, onAdd }) => (
  <div className="flex flex-wrap items-end justify-between gap-5">
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4D6178]">
        Consignor Master · {total} records
      </div>
      <h1 className="m-0 text-[24px] font-semibold leading-[1.2] text-[#0F2A47]">
        Consignors
      </h1>
      <div className="text-[15px] leading-[1.5] text-[#4D5B6A]">
        Manage consignor names and contact details.
      </div>
    </div>
    <button
      type="button"
      onClick={onAdd}
      className="flex h-11 items-center gap-2 rounded border border-blue-600 bg-blue-700 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
    >
      <Plus size={15} />
      Add Consignor
    </button>
  </div>
);

export default PageHeader;
