"use client";

import { ChartNoAxesCombined, Database, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import usePermission from "@/hook/usePermission";

interface ReportItem {
  title: string;
  icon: React.ElementType;
  route?: string;
  permission?: string;
}

interface ReportGroup {
  title: string;
  icon: React.ElementType;
  items: ReportItem[];
  accent: {
    cardBg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    hoverBg: string;
  };
}

const reportGroups: ReportGroup[] = [
  {
    title: "Trading Reports",
    icon: ChartNoAxesCombined,

    accent: {
      cardBg: "bg-[#7135B8]",
      border: "border-[#642EA5]",
      iconBg: "bg-[#7E47C1]",
      iconColor: "text-white",
      hoverBg: "hover:bg-[#642EA5]",
    },

    items: [
      {
        title: "IMEI Trading Report",
        icon: Database,
        route: "reports/imei/trading",
        permission: "View IMEI Trading Report",
      },
    ],
  },

  {
    title: "Warehouse Stock & Price",
    icon: Database,

    accent: {
      cardBg: "bg-[#2864E6]",
      border: "border-[#2056CC]",
      iconBg: "bg-[#3973EA]",
      iconColor: "text-white",
      hoverBg: "hover:bg-[#2056CC]",
    },

    items: [
      {
        title: "Warehouse Stock Report with 5% Sale Price",
        icon: Database,
        route: "warehouses/stock/report",
      },
    ],
  },
];

const itemPermissionMap: Record<string, string> = {
  "Warehouse Stock Report with 5% Sale Price": "View Warehouse Stock Report",
};

export default function ReportGroups() {
  const router = useRouter();
  const { canAccess } = usePermission();

  const handleItemClick = (route?: string) => {
    if (route) {
      router.push(`/${route}`);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {reportGroups.map((group) => {
        const GroupIcon = group.icon;
        const visibleItems = group.items.filter((item) => {
          const permission = item.permission || itemPermissionMap[item.title];
          return !permission || canAccess(permission);
        });

        if (visibleItems.length === 0) return null;

        return (
          <section
            key={group.title}
            className="rounded-xl border border-slate-200 bg-slate-100 p-3 shadow-[0_1px_4px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_3px_10px_rgba(15,23,42,0.07)]"
          >
            {/* Parent Header */}
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                <GroupIcon size={17} strokeWidth={2} />
              </div>

              <div className="min-w-0">
                <h3 className="text-[14px] font-bold leading-4 text-slate-800">
                  {group.title}
                </h3>

                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                  {visibleItems.length === 1
                    ? "View available report"
                    : `${visibleItems.length} reports available`}
                </p>
              </div>
            </div>

            {/* Solid Color Report Cards */}
            <div className="space-y-2">
              {visibleItems.map((item) => {
                const ItemIcon = item.icon;

                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => handleItemClick(item.route)}
                    className={`group/item flex min-h-[48px] w-full items-center gap-3 rounded-lg border ${group.accent.border} ${group.accent.cardBg} px-3 py-2 text-left text-white transition-all duration-200 ${group.accent.hoverBg} hover:shadow-[0_3px_8px_rgba(15,23,42,0.15)]`}
                  >
                    {/* Icon */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${group.accent.iconBg} ${group.accent.iconColor}`}>
                      <ItemIcon size={15} strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-semibold leading-4 text-white mb-2">
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-[10px] font-medium leading-3 text-white/75">
                        Open report
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={15}
                      strokeWidth={1.8}
                      className="shrink-0 text-white/70 transition-all duration-200 group-hover/item:translate-x-0.5 group-hover/item:text-white"
                    />
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}