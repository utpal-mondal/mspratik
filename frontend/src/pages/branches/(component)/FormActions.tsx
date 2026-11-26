import { Save } from "lucide-react";

interface FormActionsProps {
  saving: boolean;
  busy?: boolean;
  secondaryLabel: string;
  submitLabel: string;
  onSecondary: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  saving,
  busy = false,
  secondaryLabel,
  submitLabel,
  onSecondary,
}) => (
  <div className="flex items-center justify-end gap-2">
    <button
      type="button"
      onClick={onSecondary}
      disabled={saving || busy}
      className="h-10 min-w-[88px] rounded border border-[#C5CFDB] bg-white px-5 text-[13px] font-medium text-[#0F2A47] transition-colors hover:bg-[#F1F4F8] disabled:opacity-50"
    >
      {secondaryLabel}
    </button>
    <button
      type="submit"
      disabled={saving || busy}
      className="flex h-10 items-center justify-center gap-2 rounded border border-blue-600 bg-blue-700 px-5 text-[13px] font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Save size={15} />
      {saving ? "Saving..." : submitLabel}
    </button>
  </div>
);

export default FormActions;
