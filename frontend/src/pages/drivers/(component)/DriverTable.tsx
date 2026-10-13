import { User, Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu, { ActionMenuItem } from "@/components/ui/ActionMenu";
import { DriverRecord } from "@/types/drivers/types";
import { useRouter } from "next/navigation";

interface DriverTableProps {
  drivers: DriverRecord[];
  loading: boolean;
  page: number;
  limit: number;
  onEdit: (driver: DriverRecord) => void;
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

const thBase =
  "bg-slate-200 text-gray-500 text-left px-4 py-3.5 text-xs font-semibold tracking-[0.07em] uppercase whitespace-nowrap";
const tdBase =
  "px-4 py-3 border-b border-[#E6EBF1] text-[13px] font-medium text-gray-800 whitespace-nowrap";

const DriverTable: React.FC<DriverTableProps> = ({
  drivers,
  loading,
  page,
  limit,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();
  const actions = (driver: DriverRecord): ActionMenuItem[] => [
    {
      label: "View",
      icon: Eye,
      href: `/drivers/view/${driver.id}`,
    },
    {
      label: "Edit",
      icon: Pencil,
      onClick: () => onEdit(driver),
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
      <table className="w-full min-w-[860px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
        <thead>
          <tr>
            <th scope="col" className={`${thBase} pl-6 w-14`}>
              Sl
            </th>
            <th scope="col" className={thBase}>
              Driver Name
            </th>
            <th scope="col" className={thBase}>
              Phone Number
            </th>
            <th scope="col" className={thBase}>
              Experience
            </th>
            <th scope="col" className={thBase}>
              Licence Number
            </th>
            <th scope="col" className={thBase}>
              Created
            </th>
            <th scope="col" className={`${thBase} pr-6`}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="px-6 py-10 text-center text-[13px] text-[#5B6A7A]">
                Loading drivers...
              </td>
            </tr>
          ) : drivers.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center">
                <User className="mx-auto h-8 w-8 text-[#C5CFDB]" />
                <p className="mt-2 text-[13px] text-[#5B6A7A]">No drivers found</p>
              </td>
            </tr>
          ) : (
            drivers.map((driver, index) => (
              <tr
                key={driver.id}
                className={`transition-colors hover:bg-[#EAF0F7] ${
                  index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                }`}
              >
                <td className={`${tdBase} pl-6 text-[#7B8896]`}>
                  {(page - 1) * limit + index + 1}
                </td>
                <td className={`${tdBase} font-semibold text-[#0F2A47]`}>
                  <span
                    className="capitalize cursor-pointer hover:underline"
                    onClick={() => router.push(`/drivers/view/${driver.id}`)}
                  >
                    {driver.driver_name}
                  </span>
                </td>
                <td className={`${tdBase} !text-blue-600`}>
                  {driver.phone_number || "-"}
                </td>
                <td className={tdBase}>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700">
                    {driver.experience_years != null
                      ? `${driver.experience_years} yrs`
                      : "-"}
                  </span>
                </td>
                <td className={`${tdBase} uppercase`}>
                  {driver.licence_number || "-"}
                </td>
                <td className={tdBase}>{formatDate(driver.created_at)}</td>
                <td className={`${tdBase} pr-6`}>
                  <ActionMenu items={actions(driver)} buttonLabel="Driver actions" />
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
