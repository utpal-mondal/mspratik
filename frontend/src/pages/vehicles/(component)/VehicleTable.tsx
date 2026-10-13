import { Truck, Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu, { ActionMenuItem } from "@/components/ui/ActionMenu";
import { VehicleRecord } from "@/types/vehicles/types";
import { useRouter } from "next/navigation";

interface VehicleTableProps {
  vehicles: VehicleRecord[];
  loading: boolean;
  page: number;
  limit: number;
  onDelete: (vehicle: VehicleRecord) => void;
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

const VehicleTable: React.FC<VehicleTableProps> = ({
  vehicles,
  loading,
  page,
  limit,
  onDelete,
}) => {
  const router = useRouter();
  const actions = (vehicle: VehicleRecord): ActionMenuItem[] => [
    {
      label: "View",
      icon: Eye,
      href: `/vehicles/view/${vehicle.id}`,
    },
    {
      label: "Edit",
      icon: Pencil,
      href: `/vehicles/update?id=${vehicle.id}`,
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: () => onDelete(vehicle),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
        <thead>
          <tr>
            <th scope="col" className={`${thBase} pl-6 w-14`}>
              Sl
            </th>
            <th scope="col" className={thBase}>
              Vehicle Number
            </th>
            <th scope="col" className={thBase}>
              Owner
            </th>
            <th scope="col" className={thBase}>
              Phone
            </th>
            <th scope="col" className={thBase}>
              Type
            </th>
            <th scope="col" className={thBase}>
              Wheels
            </th>
            <th scope="col" className={thBase}>
              RC Number
            </th>
            <th scope="col" className={thBase}>
              Reg. Expiry
            </th>
            <th scope="col" className={thBase}>
              Insurance Expiry
            </th>
            <th scope="col" className={thBase}>
              PUC Expiry
            </th>
            <th scope="col" className={thBase}>
              Road Tax Expiry
            </th>
            <th scope="col" className={`${thBase} pr-6`}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={12} className="px-6 py-10 text-center text-[13px] text-[#5B6A7A]">
                Loading vehicles...
              </td>
            </tr>
          ) : vehicles.length === 0 ? (
            <tr>
              <td colSpan={12} className="px-6 py-12 text-center">
                <Truck className="mx-auto h-8 w-8 text-[#C5CFDB]" />
                <p className="mt-2 text-[13px] text-[#5B6A7A]">No vehicles found</p>
              </td>
            </tr>
          ) : (
            vehicles.map((vehicle, index) => (
              <tr
                key={vehicle.id}
                className={`transition-colors hover:bg-[#EAF0F7] ${
                  index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                }`}
              >
                <td className={`${tdBase} pl-6 text-[#7B8896]`}>
                  {(page - 1) * limit + index + 1}
                </td>
                <td className={`${tdBase} font-semibold text-[#0F2A47]`}>
                  <span
                    className="uppercase cursor-pointer hover:underline"
                    onClick={() => router.push(`/vehicles/view/${vehicle.id}`)}
                  >
                    {vehicle.vehicle_number}
                  </span>
                </td>
                <td className={`${tdBase} capitalize`}>
                  {vehicle.owner_name || "-"}
                </td>
                <td className={`${tdBase} !text-blue-600`}>
                  {vehicle.owner_phone || "-"}
                </td>
                <td className={tdBase}>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      vehicle.vehicle_type === "self"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {vehicle.vehicle_type || "-"}
                  </span>
                </td>
                <td className={tdBase}>{vehicle.number_of_wheels ?? "-"}</td>
                <td className={`${tdBase} uppercase`}>
                  {vehicle.rc_number || "-"}
                </td>
                <td className={tdBase}>
                  {formatDate(vehicle.registration_expiry_date)}
                </td>
                <td className={tdBase}>
                  {formatDate(vehicle.insurance_expiry_date)}
                </td>
                <td className={tdBase}>
                  {formatDate(vehicle.puc_expiry_date)}
                </td>
                <td className={tdBase}>
                  {formatDate(vehicle.road_tax_expiry_date)}
                </td>
                <td className={`${tdBase} pr-6`}>
                  <ActionMenu items={actions(vehicle)} buttonLabel="Vehicle actions" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTable;
