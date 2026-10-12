import { Save } from "lucide-react";

interface FormActionsProps {
  saving: boolean;
  onReset: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ saving, onReset }) => {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onReset}
        disabled={saving}
        className="h-11 px-5 bg-white text-[#0F2A47] border border-[#C5CFDB] rounded font-medium text-sm cursor-pointer transition-colors hover:bg-[#F1F4F8] disabled:opacity-50"
      >
        Reset
      </button>
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 h-11 px-5 bg-gray-400 text-white border border-gray-400 rounded font-medium text-sm cursor-pointer transition-colors hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save size={15} />
        {saving ? "Saving..." : "Save Client"}
      </button>
    </div>
  );
};

export default FormActions;
