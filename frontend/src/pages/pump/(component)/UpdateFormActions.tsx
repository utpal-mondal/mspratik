import Link from "next/link";
import { Save } from "lucide-react";

interface UpdateFormActionsProps {
  saving: boolean;
}

const UpdateFormActions: React.FC<UpdateFormActionsProps> = ({ saving }) => {
  return (
    <div className="flex items-center justify-end gap-3">
      <Link
        href="/pump"
        className="flex items-center h-11 px-5 bg-white text-[#0F2A47] border border-[#C5CFDB] rounded font-medium text-sm transition-colors hover:bg-[#F1F4F8]"
      >
        Cancel
      </Link>
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 h-11 px-5 bg-blue-700 text-white border border-blue-400 rounded font-medium text-sm cursor-pointer transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save size={15} />
        {saving ? "Updating..." : "Update Pump"}
      </button>
    </div>
  );
};

export default UpdateFormActions;
