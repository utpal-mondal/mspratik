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

const thBase =
  "bg-slate-200 text-gray-500 text-left px-4 py-3.5 text-xs font-semibold tracking-[0.07em] uppercase whitespace-nowrap";
const tdBase =
  "px-4 py-3 border-b border-[#E6EBF1] text-[13px] font-medium text-gray-800 whitespace-nowrap";

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
      <table className="w-full min-w-[860px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
        <thead>
          <tr>
            <th scope="col" className={`${thBase} pl-6 w-14`}>
              Sl
            </th>
            <th scope="col" className={thBase}>
              Name
            </th>
            <th scope="col" className={thBase}>
              Contact No
            </th>
            <th scope="col" className={thBase}>
              Email ID
            </th>
            <th scope="col" className={thBase}>
              Contact Person Name
            </th>
            <th scope="col" className={thBase}>
              Previous Due
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
                Loading brokers...
              </td>
            </tr>
          ) : brokers.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center">
                <Briefcase className="mx-auto h-8 w-8 text-[#C5CFDB]" />
                <p className="mt-2 text-[13px] text-[#5B6A7A]">No brokers found</p>
              </td>
            </tr>
          ) : (
            brokers.map((broker, index) => (
              <tr
                key={broker.id}
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
                    onClick={() => router.push(`/broker/view/${broker.id}`)}
                  >
                    {broker.broker_name}
                  </span>
                </td>
                <td className={`${tdBase} !text-blue-600`}>{broker.contact_no || "-"}</td>
                <td className={tdBase}>{broker.email_id || "-"}</td>
                <td className={`${tdBase} capitalize`}>
                  {broker.contact_person || "-"}
                </td>
                <td className={`${tdBase} !text-blue-600`}>
                  {formatAmount(broker.previous_due)}
                </td>
                <td className={`${tdBase} pr-6`}>
                  <ActionMenu items={actions(broker)} buttonLabel="Broker actions" />
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
