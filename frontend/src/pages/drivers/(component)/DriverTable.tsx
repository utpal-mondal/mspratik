import { User, Pencil, Trash2 } from "lucide-react";
import ActionMenu, { ActionMenuItem } from "@/components/ui/ActionMenu";
import { DriverRecord } from "@/types/drivers/types";

interface DriverTableProps {
  drivers: DriverRecord[];
  loading: boolean;
  onDelete: (driver: DriverRecord) => void;
}

const formatDate = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const index = (name.charCodeAt(0) || 0) % colors.length;
  return colors[index];
};

const DriverTable: React.FC<DriverTableProps> = ({
  drivers,
  loading,
  onDelete,
}) => {
  const actions = (driver: DriverRecord): ActionMenuItem[] => [
    {
      label: "Edit",
      icon: Pencil,
      href: `/drivers/update?id=${driver.id}`,
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: () => onDelete(driver),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-gray-200">
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-12">Actions</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Driver Name</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Phone Number</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Experience</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-xs text-gray-500">
                Loading drivers...
              </td>
            </tr>
          ) : drivers.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center">
                <User className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-1 text-xs text-gray-500">No drivers found</p>
              </td>
            </tr>
          ) : (
            drivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-2">
                  <ActionMenu items={actions(driver)} buttonLabel="Driver actions" />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-2">
                    {/* <div
                      className={`w-7 h-7 ${getAvatarColor(driver.driver_name)} rounded-full flex items-center justify-center text-white font-semibold text-[10px]`}
                    >
                      {(driver.driver_name[0] || "?").toUpperCase()}
                    </div> */}
                    <p className="text-xs font-semibold text-gray-900">
                      {driver.driver_name}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-700">{driver.phone_number || "-"}</p>
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700">
                    {driver.experience_years != null
                      ? `${driver.experience_years} yrs`
                      : "-"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-600">{formatDate(driver.created_at)}</p>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DriverTable;
