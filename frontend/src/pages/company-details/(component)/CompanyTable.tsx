import { Building2, Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu, { ActionMenuItem } from "@/components/ui/ActionMenu";
import { CompanyRecord } from "@/types/company-details/types";

interface CompanyTableProps {
  companies: CompanyRecord[];
  loading: boolean;
  page: number;
  limit: number;
  onView: (companyId: number) => void;
  onDelete: (company: CompanyRecord) => void;
}

const thBase =
  "bg-slate-200 text-gray-500 text-left px-4 py-3.5 text-xs font-semibold tracking-[0.07em] uppercase whitespace-nowrap";
const tdBase =
  "px-4 py-3 border-b border-[#E6EBF1] text-[13px] font-medium text-gray-800 whitespace-nowrap";

const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  loading,
  page,
  limit,
  onView,
  onDelete,
}) => {
  const actions = (company: CompanyRecord): ActionMenuItem[] => [
    {
      label: "View",
      icon: Eye,
      onClick: () => onView(company.id),
    },
    {
      label: "Edit",
      icon: Pencil,
      href: `/company-details/update?id=${company.id}`,
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: () => onDelete(company),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
        <thead>
          <tr>
            <th scope="col" className={`${thBase} pl-6 w-14`}>
              Sl
            </th>
            <th scope="col" className={thBase}>
              Company Name
            </th>
            <th scope="col" className={thBase}>
              Email
            </th>
            <th scope="col" className={thBase}>
              Phone
            </th>
            <th scope="col" className={thBase}>
              City
            </th>
            <th scope="col" className={thBase}>
              Country
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
                Loading companies...
              </td>
            </tr>
          ) : companies.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center">
                <Building2 className="mx-auto h-8 w-8 text-[#C5CFDB]" />
                <p className="mt-2 text-[13px] text-[#5B6A7A]">No companies found</p>
              </td>
            </tr>
          ) : (
            companies.map((company, index) => (
              <tr
                key={company.id}
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
                    onClick={() => onView(company.id)}
                  >
                    {company.name}
                  </span>
                </td>
                <td className={tdBase}>{company.email || "-"}</td>
                <td className={`${tdBase} !text-blue-600`}>
                  {company.phone_number || "-"}
                </td>
                <td className={tdBase}>{company.city || "-"}</td>
                <td className={tdBase}>{company.country || "-"}</td>
                <td className={`${tdBase} pr-6`}>
                  <ActionMenu items={actions(company)} buttonLabel="Company actions" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyTable;
