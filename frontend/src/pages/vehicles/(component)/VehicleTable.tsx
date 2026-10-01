import { Truck, Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu, { ActionMenuItem } from "@/components/ui/ActionMenu";
import { VehicleRecord } from "@/types/vehicles/types";
import { useRouter } from "next/navigation";

interface VehicleTableProps {
  vehicles: VehicleRecord[];
  loading: boolean;
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

const VehicleTable: React.FC<VehicleTableProps> = ({
  vehicles,
  loading,
  onDelete,
}) => {
  const router= useRouter()
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
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-gray-200">
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-12">Actions</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Vehicle Number</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Owner</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Wheels</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">RC Number</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Reg. Expiry</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-xs text-gray-500">
                Loading vehicles...
              </td>
            </tr>
          ) : vehicles.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center">
                <Truck className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-1 text-xs text-gray-500">No vehicles found</p>
              </td>
            </tr>
          ) : (
            vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-2">
                  <ActionMenu items={actions(vehicle)} buttonLabel="Vehicle actions" />
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-900 uppercase hover:underline hover:cursor-pointer" onClick={()=>router.push(`/vehicles/view/${vehicle.id}`)}>
                    {vehicle.vehicle_number}
                  </p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-700 capitalize">{vehicle.owner_name || "-"}</p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-700">{vehicle.owner_phone || "-"}</p>
                </td>
                <td className="px-4 py-2">
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
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-700">{vehicle.number_of_wheels ?? "-"}</p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-700 uppercase">{vehicle.rc_number || "-"}</p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-600">{formatDate(vehicle.registration_expiry_date)}</p>
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
