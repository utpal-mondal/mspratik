"use client";

import {
  Warehouse,
  Store,
  FileText,
  ChevronRight,
} from "lucide-react";
import usePermission from "@/hook/usePermission";
import { useRouter } from "next/router";

interface InnerItem {
  id?: number;
  fallbackId?: number;
  title: string;
  subtitle: string;
  url?: string;
  icon: React.ElementType;
}

interface TypeCard {
  title: string;
  description: string;
  icon: React.ElementType;
  theme: {
    card: string;
    icon: string;
    iconColor: string;
    titleColor: string;
  };
  items: InnerItem[];
}

const typeCards: TypeCard[] = [
  {
    title: "Warehouse Trending Product",
    description: "Warehouse trending product reports",
    icon: Warehouse,

    theme: {
      card: "bg-[#08A9A8] border-[#079594]",
      icon: "bg-[#18B8B7]",
      iconColor: "text-white",
      titleColor: "text-white",
    },

    items: [
     {  "id":15,
        title: "A Fone Zone Cacem Trending Products",
        subtitle: "Analyze your most popular products",
        "url": "/trending-products",
        icon: Warehouse,
      },
      {"id":12,
        title: "AMIR SHOP Trending Products",
        subtitle: "Analyze your most popular products",
        "url": "/trending-products",
        icon: Warehouse,
      },
      {"id":16,
        title: "AFZ ONLINE SHOP Trending Products",
        subtitle: "Analyze your most popular products",
        "url": "/trending-products",
        icon: Warehouse,
      }
    ],
  },

  {
    title: "Online Shops",
    description: "Manage online shop information",
    icon: Store,

    theme: {
      card: "bg-[#F47B00] border-[#DD6D00]",
      icon: "bg-[#F88B1F]",
      iconColor: "text-white",
      titleColor: "text-white",
    },

    items: [
      {
        id: 16,
        fallbackId: 58,
        title: "AFZ ONLINE SHOP",
        subtitle: "View shop information",
        url: "/warehouse-order-by-webshop",
        icon: Store,
      },
      {
        id: 12,
        fallbackId: 59,
        title: "AMIR SHOP View Sale Report (Ledger)",
        subtitle: "View shop information",
        url: "/warehouse-order-by-webshop",
        icon: Store,
      },
    ],
  },

  {
    title: "Sales Ledger",
    description: "Detailed sales and transaction reports",
    icon: FileText,

    theme: {
      card: "bg-[#55A05A] border-[#478D4C]",
      icon: "bg-[#65AD69]",
      iconColor: "text-white",
      titleColor: "text-white",
    },

    items: [
    
     
      {
        id: 15,
        fallbackId: 60,
        title: "A Fone Zone Cacem View Sale Report (Ledger)",
        subtitle: "",
        url: "/details_warehouse_report",
        icon: Warehouse,
      },
        {
        id: 16,
        fallbackId: 58,
        title: "AFZ ONLINE SHOP View Sale Report (Ledger)",
        subtitle: "",
        url: "/details_warehouse_report",
        icon: FileText,
      },
       {
        id: 12,
        fallbackId: 59,
        title: "AMIR SHOP View Sale Report (Ledger)",
        subtitle: "",
        url: "/details_warehouse_report",
        icon: FileText,
      },
    ],
  },
];

const getPermission = (cardTitle: string, itemTitle: string, subtitle?: string): string | undefined => {
  if (subtitle === "Trending Product") return "View Top Trending Products";
  if (itemTitle === "A Zone Zone Cacem") return "View Warehouse Sale Report";
  if (cardTitle === "Online Shops" && itemTitle === "AFZ ONLINE SHOP") return "View AFZ ONLINE Shop Sale Report";
  if (cardTitle === "Online Shops" && itemTitle === "AMIR SHOP View Sale Report (Ledger)") return "View Amir Shop Sale Report";
  if (cardTitle === "Sales Ledger" && itemTitle === "AFZ ONLINE SHOP View Sale Report (Ledger)") return "View AFZ ONLINE Shop Sale Report (Total Profit at the end)";
  if (cardTitle === "Sales Ledger" && itemTitle === "AMIR SHOP View Sale Report (Ledger)") return "View Amir Shop Sale Report (Total Profit at the end)";
  return undefined;
};

export default function SaleReportTypes() {
  const { canAccess } = usePermission();
  const router = useRouter();

  /* Use fallback ids (58,59,60) for local dev API, production ids (16,12,15) otherwise */
  const isLocalApi = process.env.NEXT_PUBLIC_API_URL?.includes("127.0.0.1:3001");
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {typeCards.map((card) => {
          const TypeIcon = card.icon;
          const visibleItems = card.items.filter((item) => {
            const permission = getPermission(card.title, item.title, item.subtitle);
            return !permission || canAccess(permission);
          });

          if (visibleItems.length === 0) return null;

          return (
            <section
              key={card.title}
              className={`group relative overflow-hidden rounded-2xl border p-3 shadow-[0_3px_12px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-[0_7px_20px_rgba(15,23,42,0.08)] ${card.theme.card}`}
            >
              {/* Decorative circle */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />

              {/* Header */}
              <div className="relative z-10 mb-3 flex items-center gap-2.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.theme.icon} ${card.theme.iconColor}`}>
                  <TypeIcon size={17} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h3 className={`text-[14px] font-bold ${card.theme.titleColor}`}>
                    {card.title}
                  </h3>

                  <p className="truncate text-[10px] font-medium text-white/80 mb-1">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Inner Cards */}
              <div className="relative z-10 space-y-2">
                {visibleItems.map((item) => {
                  const ItemIcon = item.icon;

                  return (
                    <button
                      key={`${card.title}-${item.title}`}
                      type="button"
                      onClick={() => {
                        if (item.url) {
                          const effectiveId = isLocalApi
                            ? item.fallbackId || item.id
                            : item.id;
                          if (effectiveId) router.push(`${item.url}/${effectiveId}`);
                        }
                      }}
                      className="group/item flex w-full items-center gap-2.5 rounded-xl border border-white bg-white px-2.5 py-2 text-left shadow-[0_1px_4px_rgba(15,23,42,0.04)] transition-all duration-200 hover:bg-slate-50 hover:shadow-[0_3px_8px_rgba(15,23,42,0.08)]"
                    >
                      {/* Inner icon */}
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.theme.icon} ${card.theme.iconColor}`}>
                        <ItemIcon size={15} strokeWidth={2} />
                      </div>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold text-slate-700 mb-1">
                          {item.title}
                        </p>

                        {/* <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
                          {item.subtitle}
                        </p> */}
                      </div>

                      {/* Arrow */}
                      <ChevronRight
                        size={14}
                        className="shrink-0 text-slate-400 transition-all duration-200 group-hover/item:translate-x-0.5"
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}