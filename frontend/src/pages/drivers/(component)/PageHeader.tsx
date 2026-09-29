import Link from "next/link";
import { ChevronDown } from "lucide-react";

const PageHeader: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              <ChevronDown size={14} className="rotate-90" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Driver Entry</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
