import { Package, Table, Pencil, Trash2 } from "lucide-react";
import ActionMenu, { ActionMenuItem } from "@/components/ui/ActionMenu";

export interface ProductItem {
  id: number;
  name: string;
  price: number | string;
}

interface ProductListProps {
  products: ProductItem[];
  loading: boolean;
  page: number;
  limit: number;
  onEdit: (product: ProductItem) => void;
  onDelete: (product: ProductItem) => void;
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

const ProductList: React.FC<ProductListProps> = ({ products, loading, page, limit, onEdit, onDelete }) => {
  const actions = (product: ProductItem): ActionMenuItem[] => [
    {
      label: "Edit",
      icon: Pencil,
      onClick: () => onEdit(product),
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: () => onDelete(product),
    },
  ];

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Table size={16} className="text-blue-600" />
          Product List
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-200">
              <th className="pl-3 pr-1 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-10">Actions</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-12">Sl</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="pl-2 pr-3 py-2 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap w-28">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-center text-xs text-gray-500">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-center">
                  <Package className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-1 text-xs text-gray-500">No products found</p>
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="pl-3 pr-1 py-1.5">
                    <ActionMenu items={actions(product)} buttonLabel="Product actions" />
                  </td>
                  <td className="px-2 py-1.5">
                    <p className="text-xs text-gray-500">{(page - 1) * limit + index + 1}</p>
                  </td>
                  <td className="px-2 py-1.5">
                    <p className="text-xs font-semibold text-gray-900 capitalize">
                      {product.name}
                    </p>
                  </td>
                  <td className="pl-2 pr-3 py-1.5 text-right whitespace-nowrap">
                    <p className="text-xs text-gray-700">{formatPrice(product.price)}</p>
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

export default ProductList;
