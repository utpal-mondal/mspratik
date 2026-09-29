import Link from "next/link";
import { ChevronDown, Truck } from "lucide-react";

const PageHeader: React.FC = () => {
  return (
    <div className=" flex items-center">
      <Link
        href="/vehicles"
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mr-2"
      >
        <ChevronDown size={16} className="rotate-90" />
      </Link>
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
        <Truck size={18} className="text-blue-600" />
      </div>
      <div>
        <h1 className="text-sm font-semibold text-gray-900">Create Vehicle</h1>
        <p className="text-xs text-gray-500">Add a new vehicle to your fleet</p>
      </div>
    </div>
  );
};

export default PageHeader;
