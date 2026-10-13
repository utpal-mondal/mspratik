import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
// import { settingsApi } from '../../../lib/api'
import EditPasswordModal from './(component)/EditPasswordModal';
import DeleteConfirmationModal from './(component)/DeleteConfirmationModal';
import Link from 'next/link';
import {
  User,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Key
} from 'lucide-react';
import usePermission from '@/hook/usePermission';
import AccessDenied from '@/components/AccessDenied';
import { settingsApi } from '@/lib/api';
import withAuth from '@/components/withAuth';
// import withAuth from '../../../components/withAuth';
// import usePermission from '../../../hook/usePermission';
// import AccessDenied from '../../../components/AccessDenied';

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
 


const thBase =
  "bg-slate-200 text-gray-500 text-left px-4 py-3.5 text-xs font-semibold tracking-[0.07em] uppercase whitespace-nowrap";
const tdBase =
  "px-4 py-3 border-b border-[#E6EBF1] text-[13px] font-medium text-gray-800 whitespace-nowrap";

const UserPage = () => {
  const [users, setUsers] = useState<UsersData>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editPasswordUser, setEditPasswordUser] = useState<{ id: number; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await settingsApi.deleteUser(deleteTarget.id);
      setUsers(users.filter(user => user.id !== deleteTarget.id));
      toast.success('User deleted successfully');
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
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

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const prevDisabled = page <= 1;
  const nextDisabled = page * limit >= total;

  const pagerBtn =
    "h-10 px-4 bg-white border border-[#D5DDE6] rounded text-[13px] font-medium transition-colors";

  return (
    <>

      <main className="flex-1 min-h-screen bg-[#F2F5F9] px-6 py-10 md:px-8 md:py-12 text-[#17222E]">
        <div className="mx-auto flex flex-col gap-7">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold tracking-[0.1em] uppercase text-[#4D6178]">
                User Master · {total} records
              </div>
              <h3 className="m-0 text-[24px] leading-[1.2] font-semibold text-[#0F2A47]">
                Users
              </h3>
              <div className="text-[15px] leading-[1.5] text-[#4D5B6A]">
                Manage users and their access details.
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/settings/user/create"
                className="flex items-center gap-2 h-11 px-5 bg-blue-700 text-white border border-blue-600 rounded font-medium text-sm cursor-pointer transition-colors hover:bg-blue-600"
              >
                <Plus size={15} />
                Add User
              </Link>
            </div>
          </div>

          <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#D5DDE6]">
              <div className="text-base font-semibold text-[#0F2A47]">User list</div>
              <div className="relative w-full max-w-[260px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8896]"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-8 border border-[#C5CFDB] rounded bg-white text-[13px] text-[#17222E] placeholder-[#7B8896] focus:outline-none focus:ring-2 focus:ring-[#0F2A47]/20 focus:border-[#0F2A47]"
                />
                {searchQuery !== "" && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#7B8896] hover:text-[#3B4957] rounded transition-colors"
                    title="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
                <thead>
                  <tr>
                    <th scope="col" className={`${thBase} pl-6`}>User</th>
                    <th scope="col" className={thBase}>Username</th>
                    <th scope="col" className={thBase}>Role</th>
                    <th scope="col" className={thBase}>Active</th>
                    <th scope="col" className={thBase}>Last Login</th>
                    <th scope="col" className={`${thBase} pr-6`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-[#5B6A7A]">Loading users...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <User className="mx-auto h-8 w-8 text-[#C5CFDB]" />
                        <p className="mt-2 text-[13px] text-[#5B6A7A]">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`transition-colors hover:bg-[#EAF0F7] ${
                          index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                        }`}
                      >
                        <td className={`${tdBase} pl-6`}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 ${getAvatarColor(user.name)} rounded-full flex items-center justify-center text-white font-semibold text-xs`}>
                              {user.avatar}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-[#0F2A47]">{user.name}</p>
                              <p className="text-[10px] text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className={tdBase}>{user.username}</td>
                        <td className={tdBase}>
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                            {user.role}
                          </span>
                        </td>
                        <td className={tdBase}>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.active ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className={tdBase}>{user.lastLogin}</td>
                        <td className={`${tdBase} pr-6`}>
                          <div className="flex items-center space-x-1">
                            {user.isCadmin !== "1" && (
                              <>
                                <Link
                                  href={`/user-management/edit/${user.id}`}
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
                                  onClick={() => setDeleteTarget({ id: user.id, name: user.name })}
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

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-[#D5DDE6] bg-white">
              <div className="text-[13px] text-[#5B6A7A]">
                Showing {start}–{end} of {total} users
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={prevDisabled}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className={`${pagerBtn} ${
                    prevDisabled
                      ? "text-[#7B8896] cursor-not-allowed"
                      : "text-[#0F2A47] cursor-pointer hover:bg-[#F1F4F8]"
                  }`}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={nextDisabled}
                  onClick={() => setPage((p) => p + 1)}
                  className={`${pagerBtn} ${
                    nextDisabled
                      ? "text-[#7B8896] cursor-not-allowed"
                      : "text-[#0F2A47] cursor-pointer hover:bg-[#F1F4F8]"
                  }`}
                >
                  Next
                </button>
              </div>
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

      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        userName={deleteTarget?.name}
        isDeleting={deleting}
      />
    </>
  );
};

export default withAuth(UserPage);
