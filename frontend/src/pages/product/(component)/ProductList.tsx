import { Package, Pencil, Trash2 } from "lucide-react";
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

const thBase =
  "bg-slate-200 text-gray-500 text-left px-4 py-3.5 text-xs font-semibold tracking-[0.07em] uppercase whitespace-nowrap";
const tdBase =
  "px-4 py-3 border-b border-[#E6EBF1] text-[13px] font-medium text-gray-800 whitespace-nowrap";

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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
        <thead>
          <tr>
            <th scope="col" className={`${thBase} pl-6 w-14`}>
              Sl
            </th>
            <th scope="col" className={thBase}>
              Name
            </th>
            <th scope="col" className={thBase}>
              Price
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
                Loading products...
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center">
                <Package className="mx-auto h-8 w-8 text-[#C5CFDB]" />
                <p className="mt-2 text-[13px] text-[#5B6A7A]">No products found</p>
              </td>
            </tr>
          ) : (
            products.map((product, index) => (
              <tr
                key={product.id}
                className={`transition-colors hover:bg-[#EAF0F7] ${
                  index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                }`}
              >
                <td className={`${tdBase} pl-6 text-[#7B8896]`}>
                  {(page - 1) * limit + index + 1}
                </td>
                <td className={`${tdBase} font-semibold text-[#0F2A47] capitalize`}>
                  {product.name}
                </td>
                <td className={`${tdBase} !text-blue-600`}>
                  {formatPrice(product.price)}
                </td>
                <td className={`${tdBase} pr-6`}>
                  <ActionMenu items={actions(product)} buttonLabel="Product actions" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
