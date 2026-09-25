"use client";

import {
  Wallet,
  ShoppingCart,
  CircleAlert,
  FileWarning,
  RotateCcw,
  ArrowLeftRight,
  CircleMinus,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

import usePermission from "@/hook/usePermission";
import DateRangePicker from "@/components/ui/DateRangePicker";
import type { DateRange } from "@/components/ui/DateRangePicker";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import { warehouseApi } from "@/lib/api";
import { Location, ReportData } from "@/types/report/warehouse-sales-report";

interface SummaryCard {
  title: string;
  field: keyof ReportData["summary"];
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  amountColor: string;
  cardBg: string;
  borderColor: string;
}

interface WarehouseOption {
  value: string;
  label: string;
  rawName: string;
}

/* Display-name aliases (keyed by warehouse id) for warehouses whose stored name is a code */
const WAREHOUSE_LABEL_MAP: Record<string, string> = {
  "15": "A Fone Zone Cacem",
};

/* Warehouses (by id) that also show the Repair Order card */
const REPAIR_ORDER_WAREHOUSE_IDS = new Set(["15"]);

const summaryCards: SummaryCard[] = [
  {
    title: "Total Purchase",
    field: "total_purchase",
    icon: Wallet,
    iconBg: "bg-[#3B82F6]",
    iconColor: "text-white",
    amountColor: "text-white",
    cardBg: "bg-[#2563EB]",
    borderColor: "border-[#2563EB]",
  },
  {
    title: "Total Sales",
    field: "total_order",
    icon: ShoppingCart,
    iconBg: "bg-[#10B981]",
    iconColor: "text-white",
    amountColor: "text-white",
    cardBg: "bg-[#059669]",
    borderColor: "border-[#059669]",
  },
  {
    title: "Purchase Due",
    field: "total_purchase_due",
    icon: CircleAlert,
    iconBg: "bg-[#F59E0B]",
    iconColor: "text-white",
    amountColor: "text-white",
    cardBg: "bg-[#D97706]",
    borderColor: "border-[#D97706]",
  },
  {
    title: "Invoice Due",
    field: "total_invoice_due",
    icon: FileWarning,
    iconBg: "bg-[#EF4444]",
    iconColor: "text-white",
    amountColor: "text-white",
    cardBg: "bg-[#DC2626]",
    borderColor: "border-[#DC2626]",
  },
  {
    title: "Purchase Return",
    field: "total_purchase_return",
    icon: RotateCcw,
    iconBg: "bg-[#8B5CF6]",
    iconColor: "text-white",
    amountColor: "text-white",
    cardBg: "bg-[#7C3AED]",
    borderColor: "border-[#7C3AED]",
  },
  {
    title: "Total Sell Return",
    field: "total_sale_return",
    icon: ArrowLeftRight,
    iconBg: "bg-[#06B6D4]",
    iconColor: "text-white",
    amountColor: "text-white",
    cardBg: "bg-[#0891B2]",
    borderColor: "border-[#0891B2]",
  },
  {
    title: "Expense",
    field: "total_expense",
    icon: CircleMinus,
    iconBg: "bg-[#F97316]",
    iconColor: "text-white",
    amountColor: "text-white",
    cardBg: "bg-[#EA580C]",
    borderColor: "border-[#EA580C]",
  },
  {
    title: "Repair Order",
    field: "total_repair",
    icon: Wrench,
    iconBg: "bg-[#6366F1]",
    iconColor: "text-white",
    amountColor: "text-white",
    cardBg: "bg-[#4F46E5]",
    borderColor: "border-[#4F46E5]",
},
];

const defaultData: ReportData = {
  warehouse_id: 0,
  warehouse_name: "",
  summary: {
    total_purchase: 0,
    total_order: 0,
    total_purchase_due: 0,
    total_invoice_due: 0,
    total_purchase_return: 0,
    total_sale_return: 0,
    total_expense: 0,
    total_repair: 0,
  },
};

const normalizeData = (response: any): ReportData => {
  if (!response || typeof response !== "object") return defaultData;
  const source = response.summary ? response : response?.data;
  const summary = source?.summary ?? {};
  return {
    warehouse_id: source?.warehouse_id ?? 0,
    warehouse_name: source?.warehouse_name ?? "",
    summary: {
      total_purchase: Number(summary.total_purchase ?? 0),
      total_order: Number(summary.total_order ?? 0),
      total_purchase_due: Number(summary.total_purchase_due ?? 0),
      total_invoice_due: Number(summary.total_invoice_due ?? 0),
      total_purchase_return: Number(summary.total_purchase_return ?? 0),
      total_sale_return: Number(summary.total_sale_return ?? 0),
      total_expense: Number(summary.total_expense ?? 0),
      total_repair: Number(summary.total_repair ?? 0),
    },
  };
};

const formatEuro = (value: number | undefined | null) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(value ?? 0);

const formatDate = (date: Date) => {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function WarehouseSaleReport() {
  const { canAccess } = usePermission();
  if (!canAccess("View Warehouse Sale Report")) return null;

  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - 29);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    startDate,
    endDate: today,
  });
  const [warehouseOptions, setWarehouseOptions] = useState<WarehouseOption[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseOption | null>(null);
  const [reportData, setReportData] = useState<ReportData>(defaultData);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await warehouseApi.getAllWarehousesByCompanyId();
        const list: Location[] = Array.isArray(response) ? response : response?.data ?? [];
        const options = list.map((loc) => ({
          value: String(loc.id),
          label: WAREHOUSE_LABEL_MAP[String(loc.id)] ?? loc.warehouse_name,
          rawName: loc.warehouse_name,
        }));
        setWarehouseOptions(options);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedWarehouse || !warehouseOptions.length) return;
    setSelectedWarehouse(warehouseOptions[0]);
  }, [warehouseOptions, selectedWarehouse]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!selectedWarehouse || !dateRange) return;

      try {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);

        const response = await warehouseApi.getWarehouseSalesReport(
          Number(selectedWarehouse.value),
          {
            start_date: formatDate(start),
            end_date: formatDate(end),
          }
        );
        setReportData(normalizeData(response));
      } catch (error) {
        console.error("Failed to fetch report:", error);
      }
    };

    fetchReport();
  }, [selectedWarehouse, dateRange]);

  const handleDateChange = (range: DateRange | null) => {
    setDateRange(range ?? undefined);

    if (range?.startDate && range?.endDate) {
      console.log("Start Date:", range.startDate);
      console.log("End Date:", range.endDate);
    }
  };

  const handleWarehouseChange = (warehouse: WarehouseOption | null) => {
    setSelectedWarehouse(warehouse);
    if (warehouse) {
      console.log("Selected warehouse:", warehouse.value);
    }
  };

  const handleWarehouseSearch = (searchTerm: string) => {
    console.log("Searching warehouse:", searchTerm);
  };

  /* Repair Order card only shows for specific warehouses */
  const visibleCards =
    selectedWarehouse && REPAIR_ORDER_WAREHOUSE_IDS.has(selectedWarehouse.value)
      ? summaryCards
      : summaryCards.filter((card) => card.field !== "total_repair");

  return (
    <div className="min-h-screen w-full bg-slate-50/70">
      <div className="mx-auto w-full ">

        {/* Header */}
        <div className="mb-3 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Wallet size={18} strokeWidth={2} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Warehouse Sale Report
                </h1>

                <p className="mt-0.5 text-[12px] font-medium text-slate-400">
                  Overview of warehouse sales, purchases and outstanding amounts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_4px_rgba(15,23,42,0.03)] sm:flex-row sm:items-center sm:justify-between">

          {/* Location */}
          <div className="w-full sm:max-w-[320px]">
            <SearchableDropdown
              options={warehouseOptions}
              value={selectedWarehouse}
              onChange={handleWarehouseChange}
              onSearch={handleWarehouseSearch}
              placeholder="Select location"
              searchPlaceholder="Search warehouse..."
              labelKey="value"
              displayKey="label"
              buttonClassName="h-10 pl-9 pr-9 text-[13px] font-medium text-slate-600 bg-slate-100 border-slate-200 hover:border-blue-300 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              className="w-full text-sm"
              showIcon={true}
            />
          </div>

          {/* Date Filter */}
          <div className="w-full sm:ml-auto sm:w-[360px]">
            <DateRangePicker
              value={dateRange}
              onChange={handleDateChange}
              placeholder="Filter by date"
              className="h-10 "
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleCards.map((card) => {
            const Icon = card.icon;
            const amount = formatEuro(reportData.summary[card.field]);

            return (
              <div
                key={card.title}
                className={`group relative flex min-h-[94px] items-center gap-3 overflow-hidden rounded-xl border ${card.borderColor} ${card.cardBg} px-4 py-3 shadow-[0_3px_10px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_18px_rgba(15,23,42,0.16)]`}
              >
                {/* Decorative circle */}
                <div className="pointer-events-none absolute -right-7 -top-7 h-20 w-20 rounded-full bg-white/10 blur-xl transition-transform duration-300 group-hover:scale-125" />

                {/* Icon */}
                <div
                  className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor} shadow-sm`}
                >
                  <Icon size={20} strokeWidth={1.9} />
                </div>

                {/* Content */}
                <div className="relative z-10 min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold uppercase tracking-[0.04em] text-white/70">
                    {card.title}
                  </p>

                  <p
                    className={`mt-1 truncate text-[18px] font-bold leading-5 tracking-tight ${card.amountColor}`}
                  >
                    {amount}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
