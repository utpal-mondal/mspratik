"use client";

import DashboardHeader from "./components/DashboardHeader";
import ControlReports from "./components/ControlReports";
import ProfitReports from "./components/ProfitReports";
import SaleReports from "./components/SaleReports";
import WarehouseTradingReports from "./components/WarehouseTradingReports";
import WarehouseSalesReports from "./components/WarehouseSaleReport";
import TrendingProducts from "./components/TrendingProducts";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] p-2 sm:p-3 lg:p-4">
      <div className="mx-auto  bg-white/80 p-3 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-4">
        <DashboardHeader />

        <div className="mx-auto my-4 space-y-4">
          {/* <ControlReports />
          <ProfitReports />
          <SaleReports />
          <WarehouseTradingReports />
          <TrendingProducts />
          <WarehouseSalesReports /> */}
        </div>
      </div>
    </main>
  );
}

