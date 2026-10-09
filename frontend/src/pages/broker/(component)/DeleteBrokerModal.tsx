import { AlertTriangle } from "lucide-react";

interface DeleteBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  brokerName?: string;
  isDeleting?: boolean;
}

const DeleteBrokerModal: React.FC<DeleteBrokerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  brokerName,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-50 text-red-600 shrink-0">
            <AlertTriangle size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Delete Broker</h2>
            <p className="mt-1 text-xs text-gray-500">
              Are you sure you want to delete
              {brokerName ? (
                <span className="font-semibold text-gray-700 capitalize"> {brokerName}</span>
              ) : (
                " this broker"
              )}
              ? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition-colors text-xs font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBrokerModal;
