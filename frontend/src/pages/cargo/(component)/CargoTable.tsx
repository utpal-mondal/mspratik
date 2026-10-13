import { Package } from "lucide-react";
import { CargoRecord } from "@/types/cargos/types";

interface CargoTableProps {
  cargos: CargoRecord[];
  loading: boolean;
  page: number;
  limit: number;
  statusUpdating: number | null;
  onToggleStatus: (cargo: CargoRecord) => void;
}

const thBase =
  "bg-slate-200 text-gray-500 text-left px-4 py-3.5 text-xs font-semibold tracking-[0.07em] uppercase whitespace-nowrap";
const tdBase =
  "px-4 py-3 border-b border-[#E6EBF1] text-[13px] font-medium text-gray-800 whitespace-nowrap";

const CargoTable: React.FC<CargoTableProps> = ({
  cargos,
  loading,
  page,
  limit,
  statusUpdating,
  onToggleStatus,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
        <thead>
          <tr>
            <th scope="col" className={`${thBase} pl-6 w-14`}>
              Sl
            </th>
            <th scope="col" className={thBase}>
              Cargo Name
            </th>
            <th scope="col" className={thBase}>
              Status
            </th>
            <th scope="col" className={`${thBase} pr-6`}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-[13px] text-[#5B6A7A]">
                Loading cargo...
              </td>
            </tr>
          ) : cargos.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center">
                <Package className="mx-auto h-8 w-8 text-[#C5CFDB]" />
                <p className="mt-2 text-[13px] text-[#5B6A7A]">No cargo found</p>
              </td>
            </tr>
          ) : (
            cargos.map((cargo, index) => {
              const isActive = cargo.status === "active";
              return (
                <tr
                  key={cargo.id}
                  className={`transition-colors hover:bg-[#EAF0F7] ${
                    index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                  }`}
                >
                  <td className={`${tdBase} pl-6 text-[#7B8896]`}>
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className={`${tdBase} font-semibold text-[#0F2A47] capitalize`}>
                    {cargo.cargo_name}
                  </td>
                  <td className={tdBase}>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-[0.02em] capitalize ${
                        isActive
                          ? "bg-[#E2F2EA] text-[#17603E]"
                          : "bg-[#FAE3E3] text-[#9A2626]"
                      }`}
                    >
                      {isActive ? "Active" : "Deactive"}
                    </span>
                  </td>
                  <td className={`${tdBase} pr-6`}>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(cargo)}
                      disabled={statusUpdating === cargo.id}
                      title={isActive ? "Deactivate" : "Activate"}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isActive ? "bg-[#17603E]" : "bg-[#C5CFDB]"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          isActive ? "translate-x-[19px]" : "translate-x-[3px]"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CargoTable;
