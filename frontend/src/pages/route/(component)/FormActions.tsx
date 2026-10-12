import { Save } from "lucide-react";

interface FormActionsProps {
  saving: boolean;
  secondaryLabel: string;
  submitLabel: string;
  onSecondary: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  saving,
  secondaryLabel,
  submitLabel,
  onSecondary,
}) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onSecondary}
        disabled={saving}
        className="h-10 min-w-[88px] px-5 bg-white text-[#0F2A47] border border-[#C5CFDB] rounded font-medium text-[13px] cursor-pointer transition-colors hover:bg-[#F1F4F8] disabled:opacity-50"
      >
        {secondaryLabel}
      </button>
      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 h-10 px-5 bg-blue-700 text-white border border-blue-600 rounded font-medium text-[13px] cursor-pointer transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save size={15} />
        {saving ? "Saving..." : submitLabel}
      </button>
    </div>
  );
};

export default FormActions;
