"use client";

import {
  ArrowRightLeft,
  UsersRound,
  Link2,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { useRouter } from "next/navigation";
import usePermission from "@/hook/usePermission";

interface MenuItem {
  title: string;
  description: string;
  icon: React.ElementType;
  container: string;
  iconContainer: string;
  iconColor: string;
  arrowColor: string;
  route?: string;
  permission?: string;
}

/* =========================================================
   RETURN & ACCESS CONTROL
========================================================= */

const returnAccessItems: MenuItem[] = [
  {
    title: "Stock Transfer Report",
    description: "Monitor stock movement between locations",
    icon: ArrowRightLeft,

    container:
      "bg-[#4747D4] border-[#0000A8] hover:bg-[#0000A8] text-white",

    iconContainer: "bg-white/10",
    iconColor: "text-white",
    arrowColor: "text-white group-hover:text-white",
    route: "reports/stock-transfer",
    permission: "View AFZ ONLINE (AKMAL SHOP) Stock Transfer Report",
  },

  {
    title: "View Customer Stock Report",
    description: "Review customer-wise inventory details",
    icon: UsersRound,

    container:
      "bg-[#4747D4] border-[#0000A8] hover:bg-[#0000A8] text-white",

    iconContainer: "bg-white/10",
    iconColor: "text-white",
    arrowColor: "text-white group-hover:text-white",
    route: "customer-stock-report",
    permission: "View Customer Stock Report",
  },
];

/* =========================================================
   STOCK REPORTS
========================================================= */

const stockReportItems: MenuItem[] = [
  {
    title: "Top Trending Products",
    description: "Analyze your most popular products",
    icon: Flame,

    container:
      "bg-[#4747D4] border-[#0000A8] hover:bg-[#0000A8] text-white",

    iconContainer: "bg-white/10",
    iconColor: "text-white",
    arrowColor: "text-white group-hover:text-white",
    route: "/trending-products",
    permission: "View Top Trending Products",
  },

  {
    title: "Warehouses Stock Report",
    description: "View warehouses stock report",
    icon: Link2,

    container:
      "bg-[#4747D4] border-[#0000A8] hover:bg-[#0000A8] text-white",

    iconContainer: "bg-white/10",
    iconColor: "text-white",
    arrowColor: "text-white group-hover:text-white",
    route: "warehouses/stock/report",
    permission: "View Warehouses Stock Report",
  },
];

/* =========================================================
   MENU BUTTON
========================================================= */

function MenuButton({
  title,
  description,
  icon: Icon,
  container,
  iconContainer,
  iconColor,
  arrowColor,
  route,
  permission,
}: MenuItem) {
  const router = useRouter();
  const { canAccess } = usePermission();

  if (permission && !canAccess(permission)) return null;

  const handleClick = () => {
    if (route) {
      router.push(`/${route}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group relative flex min-h-[48px] w-full items-center gap-3 overflow-hidden rounded-lg border px-3.5 py-2.5 text-left shadow-[0_2px_6px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_5px_12px_rgba(15,23,42,0.14)] active:translate-y-0 ${container}`}
    >
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/5 blur-xl transition-transform duration-300 group-hover:scale-125" />

      {/* Icon */}
      <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconContainer} ${iconColor}`}>
        <Icon
          size={16}
          strokeWidth={2}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold leading-4 text-white mb-1">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[11px] font-medium leading-3 text-white/80">
          {description}
        </p>
      </div>

      {/* Arrow */}
      <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#9696FF] transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-[#6F6FFF] ${arrowColor}`}>
        <ChevronRight
          size={14}
          strokeWidth={2}
        />
      </div>
    </button>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon: Icon,
  title,
  description,
  iconContainer,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  iconContainer: string;
  iconColor: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      {/* Header Icon */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconContainer} ${iconColor}`}>
        <Icon
          size={17}
          strokeWidth={2}
        />
      </div>

      {/* Header Content */}
      <div className="min-w-0">
        <h3 className="text-[14px] font-bold leading-4 text-slate-800">
          {title}
        </h3>

        <p className="text-[12px] font-medium leading-3 text-slate-400 mb-2">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ControlReports() {
  const { canAccess } = usePermission();

  const visibleReturnAccess = returnAccessItems.filter(
    (item) => !item.permission || canAccess(item.permission)
  );
  const visibleStockReport = stockReportItems.filter(
    (item) => !item.permission || canAccess(item.permission)
  );

  if (visibleReturnAccess.length === 0 && visibleStockReport.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        {/* =================================================
            RETURN & ACCESS CONTROL
        ================================================== */}

        {visibleReturnAccess.length > 0 && (
          <section className="relative overflow-hidden rounded-xl border border-blue-100 bg-slate-100 p-3 shadow-[0_2px_8px_rgba(59,130,246,0.05)]">
            <SectionHeader
              icon={ShieldCheck}
              title="Return & Access Control"
              description="Manage stock access and customer reports"
              iconContainer="bg-blue-100"
              iconColor="text-blue-600"
            />

            <div className="grid grid-cols-1 gap-2">
              {visibleReturnAccess.map((item) => (
                <MenuButton
                  key={item.title}
                  {...item}
                />
              ))}
            </div>
          </section>
        )}

        {/* =================================================
            STOCK REPORTS
        ================================================== */}

        {visibleStockReport.length > 0 && (
          <section className="relative overflow-hidden rounded-xl border border-emerald-100 bg-slate-100 p-3 shadow-[0_2px_8px_rgba(16,185,129,0.05)]">
            <SectionHeader
              icon={BarChart3}
              title="Stock Reports"
              description="Insights and tools for inventory management"
              iconContainer="bg-emerald-100"
              iconColor="text-emerald-600"
            />

            <div className="grid grid-cols-1 gap-2">
              {visibleStockReport.map((item) => (
                <MenuButton
                  key={item.title}
                  {...item}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}