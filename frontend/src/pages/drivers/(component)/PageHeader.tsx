import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";

interface PageHeaderProps {
  total: number;
}

const PageHeader: React.FC<PageHeaderProps> = ({ total }) => {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            <ChevronDown size={14} className="rotate-90" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Drivers</h1>
            <p className="text-xs text-gray-500">{total} drivers</p>
          </div>
        </div>
        <Link
          href="/drivers/create"
          className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-xs font-medium"
        >
          <Plus size={12} />
          <span>Add Driver</span>
        </Link>
      </div>
    </div>
  );
};

export default PageHeader;
