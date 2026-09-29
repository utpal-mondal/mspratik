import Link from "next/link";
import { Save } from "lucide-react";

interface FormActionsProps {
  saving: boolean;
  onCancel?: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ saving, onCancel }) => {
  return (
    <div className="flex items-center justify-end gap-3">
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
      ) : (
        <Link
          href="/drivers"
          className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Cancel
        </Link>
      )}
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        <Save size={16} />
        {saving ? "Updating..." : "Update Driver"}
      </button>
    </div>
  );
};

export default FormActions;
