import { Briefcase, Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu, { ActionMenuItem } from "@/components/ui/ActionMenu";
import { BrokerRecord } from "@/types/brokers/types";
import { useRouter } from "next/navigation";

interface BrokerTableProps {
  brokers: BrokerRecord[];
  loading: boolean;
  page: number;
  limit: number;
  onDelete: (broker: BrokerRecord) => void;
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

const BrokerTable: React.FC<BrokerTableProps> = ({
  brokers,
  loading,
  page,
  limit,
  onDelete,
}) => {
  const router = useRouter();
  const actions = (broker: BrokerRecord): ActionMenuItem[] => [
    {
      label: "View",
      icon: Eye,
      href: `/broker/view/${broker.id}`,
    },
    {
      label: "Edit",
      icon: Pencil,
      href: `/broker/update?id=${broker.id}`,
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: () => onDelete(broker),
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
                Loading brokers...
              </td>
            </tr>
          ) : brokers.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center">
                <Briefcase className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-1 text-xs text-gray-500">No brokers found</p>
              </td>
            </tr>
          ) : (
            brokers.map((broker, index) => (
              <tr key={broker.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-2">
                  <ActionMenu items={actions(broker)} buttonLabel="Broker actions" />
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-500">{(page - 1) * limit + index + 1}</p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-900 capitalize hover:underline hover:cursor-pointer" onClick={() => router.push(`/broker/view/${broker.id}`)}>
                    {broker.broker_name}
                  </p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-700">{broker.contact_no || "-"}</p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-700">{broker.email_id || "-"}</p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-gray-700 capitalize">{broker.contact_person || "-"}</p>
                </td>
                <td className="px-4 py-2 text-right">
                  <p className="text-xs text-gray-700">{formatAmount(broker.previous_due)}</p>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BrokerTable;
