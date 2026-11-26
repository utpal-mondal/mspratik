import { Save } from "lucide-react";

interface FirmFormActionsProps {
  saving: boolean;
  mode: "create" | "edit";
  onCancel: () => void;
}

const FirmFormActions: React.FC<FirmFormActionsProps> = ({
  saving,
  mode,
  onCancel,
}) => (
  <div className="flex items-center justify-end gap-2">
    <button
      type="button"
      onClick={onCancel}
      disabled={saving}
      className="h-10 min-w-[88px] rounded border border-[#C5CFDB] bg-white px-5 text-[13px] font-medium text-[#0F2A47] transition-colors hover:bg-[#F1F4F8] disabled:opacity-50"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={saving}
      className="flex h-10 items-center justify-center gap-2 rounded border border-blue-600 bg-blue-700 px-5 text-[13px] font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Save size={15} />
      {saving ? "Saving..." : mode === "edit" ? "Update Firm" : "Save Firm"}
    </button>
  </div>
);

export default FirmFormActions;
