import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import Link from "next/link";
import { Shield, Plus, Edit2, Trash2, Search, ChevronDown, ChevronRight, } from "lucide-react";
import withAuth from "../../../components/withAuth";
import usePermission from "../../../hook/usePermission";
import AccessDenied from "../../../components/AccessDenied";
import RoleModal from "./(component)/RoleModal";
import DeleteConfirmationModal from "./(component)/DeleteConfirmationModal";
import { settingsApi } from "../../../lib/api";

interface BackendPermission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

interface BackendRole {
  id: number;
  name: string;
  guard_name: string;
  company_id: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  permissions: BackendPermission[];
}

interface Role {
  id: number;
  name: string;
  description: string;
  is_default: boolean;
  permissions: number[];
  userCount: number;
  color: string;
}

const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [roleName, setRoleName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [allPermissions, setAllPermissions] = useState<{ category: string; permissions: { id: number; name: string }[] }[]>([]);
  const { isCadmin } = usePermission();

  if (!isCadmin()) {
    return <AccessDenied />;
  }

  const getAllRolesData = async () => {
    try {
      const res = await settingsApi.getRoles();
      console.log("API response:", res);
      if (res && res.data && Array.isArray(res.data)) {
        const formattedRoles = res.data
          .filter((role: BackendRole) => role != null)
          .map((role: BackendRole) => ({
            id: role.id,
            name: role.name,
            description: role.name,
            is_default: role.is_default,
            permissions: role.permissions && Array.isArray(role.permissions) ? role.permissions.map((p) => p.id) : [],
            userCount: 0,
            color: "bg-gray-500",
          }));
        console.log("Roles formatted:", formattedRoles);
        setRoles(formattedRoles);
      } else {
        console.log("No valid data in response:", res);
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await settingsApi.getPermissions();
      if (res?.data && Array.isArray(res.data)) {
        console.log("Permissions fetched:", res.data);
        setAllPermissions(res.data);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  // Create a permission ID to name map
  const permissionMap = useMemo(() => {
    const map: Record<number, string> = {};
    allPermissions.forEach(category => {
      if (category && category.permissions && Array.isArray(category.permissions)) {
        category.permissions.forEach(permission => {
          if (permission) {
            map[permission.id] = permission.name;
          }
        });
      }
    });
    console.log("Permission map built:", map);
    return map;
  }, [allPermissions]);

  useEffect(() => {
    getAllRolesData();
    fetchPermissions();
  }, []);

  const filteredRoles = (roles || []).filter(
    (role) =>
      role &&
      (role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions || []);
    setRoleName(role.name);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingRole(null);
    setSelectedPermissions([]);
    setRoleName("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingRole) {
      try {
        const res = await settingsApi.updateRole(
          editingRole.id,
          roleName,
          selectedPermissions,
        );

        if (res?.data) {
          setRoles(
            roles.map((role) =>
              role.id === editingRole.id
                ? { ...role, name: roleName, permissions: selectedPermissions }
                : role,
            ),
          );
          toast.success("Role updated successfully");
        }
      } catch (error: any) {
        console.error("Error updating role:", error);
        toast.error(error?.response?.data?.message || "Failed to update role");
        return;
      }
    } else {
      try {
        const res = await settingsApi.createRole(
          roleName || "New Role",
          selectedPermissions,
        );
        if (res?.data) {
          const newRole = {
            id: res.data.id,
            name: res.data.name,
            description: res.data.name,
            is_default: res.data.is_default,
            permissions: selectedPermissions,
            userCount: 0,
            color: "bg-purple-500",
          };
          setRoles([...roles, newRole]);
          toast.success("Role created successfully");
        }
      } catch (error: any) {
        console.error("Error creating role:", error);
        toast.error(error?.response?.data?.message || "Failed to create role");
        return;
      }
    }
    setIsModalOpen(false);
    setEditingRole(null);
    setSelectedPermissions([]);
    setRoleName("");
  };

  const handleDelete = (roleId: number) => {
    setRoleToDelete(roleId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await settingsApi.deleteRole(roleToDelete);
      setRoles(roles.filter((role) => role.id !== roleToDelete));
      toast.success("Role deleted successfully");
    } catch (error: any) {
      console.error("Error deleting role:", error);
      toast.error(error?.response?.data?.message || "Failed to delete role");
    } finally {
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  const getPermissionLabel = (permId: number) => {
    return permissionMap[permId] || `ID: ${permId}`;
  };

  return (
    <>
      <Head>
        <title>Roles | A Unique Tell</title>
        <meta name="description" content="Manage roles and permissions" />
      </Head>

      <main className="flex-1 p-2 md:p-3 px-4 py-4">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-sm text-gray-700">
              <Link href="/settings" className="text-blue-600 text-[12px] underline underline-offset-2 hover:text-blue-700">
                Settings
              </Link>
              <ChevronRight size={14} className="text-gray-500" />
              <span className="font-medium text-gray-800">Roles</span>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200 text-xs font-medium"
            >
              <Plus size={12} />
              <span>Add Role</span>
            </button>
          </div>
          <p className="text-gray-500 text-xs">
            Manage user roles and their permissions
          </p>
        </div>

        <div className="mb-3">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={13}
            />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRoles && filteredRoles.length > 0 ? (
            filteredRoles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center flex-shrink-0">
                      <Shield size={13} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                        {role.name}
                      </h3>
                      <p className="text-xs text-gray-500 leading-tight">
                        {role.description}
                      </p>
                    </div>
                  </div>
                  {!role.is_default && (<div className="flex items-center space-x-0.5 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(role)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>)}
                </div>


                <div className="mb-1.5">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions && role.permissions.length > 0 ? (
                      <>
                        {role.permissions.slice(0, 3).map((permissionId) => (
                          <span
                            key={permissionId}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] leading-tight"
                          >
                            {getPermissionLabel(permissionId)}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] leading-tight">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </>
                    ) : (
                      <p className="text-[10px] text-gray-600">
                        No permission assigned
                      </p>
                    )}
                  </div>
                </div>


                {/* <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                  <span className="text-[10px] text-gray-500">
                    {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                  </span>
                  <span className="text-[10px] text-gray-400">{role.permissions.length} permissions</span>
                </div> */}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm col-span-3">No roles found</p>
          )}
        </div>

        <RoleModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRole(null);
            setSelectedPermissions([]);
            setRoleName("");
          }}
          onSave={handleSave}
          editingRole={editingRole}
          roleName={roleName}
          setRoleName={setRoleName}
          selectedPermissions={selectedPermissions}
          setSelectedPermissions={setSelectedPermissions}
          allPermissions={allPermissions}
          getPermissionLabel={getPermissionLabel}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setRoleToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Role"
          message="Are you sure you want to delete this role? This action cannot be undone."
        />
      </main>
    </>
  );
};

export default withAuth(RolesPage);
