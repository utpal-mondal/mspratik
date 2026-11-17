import { Eye, Pencil, Route, Trash2 } from "lucide-react";
import ActionMenu, { ActionMenuItem } from "@/components/ui/ActionMenu";
import { RouteRecord } from "@/types/routes/types";

interface RouteTableProps {
  routes: RouteRecord[];
  loading: boolean;
  onView: (routeId: number) => void;
  onDelete: (route: RouteRecord) => void;
}

const thBase =
  "bg-slate-200 text-gray-500 text-left px-4 py-3.5 text-xs font-semibold tracking-[0.07em] uppercase whitespace-nowrap";
const tdBase =
  "px-4 py-3 border-b border-[#E6EBF1] text-[13px] font-medium text-gray-800 whitespace-nowrap";

const PointCell = ({ name, lat, long }: { name?: string; lat?: string; long?: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="font-medium text-[#17222E] capitalize">{name || "-"}</span>
  </div>
);

const CoordinateCell = ({
  start,
  end,
}: {
  start?: string;
  end?: string;
}) => (
  <div className="flex flex-col gap-0.5 text-xs text-[#5B6A7A] [font-variant-numeric:tabular-nums]">
    <span>From: {start || "-"}</span>
    <span>To: {end || "-"}</span>
  </div>
);

const RouteTable: React.FC<RouteTableProps> = ({
  routes,
  loading,
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
      <table className="w-full min-w-[980px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
        <thead>
          <tr>
            <th scope="col" className={`${thBase} pl-6 w-14`}>
              ID
            </th>
            <th scope="col" className={thBase}>
              Route Name
            </th>
            <th scope="col" className={thBase}>
              Start Point (From)
            </th>
            <th scope="col" className={thBase}>
              End Point (To)
            </th>
            <th scope="col" className={thBase}>
              Long
            </th>
            <th scope="col" className={thBase}>
              Lat
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
                Loading routes...
              </td>
            </tr>
          ) : routes.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center">
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
                  {route.id}
                </td>
                <td className={`${tdBase} font-semibold text-[#0F2A47]`}>
                  <span
                    className="capitalize cursor-pointer hover:underline"
                    onClick={() => onView(route.id)}
                  >
                    {route.route_name || `Route #${route.id}`}
                  </span>
                </td>
                <td className={tdBase}>
                  <PointCell
                    name={route.start_name}
                  />
                </td>
                <td className={tdBase}>
                  <PointCell
                    name={route.end_name}
                  />
                </td>
                <td className={tdBase}>
                  <CoordinateCell start={route.start_long} end={route.end_long} />
                </td>
                <td className={tdBase}>
                  <CoordinateCell start={route.start_lat} end={route.end_lat} />
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
