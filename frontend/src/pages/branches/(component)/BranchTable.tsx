import { Building2, Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu, { type ActionMenuItem } from "@/components/ui/ActionMenu";
import type { BranchData } from "@/lib/api";

interface BranchTableProps {
  branches: BranchData[];
  loading: boolean;
  serialOffset: number;
  onView: (branchId: number) => void;
  onEdit: (branch: BranchData) => void;
  onDelete: (branch: BranchData) => void;
}

const thBase =
  "bg-slate-200 text-gray-500 text-left px-4 py-3.5 text-xs font-semibold tracking-[0.07em] uppercase whitespace-nowrap";
const tdBase =
  "px-4 py-3 border-b border-[#E6EBF1] text-[13px] font-medium text-gray-800";

const BranchTable: React.FC<BranchTableProps> = ({
  branches,
  loading,
  serialOffset,
  onView,
  onEdit,
  onDelete,
}) => {
  const actions = (branch: BranchData): ActionMenuItem[] => [
    { label: "View", icon: Eye, onClick: () => onView(branch.id) },
    { label: "Edit", icon: Pencil, onClick: () => onEdit(branch) },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: () => onDelete(branch),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
        <thead>
          <tr>
            <th scope="col" className={`${thBase} pl-6 w-14`}>SL No.</th>
            <th scope="col" className={thBase}>Name</th>
            <th scope="col" className={thBase}>Head</th>
            <th scope="col" className={thBase}>Address</th>
            <th scope="col" className={thBase}>Phone Number</th>
            <th scope="col" className={thBase}>Email</th>
            <th scope="col" className={`${thBase} pr-6`}>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="px-6 py-10 text-center text-[13px] text-[#5B6A7A]">
                Loading branches...
              </td>
            </tr>
          ) : branches.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center">
                <Building2 className="mx-auto h-8 w-8 text-[#C5CFDB]" />
                <p className="mt-2 text-[13px] text-[#5B6A7A]">No branches found</p>
              </td>
            </tr>
          ) : (
            branches.map((branch, index) => (
              <tr
                key={branch.id}
                className={`transition-colors hover:bg-[#EAF0F7] ${
                  index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                }`}
              >
                <td className={`${tdBase} pl-6 text-[#7B8896]`}>{serialOffset + index + 1}</td>
                <td className={`${tdBase} font-semibold text-[#0F2A47]`}>
                  <button
                    type="button"
                    onClick={() => onView(branch.id)}
                    className="cursor-pointer capitalize hover:underline"
                  >
                    {branch.name}
                  </button>
                </td>
                <td className={tdBase}>{branch.head}</td>
                <td className={`${tdBase} max-w-sm truncate`} title={branch.address}>{branch.address}</td>
                <td className={tdBase}>{branch.phone_number || "-"}</td>
                <td className={tdBase}>{branch.email || "-"}</td>
                <td className={`${tdBase} pr-6`}>
                  <ActionMenu items={actions(branch)} buttonLabel="Branch actions" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BranchTable;
