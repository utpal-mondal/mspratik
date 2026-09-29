import Link from "next/link";
import { Truck, Edit2, Trash2, Phone } from "lucide-react";
import { VehicleRecord } from "@/types/vehicles/types";

interface VehicleTableProps {
  vehicles: VehicleRecord[];
  loading: boolean;
  onDelete: (vehicle: VehicleRecord) => void;
}

const COLUMNS = ["Vehicle", "Owner", "Type", "Wheels", "RC Number", "Reg. Expiry"];

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

const getExpiryStatus = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  const days = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expired", className: "bg-red-50 text-red-600" };
  if (days <= 30) return { label: `${days}d left`, className: "bg-amber-50 text-amber-700" };
  return null;
};

const typeBadgeClass = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "self":
      return "bg-blue-50 text-blue-700 ring-blue-600/10";
    case "others":
      return "bg-violet-50 text-violet-700 ring-violet-600/10";
    default:
      return "bg-gray-50 text-gray-600 ring-gray-500/10";
  }
};

const SkeletonRow = () => (
  <tr>
    {Array.from({ length: COLUMNS.length + 1 }).map((_, i) => (
      <td key={i} className="px-3 py-2.5">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
      </td>
    ))}
  </tr>
);

const VehicleTable: React.FC<VehicleTableProps> = ({
  vehicles,
  loading,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
              <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-3 py-10 text-center">
                  <div className="mx-auto flex items-center justify-center w-10 h-10 rounded-full bg-gray-50">
                    <Truck className="h-5 w-5 text-gray-300" />
                  </div>
                  <p className="mt-2 text-xs font-medium text-gray-600">No vehicles found</p>
                  <p className="text-[11px] text-gray-400">
                    Try adjusting your search or filters
                  </p>
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => {
                const expiry = getExpiryStatus(vehicle.registration_expiry_date);
                return (
                  <tr key={vehicle.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-500 shrink-0 overflow-hidden">
                          {vehicle.vehicle_image ? (
                            <img
                              src={vehicle.vehicle_image}
                              alt={vehicle.vehicle_number}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Truck size={13} />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide whitespace-nowrap">
                          {vehicle.vehicle_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-xs font-medium text-gray-700 whitespace-nowrap">
                        {vehicle.owner_name || "-"}
                      </p>
                      {vehicle.owner_phone && (
                        <p className="flex items-center gap-1 text-[11px] text-gray-400 whitespace-nowrap">
                          <Phone size={9} />
                          {vehicle.owner_phone}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium capitalize ring-1 ring-inset ${typeBadgeClass(
                          vehicle.vehicle_type
                        )}`}
                      >
                        {vehicle.vehicle_type || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-700">
                        {vehicle.number_of_wheels ?? "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-700 uppercase font-mono">
                        {vehicle.rc_number || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-xs text-gray-600">
                          {formatDate(vehicle.registration_expiry_date)}
                        </span>
                        {expiry && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${expiry.className}`}
                          >
                            {expiry.label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-0.5">
                        <Link
                          href={`/vehicles/update?id=${vehicle.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Vehicle"
                        >
                          <Edit2 size={12} />
                        </Link>
                        <button
                          onClick={() => onDelete(vehicle)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Vehicle"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleTable;
