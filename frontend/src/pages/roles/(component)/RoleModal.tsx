import { useEffect, useRef, useState } from 'react';

interface PermissionCategory {
  category: string;
  permissions: { id: number; name: string }[];
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void> | void;
  editingRole: any;
  roleName: string;
  setRoleName: (name: string) => void;
  selectedPermissions: number[];
  setSelectedPermissions: (permissions: number[]) => void;
  allPermissions: PermissionCategory[];
  getPermissionLabel: (permId: number) => string;
}


const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRole,
  roleName,
  setRoleName,
  selectedPermissions,
  setSelectedPermissions,
  allPermissions,
  getPermissionLabel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [roleNameError, setRoleNameError] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const togglePermission = (permissionId: number) => {
    if (!selectedPermissions) {
      setSelectedPermissions([permissionId]);
      return;
    }
    setSelectedPermissions(
      selectedPermissions.includes(permissionId)
        ? selectedPermissions.filter(p => p !== permissionId)
        : [...selectedPermissions, permissionId]
    );
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      setRoleNameError('Role name is required');
      return;
    }

    setIsLoading(true);
    try {
      await onSave();
    } catch (error) {
      console.error('Error saving role:', error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {editingRole ? 'Edit Role' : 'Add New Role'}
          </h2>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
            <input
              type="text"
              id="roleName"
              value={roleName}
              onChange={(e) => {
                setRoleName(e.target.value);
                if (roleNameError) {
                  setRoleNameError('');
                }
              }}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm disabled:bg-gray-100 disabled:text-gray-500 ${roleNameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-800'}`}
              placeholder="Enter role name"
            />
            {roleNameError && (
              <p className="mt-1 text-xs text-red-600">{roleNameError}</p>
            )}
          </div>

          <div className="mb-4">
            <label className={`inline-flex items-center ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-gray-800 rounded border-gray-300 focus:ring-gray-800"
                checked={selectedPermissions.length === allPermissions.flatMap(cat => cat.permissions?.map(p => p.id) || []).length}
                disabled={isLoading}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPermissions(allPermissions.flatMap(cat => cat.permissions?.map(p => p.id) || []));
                  } else {
                    setSelectedPermissions([]);
                  }
                }}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Check All</span>
            </label>
          </div>

          {allPermissions && allPermissions.length > 0 ? allPermissions.map((category) => (
            category && category.permissions && category.permissions.length > 0 ? (
              <div key={category.category} className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">{category.category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {category.permissions.map((permission) => (
                    permission ? (
                      <label key={permission.id} className={`inline-flex items-start ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-gray-800 rounded border-gray-300 focus:ring-gray-800 mt-0.5"
                          checked={selectedPermissions.includes(permission.id)}
                          disabled={isLoading}
                          onChange={() => togglePermission(permission.id)}
                        />
                        <span className="ml-2 text-sm text-gray-700 leading-tight">{getPermissionLabel(permission.id)}</span>
                      </label>
                    ) : null
                  ))}
                </div>
              </div>
            ) : null
          )) : null}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;
