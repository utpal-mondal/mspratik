"use client";

import {
  Tag,
  Users,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import usePermission from "@/hook/usePermission";

interface ReportCard {
  title: string;
  icon: React.ElementType;
  background: string;
  border: string;
  iconBg: string;
  iconColor: string;
  arrowColor: string;
  redirectLink: string;
  permission?: string;
}

const reportItems: ReportCard[] = [
  {
    title: "View Profit By Brand",
    icon: Tag,
    background: "bg-blue-500",
    border: "border-blue-600 hover:border-blue-700",
    iconBg: "bg-blue-400",
    iconColor: "text-white",
    arrowColor: "text-white",
    redirectLink: "/profit-by-brand",
    permission: "View Warehouse Profit",
  },
  {
    title: "Top 10 Suppliers",
    icon: Users,
    background: "bg-violet-500",
    border: "border-violet-600 hover:border-violet-700",
    iconBg: "bg-violet-400",
    iconColor: "text-white",
    arrowColor: "text-white",
    redirectLink: "/top-ten-supplier",
    permission: "View Top 10 Suppliers",
  },
  {
    title: "Top 10 Customer",
    icon: TrendingUp,
    background: "bg-emerald-500",
    border: "border-emerald-600 hover:border-emerald-700",
    iconBg: "bg-emerald-400",
    iconColor: "text-white",
    arrowColor: "text-white",
    redirectLink: "/top-ten-customer",
    permission: "View Top 10 Customers",
  },
];

export default function ProfitReports() {
  const router = useRouter();
  const { canAccess } = usePermission();
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {reportItems.map((item) => {
          const Icon = item.icon;
          if (item.permission && !canAccess(item.permission)) return null;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => router.push(item.redirectLink)}
              className={`group relative flex h-[72px] w-full items-center gap-3 overflow-hidden rounded-xl border px-3 text-left shadow-[0_2px_7px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_5px_14px_rgba(15,23,42,0.09)] active:translate-y-0 ${item.background} ${item.border}`}
            >
              {/* Decorative circle */}
              <div className="pointer-events-none absolute -right-5 -top-8 h-20 w-20 rounded-full bg-white/20 blur-xl transition-transform duration-300 group-hover:scale-125" />

              {/* Icon */}
              <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105 ${item.iconBg} ${item.iconColor}`}>
                <Icon
                  size={18}
                  strokeWidth={2}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center pt-2.5">
                <p className="truncate text-[13px] font-bold leading-4 text-white mb-1">
                  {item.title}
                </p>

                <p className="mt-1 truncate text-[10px] font-medium leading-3 text-white/80">
                  View detailed report
                </p>
              </div>

              {/* Arrow */}
              <div className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-sm transition-all duration-200 group-hover:translate-x-0.5 ${item.arrowColor}`}>
                <ChevronRight
                  size={14}
                  strokeWidth={2.2}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}