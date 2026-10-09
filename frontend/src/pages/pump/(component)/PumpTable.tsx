import { Fuel, Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu, { ActionMenuItem } from "@/components/ui/ActionMenu";
import { PumpRecord } from "@/types/pumps/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PumpTableProps {
  pumps: PumpRecord[];
  loading: boolean;
  page: number;
  limit: number;
  onDelete: (pump: PumpRecord) => void;
}

const formatAmount = (value?: string) => {
  if (value === undefined || value === null || value === "") return "-";
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const PumpTable: React.FC<PumpTableProps> = ({
  pumps,
  loading,
  page,
  limit,
  onDelete,
}) => {
  const router = useRouter();
  const actions = (pump: PumpRecord): ActionMenuItem[] => [
    {
      label: "View",
      icon: Eye,
      href: `/pump/view/${pump.id}`,
    },
    {
      label: "Edit",
      icon: Pencil,
      href: `/pump/update?id=${pump.id}`,
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: () => onDelete(pump),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-gray-200">
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-12">Actions</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-12">Sl</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Contact No</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Email ID</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Contact Person Name</th>
            <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Previous Due</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-xs text-gray-500">
                Loading pumps...
              </td>
            </tr>
          ) : pumps.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center">
                <Fuel className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-1 text-xs text-gray-500">No pumps found</p>
              </td>
            </tr>
          ) : (
            pumps.map((pump, index) => (
              <tr key={pump.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-2">
                  <ActionMenu items={actions(pump)} buttonLabel="Pump actions" />
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-500">{(page - 1) * limit + index + 1}</p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-900 capitalize hover:underline hover:cursor-pointer" onClick={() => router.push(`/pump/view/${pump.id}`)}>
                    {pump.pump_name}
                  </p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-700">{pump.contact_no || "-"}</p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-700">{pump.email_id || "-"}</p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-700 capitalize">{pump.contact_person || "-"}</p>
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/pump/view/${pump.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Opening Balance
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PumpTable;
