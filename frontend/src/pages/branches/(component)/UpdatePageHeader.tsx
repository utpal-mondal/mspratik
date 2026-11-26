import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const UpdatePageHeader: React.FC = () => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div className="flex flex-col gap-1">
      <Link
        href="/branches"
        className="flex h-7 w-fit items-center gap-1 self-start rounded px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4D6178] transition-colors hover:bg-[#E4EAF1] -ml-2"
      >
        <ChevronLeft size={14} />
        Branch Master
      </Link>
      <h1 className="m-0 text-2xl font-semibold leading-[1.2] text-[#0F2A47]">
        Update Branch
      </h1>
      <div className="text-[13px] text-[#4D5B6A]">
        Update branch details and contact information.
      </div>
    </div>
  </div>
);

export default UpdatePageHeader;
