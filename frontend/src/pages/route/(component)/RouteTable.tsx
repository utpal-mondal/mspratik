import { Eye, Pencil, Route, Trash2 } from "lucide-react";
import ActionMenu, { ActionMenuItem } from "@/components/ui/ActionMenu";
import { RouteRecord } from "@/types/routes/types";

interface RouteTableProps {
  routes: RouteRecord[];
  loading: boolean;
  page: number;
  limit: number;
  onView: (routeId: number) => void;
  onDelete: (route: RouteRecord) => void;
}

const thBase =
  "bg-gray-100 text-black text-left px-4 py-3.5 text-xs font-semibold tracking-[0.07em] uppercase whitespace-nowrap";
const tdBase =
  "px-4 py-3 border-b border-[#E6EBF1] text-[#3B4957] whitespace-nowrap";

const PointCell = ({ name, lat, long }: { name?: string; lat?: string; long?: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="font-medium text-[#17222E] capitalize">{name || "-"}</span>
    {(lat || long) && (
      <span className="text-xs text-[#7B8896] [font-variant-numeric:tabular-nums]">
        {lat || "-"}, {long || "-"}
      </span>
    )}
  </div>
);

const RouteTable: React.FC<RouteTableProps> = ({
  routes,
  loading,
  page,
  limit,
  onView,
  onDelete,
}) => {
  const actions = (route: RouteRecord): ActionMenuItem[] => [
    {
      label: "View",
      icon: Eye,
      onClick: () => onView(route.id),
    },
    {
      label: "Edit",
      icon: Pencil,
      href: `/route/update?id=${route.id}`,
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: () => onDelete(route),
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
              Client Name
            </th>
            <th scope="col" className={thBase}>
              Start Point
            </th>
            <th scope="col" className={thBase}>
              Via Points
            </th>
            <th scope="col" className={thBase}>
              End Point
            </th>
            <th scope="col" className={`${thBase} pr-6`}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-[#5B6A7A]">
                Loading routes...
              </td>
            </tr>
          ) : routes.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center">
                <Route className="mx-auto h-8 w-8 text-[#C5CFDB]" />
                <p className="mt-2 text-[13px] text-[#5B6A7A]">No routes found</p>
              </td>
            </tr>
          ) : (
            routes.map((route, index) => (
              <tr
                key={route.id}
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
                    onClick={() => onView(route.id)}
                  >
                    {route.client_name || "-"}
                  </span>
                </td>
                <td className={tdBase}>
                  <PointCell
                    name={route.start_name}
                    lat={route.start_lat}
                    long={route.start_long}
                  />
                </td>
                <td className={tdBase}>
                  <PointCell
                    name={route.via_name}
                    lat={route.via_lat}
                    long={route.via_long}
                  />
                </td>
                <td className={tdBase}>
                  <PointCell
                    name={route.end_name}
                    lat={route.end_lat}
                    long={route.end_long}
                  />
                </td>
                <td className={`${tdBase} pr-6`}>
                  <ActionMenu items={actions(route)} buttonLabel="Route actions" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RouteTable;
