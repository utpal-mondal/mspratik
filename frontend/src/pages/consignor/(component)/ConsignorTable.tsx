import { Eye, Pencil, Trash2, User } from "lucide-react";
import ActionMenu, { type ActionMenuItem } from "@/components/ui/ActionMenu";
import type { ConsignorRecord } from "@/services/api";

interface ConsignorTableProps {
  consignors: ConsignorRecord[];
  loading: boolean;
  onView: (consignorId: number) => void;
  onEdit: (consignor: ConsignorRecord) => void;
  onDelete: (consignor: ConsignorRecord) => void;
}

const thBase =
  "bg-slate-200 px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.07em] text-gray-500 whitespace-nowrap";
const tdBase =
  "border-b border-[#E6EBF1] px-4 py-3 text-[13px] font-medium text-gray-800";

const ConsignorTable: React.FC<ConsignorTableProps> = ({
  consignors,
  loading,
  onView,
  onEdit,
  onDelete,
}) => {
  const actions = (consignor: ConsignorRecord): ActionMenuItem[] => [
    { label: "View", icon: Eye, onClick: () => onView(consignor.id) },
    { label: "Edit", icon: Pencil, onClick: () => onEdit(consignor) },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: () => onDelete(consignor),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
        <thead>
          <tr>
            <th scope="col" className={`${thBase} w-14 pl-6`}>ID</th>
            <th scope="col" className={thBase}>Consignor Name</th>
            <th scope="col" className={thBase}>Address</th>
            <th scope="col" className={thBase}>Email</th>
            <th scope="col" className={thBase}>Mobile Number</th>
            <th scope="col" className={`${thBase} pr-6`}>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-[#5B6A7A]">
                Loading consignors...
              </td>
            </tr>
          ) : consignors.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center">
                <User className="mx-auto h-8 w-8 text-[#C5CFDB]" />
                <p className="mt-2 text-[13px] text-[#5B6A7A]">No consignors found</p>
              </td>
            </tr>
          ) : (
            consignors.map((consignor, index) => (
              <tr
                key={consignor.id}
                className={`transition-colors hover:bg-[#EAF0F7] ${
                  index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                }`}
              >
                <td className={`${tdBase} pl-6 text-[#7B8896]`}>{consignor.id}</td>
                <td className={`${tdBase} font-semibold text-[#0F2A47]`}>
                  <button
                    type="button"
                    onClick={() => onView(consignor.id)}
                    className="cursor-pointer capitalize hover:underline"
                  >
                    {consignor.name}
                  </button>
                </td>
                <td className={`${tdBase} max-w-sm truncate`} title={consignor.address || ""}>
                  {consignor.address || "-"}
                </td>
                <td className={tdBase}>{consignor.email || "-"}</td>
                <td className={tdBase}>{consignor.phone_number || "-"}</td>
                <td className={`${tdBase} pr-6`}>
                  <ActionMenu items={actions(consignor)} buttonLabel="Consignor actions" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ConsignorTable;
