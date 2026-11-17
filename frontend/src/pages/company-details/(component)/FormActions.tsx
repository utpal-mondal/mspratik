import Link from "next/link";
import { Save } from "lucide-react";

interface FormActionsProps {
  saving: boolean;
  cancelHref?: string;
  submitLabel?: string;
}

const FormActions: React.FC<FormActionsProps> = ({
  saving,
  cancelHref = "/company-details",
  submitLabel = "Save Company",
}) => {
  return (
    <div className="flex items-center justify-end gap-3">
      <Link
        href={cancelHref}
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
        {saving ? "Saving..." : submitLabel}
      </button>
    </div>
  );
};

export default FormActions;
