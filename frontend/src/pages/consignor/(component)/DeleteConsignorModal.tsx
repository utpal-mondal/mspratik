import { AlertTriangle } from "lucide-react";

interface DeleteConsignorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  consignorName?: string;
  isDeleting?: boolean;
}

const DeleteConsignorModal: React.FC<DeleteConsignorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  consignorName,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-2 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Delete Consignor</h2>
            <p className="mt-1 text-xs text-gray-500">
              Are you sure you want to delete
              {consignorName ? (
                <span className="font-semibold text-gray-700"> {consignorName}</span>
              ) : (
                " this consignor"
              )}
              ? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConsignorModal;
