import Link from "next/link";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  total: number;
}

const PageHeader: React.FC<PageHeaderProps> = ({ total }) => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold tracking-[0.1em] uppercase text-[#4D6178]">
          Broker Master · {total} records
        </div>
        <h3 className="m-0 text-[24px] leading-[1.2] font-semibold text-[#0F2A47]">
          Brokers
        </h3>
        <div className="text-[15px] leading-[1.5] text-[#4D5B6A]">
          Manage your brokers and their details.
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/broker/create"
          className="flex items-center gap-2 h-11 px-5 bg-blue-700 text-white border border-blue-600 rounded font-medium text-sm cursor-pointer transition-colors hover:bg-blue-600"
        >
          <Plus size={15} />
          Add Broker
        </Link>
      </div>
    </div>
  );
};

export default PageHeader;
