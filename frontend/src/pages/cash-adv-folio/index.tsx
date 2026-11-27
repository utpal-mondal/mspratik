
import { useMemo, useState } from "react";
import Head from "next/head";
import { Plus, Eye, MoreHorizontal } from "lucide-react";
import { toast } from "react-toastify";

import withAuth from "../../components/withAuth";
import FilterSection from "./(component)/FilterSection";
import CreateFolioModal, {
  type FolioFormValues,
} from "./(component)/CreateFolioModal";
import type { DateRange } from "@/components/ui/DateRangePicker";

interface FolioEntry {
  id: number;
  date: string;
  folioNo: string;
  branch: string;
  amount: string;
  bankAmount: string;
  remark: string;
  noOfTrips: number;
}

// Dummy data — replace with API data when backend is ready
const DUMMY_FOLIO: FolioEntry[] = [
  {
    id: 1,
    date: "2026-11-27",
    folioNo: "CF/26-27/001",
    branch: "Haldia",
    amount: "25000",
    bankAmount: "20000",
    remark: "Cash advance against bill no 101",
    noOfTrips: 5,
  },
  {
    id: 2,
    date: "2026-11-25",
    folioNo: "CF/26-27/002",
    branch: "Kolkata",
    amount: "18000",
    bankAmount: "15000",
    remark: "Advance payment for freight",
    noOfTrips: 3,
  },
  {
    id: 3,
    date: "2026-11-22",
    folioNo: "CF/26-27/003",
    branch: "Haldia",
    amount: "25000",
    bankAmount: "25000",
    remark: "Settled against invoice INV-204",
    noOfTrips: 4,
  },
  {
    id: 4,
    date: "2026-11-20",
    folioNo: "CF/26-27/004",
    branch: "Uberia",
    amount: "12000",
    bankAmount: "10000",
    remark: "Cash advance on account",
    noOfTrips: 2,
  },
  {
    id: 5,
    date: "2026-11-18",
    folioNo: "CF/26-27/005",
    branch: "Kolkata",
    amount: "9500",
    bankAmount: "9500",
    remark: "Advance for detention charges",
    noOfTrips: 2,
  },
  {
    id: 6,
    date: "2026-11-15",
    folioNo: "CF/26-27/006",
    branch: "Kolkata",
    amount: "5000",
    bankAmount: "4000",
    remark: "Refund of excess advance",
    noOfTrips: 1,
  },
  {
    id: 7,
    date: "2026-11-12",
    folioNo: "CF/26-27/007",
    branch: "Haldia",
    amount: "22000",
    bankAmount: "18000",
    remark: "Cash advance for seeds purchase",
    noOfTrips: 6,
  },
  {
    id: 8,
    date: "2026-11-10",
    folioNo: "CF/26-27/008",
    branch: "Haldia",
    amount: "22000",
    bankAmount: "22000",
    remark: "Part settlement",
    noOfTrips: 3,
  },
  {
    id: 9,
    date: "2026-11-08",
    folioNo: "CF/26-27/009",
    branch: "Uberia",
    amount: "12000",
    bankAmount: "10000",
    remark: "Advance adjustment",
    noOfTrips: 2,
  },
  {
    id: 10,
    date: "2026-11-05",
    folioNo: "CF/26-27/010",
    branch: "Kolkata",
    amount: "8000",
    bankAmount: "7500",
    remark: "Advance for fuel surcharge",
    noOfTrips: 2,
  },
  {
    id: 11,
    date: "2026-11-02",
    folioNo: "CF/26-27/011",
    branch: "Haldia",
    amount: "15000",
    bankAmount: "12000",
    remark: "Additional advance",
    noOfTrips: 3,
  },
  {
    id: 12,
    date: "2026-10-30",
    folioNo: "CF/26-27/012",
    branch: "Kolkata",
    amount: "14500",
    bankAmount: "14500",
    remark: "Advance closed",
    noOfTrips: 4,
  },
];

