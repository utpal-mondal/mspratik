import Link from "next/link";
import { Save } from "lucide-react";

interface FormActionsProps {
  saving: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ saving }) => {
  return (
    <div className="flex items-center justify-end gap-4">
      <Link
        href="/settings"
        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
      >
        Cancel
      </Link>
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        <Save size={16} />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default FormActions;
