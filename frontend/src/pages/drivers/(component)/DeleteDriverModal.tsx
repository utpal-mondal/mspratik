interface DeleteDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  driverName?: string;
  isDeleting?: boolean;
}

const DeleteDriverModal: React.FC<DeleteDriverModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  driverName,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">Delete Driver</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete
          {driverName ? ` "${driverName}"` : " this driver"}? This action cannot
          be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDriverModal;
