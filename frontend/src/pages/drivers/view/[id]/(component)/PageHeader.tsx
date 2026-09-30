import Link from "next/link";
import { ChevronDown, User, Pencil } from "lucide-react";

interface PageHeaderProps {
  driverName?: string;
  driverId?: number;
}

const PageHeader: React.FC<PageHeaderProps> = ({ driverName, driverId }) => {
  return (
    <div className=" flex items-center justify-between">
      <div className="flex items-center">
        <Link
          href="/drivers"
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mr-2"
        >
          <ChevronDown size={16} className="rotate-90" />
        </Link>
        <div className="w-9 h-9 bg-blue-50 flex items-center justify-center mr-3">
          <User size={18} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-gray-900">
            {driverName || "Driver Details"}
          </h1>
          <p className="text-xs text-gray-500">View driver information</p>
        </div>
      </div>

      {/* {driverId && (
        <Link
          href={`/drivers/update?id=${driverId}`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          <Pencil size={12} />
          Edit
        </Link>
      )} */}
    </div>
  );
};

export default PageHeader;
