import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";

interface UpdatePageHeaderProps {
  saving: boolean;
  onCancel: () => void;
}

const UpdatePageHeader: React.FC<UpdatePageHeaderProps> = ({ saving, onCancel }) => {
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
        <h3 className="m-0 text-xl leading-[1.2] font-semibold text-[#0F2A47]">
          Update Route
        </h3>
        <div className="text-[13px] text-[#4D5B6A]">
          Update the route and its start, via and end points.
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-10 min-w-[88px] px-5 bg-white text-[#0F2A47] border border-[#C5CFDB] rounded font-medium text-[13px] cursor-pointer transition-colors hover:bg-[#F1F4F8] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 h-10 px-5 bg-[#0F2A47] text-white border border-[#0F2A47] rounded font-medium text-[13px] cursor-pointer transition-colors hover:bg-[#17395E] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={15} />
          {saving ? "Updating..." : "Update Route"}
        </button>
      </div>
    </div>
  );
};

export default UpdatePageHeader;
