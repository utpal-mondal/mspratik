import Link from "next/link";
import { ChevronLeft, Plus, Ship } from "lucide-react";

interface PageHeaderProps {
  total: number;
  onAddVessal: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ total, onAddVessal }) => {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <Link
          href="/dashboard"
          className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Back to dashboard"
        >
          <ChevronLeft size={16} />
        </Link>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 shrink-0">
          <Ship size={16} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-gray-900 leading-tight">
              Vessal
            </h1>
            <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-[10px] font-medium text-gray-600">
              {total}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 truncate">
            Manage vessals and pricing details
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddVessal}
        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-xs font-medium shrink-0"
      >
        <Plus size={13} />
        <span>Add Vessal</span>
      </button>
    </div>
  );
};

export default PageHeader;
