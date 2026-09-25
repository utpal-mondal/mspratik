import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { settingsApi } from '../../../lib/api'
import EditPasswordModal from './(component)/EditPasswordModal';
import Link from 'next/link';
import { 
  User,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronDown,
  Key
} from 'lucide-react';
import withAuth from '../../../components/withAuth';
import usePermission from '../../../hook/usePermission';
import AccessDenied from '../../../components/AccessDenied';

// types for Users
type  UsersData = 
  {
    id: number,
    name: string,
    username: string,
    email: string,
    role: string,
    active: boolean,
    lastLogin: string,
    avatar: string,
    isCadmin: string
  }[]
 


const UserPage = () => {
  const [users, setUsers] = useState<UsersData>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editPasswordUser, setEditPasswordUser] = useState<{ id: number; name: string } | null>(null);
  const { isCadmin } = usePermission();

  if (!isCadmin()) {
    return <AccessDenied />;
  }

  const getAllUsers = async (currentPage: number = page, currentLimit: number = limit) => {
    try {
      setLoading(true);
      const res = await settingsApi.getUsers(currentPage, currentLimit);
      if (res?.data) {
        const formattedUsers = res.data.map((user: any) => ({
          id: user.id,
          name: `${user.fname || ''} ${user.lname || ''}`.trim() || user.username,
          username: user.username,
          email: user.email,
          role: user.role || 'User',
          active: user.is_active,
          lastLogin: user.last_login ? new Date(user.last_login).toLocaleString() : 'Never',
          avatar: `${(user.fname || '')[0] || ''}${(user.lname || '')[0] || ''}`.toUpperCase() || user.username[0].toUpperCase(),
          isCadmin: user.is_cadmin || '0'
        }));
        setUsers(formattedUsers);
        setTotal(res.meta?.total || 0);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, [page, limit]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await settingsApi.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <>

      <main className="flex-1 p-2 md:p-3">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <Link href="/settings" className="text-gray-500 hover:text-gray-700">
                <ChevronDown size={14} className="rotate-90" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Users</h1>
                {/* <p className="text-xs text-gray-500">{total} users</p> */}
              </div>
            </div>
            <Link
              href="/settings/user/create"
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200 text-xs font-medium"
            >
              <Plus size={12} />
              <span>Add User</span>
            </Link>
          </div>
        </div>

        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-xs"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Active</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-xs text-gray-500">Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center">
                      <User className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="mt-1 text-xs text-gray-500">No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 ${getAvatarColor(user.name)} rounded-full flex items-center justify-center text-white font-semibold text-xs`}>
                            {user.avatar}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-800">{user.name}</p>
                            <p className="text-[10px] text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs text-gray-700">{user.username}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.active ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs text-gray-600">{user.lastLogin}</p>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end space-x-1">
                          {user.isCadmin !== "1" && (
                            <>
                              <Link
                                href={`/settings/user/edit/${user.id}`}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Edit2 size={12} />
                              </Link>
                              <button
                                onClick={() => setEditPasswordUser({ id: user.id, name: user.name })}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit Password"
                              >
                                <Key size={12} />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-gray-500">Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-gray-800"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-[10px] text-gray-500">
                {total > 0 ? `Page ${page} of ${totalPages}` : 'No data'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
                className="px-2 py-1 border border-gray-200 rounded text-[10px] text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || loading || totalPages === 0}
                className="px-2 py-1 border border-gray-200 rounded text-[10px] text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      <EditPasswordModal
        isOpen={!!editPasswordUser}
        onClose={() => setEditPasswordUser(null)}
        userId={editPasswordUser?.id || 0}
        userName={editPasswordUser?.name}
      />
    </>
  );
};

export default withAuth(UserPage);