const formatINR = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDisplayDate = (value: string) => {
  const d = new Date(value);

  if (isNaN(d.getTime())) return value;

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const last30Days = (): DateRange => {
  const endDate = new Date();
  const startDate = new Date(endDate);

  startDate.setDate(startDate.getDate() - 29);

  return { startDate, endDate };
};

const inDateRange = (
  rowDate: string,
  range: DateRange | null
) => {
  if (!range) return true;

  const start = new Date(range.startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(range.endDate);
  end.setHours(23, 59, 59, 999);

  const t = new Date(rowDate);

  return t >= start && t <= end;
};

const CashAdvFolioPage = () => {
  const [search, setSearch] = useState("");

  const [dateRange, setDateRange] = useState<DateRange | null>(
    () => last30Days()
  );

  const [folioData, setFolioData] =
    useState<FolioEntry[]>(DUMMY_FOLIO);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [openActionId, setOpenActionId] = useState<number | null>(null);

  const handleViewFolio = (row: FolioEntry) => {
    setOpenActionId(null);
    toast.info(`Folio: ${row.folioNo}`);
  };

  // Search and date filtering
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return folioData
      .filter((row) => {
        if (!inDateRange(row.date, dateRange)) {
          return false;
        }

        if (
          term &&
          ![
            row.folioNo,
            row.branch,
            row.amount,
            row.bankAmount,
            row.remark,
            String(row.noOfTrips),
          ].some((value) =>
            String(value).toLowerCase().includes(term)
          )
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  }, [folioData, search, dateRange]);

  // Branch dropdown options
  const branchOptions = useMemo(
    () =>
      Array.from(
        new Set(folioData.map((row) => row.branch))
      ).sort(),
    [folioData]
  );

  // Create new folio
  const handleSaveFolio = (values: FolioFormValues) => {
    const newEntry: FolioEntry = {
      id: Math.max(0, ...folioData.map((row) => row.id)) + 1,
      date: values.dateRange.startDate.toISOString().slice(0, 10),
      folioNo: values.folioNo || `CF/${Date.now()}`,
      branch: values.branch,
      amount: values.amount,
      bankAmount: "0",
      remark: values.remark,
      noOfTrips: 0,
    };

    setFolioData((prev) => [newEntry, ...prev]);

    toast.success("Folio created successfully");

    setIsModalOpen(false);
  };

  const thCls =
    "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap";

  const tdCls =
    "px-4 py-3 text-[13px] text-[#17222E] whitespace-nowrap";

  return (
    <>
      <Head>
        <title>Cash Adv. Folio | Pratik Transport</title>
        <meta
          name="description"
          content="Cash advance folio"
        />
      </Head>

      <main className="min-h-screen flex-1 bg-[#F2F5F9] px-6 py-10 text-[#17222E] md:px-8 md:py-12">
        <div className="mx-auto flex flex-col gap-7">

          {/* Page Header */}
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="flex flex-col gap-2">
              <h3 className="m-0 text-[24px] font-semibold leading-[1.2] text-[#0F2A47]">
                Cash Adv. Folio
              </h3>

              <div className="text-[15px] leading-[1.5] text-[#4D5B6A]">
                Manage your cash advance folios and entries.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex h-11 items-center gap-2 rounded border border-blue-600 bg-blue-700 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              <Plus size={15} />
              Create Folio
            </button>
          </div>

          {/* Folio Table Container */}
          <div className="overflow-hidden rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">

            {/* Table Header and Filters */}
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#D5DDE6] px-6 py-4">
              <div className="flex items-baseline gap-2">
                <div className="text-base font-semibold text-[#0F2A47]">
                  Folio List
                </div>

                <div className="text-[13px] text-[#5B6A7A]">
                  ({filtered.length})
                </div>
              </div>

              <FilterSection
                search={search}
                onSearchChange={setSearch}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">

                {/* Table Head */}
                <thead>
                  <tr className="border-b border-[#D5DDE6] bg-[#F8FAFC] text-left">
                    <th className={thCls}>Action</th>
                    <th className={thCls}>Folio Date</th>
                    <th className={thCls}>Folio No</th>
                    <th className={thCls}>Branch</th>
                    <th className={`${thCls} text-right`}>
                      Amount
                    </th>
                    <th className={`${thCls} text-right`}>
                      Bank Amount
                    </th>
                    <th className={thCls}>Remark</th>
                    <th className={`${thCls} text-center`}>
                      No Of Trips
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-3 py-10 text-center text-[13px] text-gray-400"
                      >
                        No entries found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-[#EDF1F6] last:border-b-0 hover:bg-[#F8FAFC]"
                      >
                        {/* Action */}
                        <td className={`${tdCls} relative`}>
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenActionId(
                                  openActionId === row.id ? null : row.id
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#D5DDE6] bg-white text-[#64748B] transition hover:bg-[#F8FAFC]"
                            >
                              <MoreHorizontal size={20} />
                            </button>

                            {openActionId === row.id && (
                              <>
                                {/* Click outside to close */}
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenActionId(null)}
                                />

                                {/* Dropdown */}
                                <div className="absolute left-0 top-10 z-20 w-40 rounded-md border border-[#D5DDE6] bg-white p-1 shadow-lg">
                                  <button
                                    type="button"
                                    onClick={() => handleViewFolio(row)}
                                    className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-[13px] text-[#475569] transition hover:bg-[#F1F5F9]"
                                  >
                                    <Eye size={17} className="text-[#64748B]" />
                                    View
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Folio Date */}
                        <td className={tdCls}>
                          {formatDisplayDate(row.date)}
                        </td>

                        {/* Folio No */}
                        <td className={`${tdCls} font-medium`}>
                          {row.folioNo}
                        </td>

                        {/* Branch */}
                        <td className={`${tdCls} capitalize`}>
                          {row.branch}
                        </td>

                        {/* Amount */}
                        <td className={`${tdCls} text-right font-medium`}>
                          {formatINR(Number(row.amount))}
                        </td>

                        {/* Bank Amount */}
                        <td className={`${tdCls} text-right font-medium`}>
                          {formatINR(Number(row.bankAmount))}
                        </td>

                        {/* Remark */}
                        <td className={`${tdCls} max-w-[250px] truncate`}>
                          {row.remark}
                        </td>

                        {/* No Of Trips */}
                        <td className={`${tdCls} text-center font-medium`}>
                          {row.noOfTrips}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D5DDE6] bg-white px-6 py-3.5">
              <div className="text-[13px] text-[#5B6A7A]">
                Showing {filtered.length}{" "}
                {filtered.length === 1 ? "entry" : "entries"}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Folio Modal */}
      <CreateFolioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFolio}
        branchOptions={branchOptions}
      />
    </>
  );
};

export default withAuth(CashAdvFolioPage);
