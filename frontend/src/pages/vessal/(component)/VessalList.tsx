import { Ship, Table, Pencil, Trash2 } from "lucide-react";
import ActionMenu, { ActionMenuItem } from "@/components/ui/ActionMenu";

export interface VessalItem {
  id: number;
  name: string;
  price: number | string;
}

interface VessalListProps {
  vessals: VessalItem[];
  loading: boolean;
  page: number;
  limit: number;
  onEdit: (vessal: VessalItem) => void;
  onDelete: (vessal: VessalItem) => void;
}

const formatPrice = (value?: number | string) => {
  if (value === undefined || value === null || value === "") return "-";
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const VessalList: React.FC<VessalListProps> = ({ vessals, loading, page, limit, onEdit, onDelete }) => {
  const actions = (vessal: VessalItem): ActionMenuItem[] => [
    {
      label: "Edit",
      icon: Pencil,
      onClick: () => onEdit(vessal),
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: () => onDelete(vessal),
    },
  ];

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Table size={16} className="text-blue-600" />
          Vessal List
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-200">
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-12">Actions</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-16">Sl</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-xs text-gray-500">
                  Loading vessals...
                </td>
              </tr>
            ) : vessals.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center">
                  <Ship className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-1 text-xs text-gray-500">No vessals found</p>
                </td>
              </tr>
            ) : (
              vessals.map((vessal, index) => (
                <tr key={vessal.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-2">
                    <ActionMenu items={actions(vessal)} buttonLabel="Vessal actions" />
                  </td>
                  <td className="px-4 py-2">
                    <p className="text-xs text-gray-500">{(page - 1) * limit + index + 1}</p>
                  </td>
                  <td className="px-4 py-2">
                    <p className="text-xs font-semibold text-gray-900 capitalize">
                      {vessal.name}
                    </p>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <p className="text-xs text-gray-700">{formatPrice(vessal.price)}</p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default VessalList;
