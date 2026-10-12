import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const CreatePageHeader: React.FC = () => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <Link
          href="/route"
          className="self-start -ml-2 flex items-center gap-1 h-7 px-2 rounded text-[#4D6178] hover:bg-[#E4EAF1] text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors w-fit"
        >
          <ChevronLeft size={14} />
          Route Master
        </Link>
        <h1 className="m-0 text-2xl leading-[1.2] font-semibold text-[#0F2A47]">
          Create Route
        </h1>
        <div className="text-[13px] text-[#4D5B6A]">
          Add a new route with start, via and end points.
        </div>
      </div>
    </div>
  );
};

export default CreatePageHeader;
