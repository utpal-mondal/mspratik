import { Building2, Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu, { type ActionMenuItem } from "@/components/ui/ActionMenu";
import type { FirmRecord } from "@/services/api";

interface FirmTableProps {
  firms: FirmRecord[];
  loading: boolean;
  page: number;
  limit: number;
  onView: (firmId: number) => void;
  onEdit: (firmId: number) => void;
  onDelete: (firm: FirmRecord) => void;
}

const thBase =
  "bg-slate-200 px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.07em] text-gray-500 whitespace-nowrap";
const tdBase =
  "border-b border-[#E6EBF1] px-4 py-3 text-[13px] font-medium text-gray-800 whitespace-nowrap";

const formatCash = (value?: number | null) =>
  value == null
    ? "-"
    : value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const FirmTable: React.FC<FirmTableProps> = ({
  firms,
  loading,
  page,
  limit,
  onView,
  onEdit,
  onDelete,
}) => {
  const actions = (firm: FirmRecord): ActionMenuItem[] => [
    { label: "View", icon: Eye, onClick: () => onView(firm.id) },
    { label: "Edit", icon: Pencil, onClick: () => onEdit(firm.id) },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: () => onDelete(firm),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
        <thead>
          <tr>
            <th scope="col" className={`${thBase} w-14 pl-6`}>Sl</th>
            <th scope="col" className={thBase}>Firm Name</th>
            <th scope="col" className={thBase}>PAN No</th>
            <th scope="col" className={thBase}>GSTN No</th>
            <th scope="col" className={thBase}>TAN No</th>
            <th scope="col" className={thBase}>Cash In Hand</th>
            <th scope="col" className={thBase}>Starting Session</th>
            <th scope="col" className={`${thBase} pr-6`}>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="px-6 py-10 text-center text-[13px] text-[#5B6A7A]">
                Loading firms...
              </td>
            </tr>
          ) : firms.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center">
                <Building2 className="mx-auto h-8 w-8 text-[#C5CFDB]" />
                <p className="mt-2 text-[13px] text-[#5B6A7A]">No firms found</p>
              </td>
            </tr>
          ) : (
            firms.map((firm, index) => (
              <tr
                key={firm.id}
                className={`transition-colors hover:bg-[#EAF0F7] ${
                  index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                }`}
              >
                <td className={`${tdBase} pl-6 text-[#7B8896]`}>
                  {(page - 1) * limit + index + 1}
                </td>
                <td className={`${tdBase} font-semibold text-[#0F2A47]`}>
                  <button
                    type="button"
                    onClick={() => onView(firm.id)}
                    className="cursor-pointer capitalize hover:underline"
                  >
                    {firm.name}
                  </button>
                </td>
                <td className={tdBase}>{firm.pan_no}</td>
                <td className={tdBase}>{firm.gstn_no}</td>
                <td className={tdBase}>{firm.tan_no}</td>
                <td className={tdBase}>{formatCash(firm.cash_in_hand)}</td>
                <td className={tdBase}>{firm.starting_session || "-"}</td>
                <td className={`${tdBase} pr-6`}>
                  <ActionMenu items={actions(firm)} buttonLabel="Firm actions" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FirmTable;
