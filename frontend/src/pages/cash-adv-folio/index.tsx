import { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Eye, Plus } from "lucide-react";
import { toast } from "react-toastify";
import withAuth from "../../components/withAuth";
import ActionMenu from "@/components/ui/ActionMenu";
import type { DateRange } from "@/components/ui/DateRangePicker";
import { useDebounce } from "@/hook/useDebounce";
import { folioApi, type FolioBranch, type FolioData } from "@/lib/api";
import CreateFolioModal, {
  type FolioFormValues,
} from "./(component)/CreateFolioModal";
import FilterSection from "./(component)/FilterSection";

const last30Days = (): DateRange => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 29);
  return { startDate, endDate };
};

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatINR = (value: number | null) =>
  value == null
    ? "-"
    : value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const formatDisplayDate = (value: string) => {
  const dateOnly = value.slice(0, 10);
  const date = new Date(`${dateOnly}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const CashAdvFolioPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | null>(() => last30Days());
  const [folios, setFolios] = useState<FolioData[]>([]);
  const [branches, setBranches] = useState<FolioBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const requestId = useRef(0);
  const debouncedSearch = useDebounce(search, 400);

  const getFolios = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    try {
      setLoading(true);
      const response = await folioApi.getFolios(
        debouncedSearch,
        dateRange ? formatDateParam(dateRange.startDate) : undefined,
        dateRange ? formatDateParam(dateRange.endDate) : undefined,
      );
      if (!Array.isArray(response?.data)) {
        throw new Error("Folio list was not returned");
      }
      if (currentRequestId === requestId.current) setFolios(response.data);
    } catch (error) {
      if (currentRequestId === requestId.current) {
        console.error("Error fetching folios:", error);
        toast.error("Failed to fetch folios");
      }
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  }, [debouncedSearch, dateRange]);

  useEffect(() => {
    void getFolios();
    return () => {
      requestId.current += 1;
    };
  }, [getFolios]);

  useEffect(() => {
    let active = true;
    const getBranches = async () => {
      try {
        setBranchesLoading(true);
        const response = await folioApi.getBranches();
        if (!Array.isArray(response?.data)) {
          throw new Error("Branch list was not returned");
        }
        if (active) setBranches(response.data);
      } catch (error) {
        console.error("Error fetching folio branches:", error);
        if (active) toast.error("Failed to fetch branches");
      } finally {
        if (active) setBranchesLoading(false);
      }
    };
    void getBranches();
    return () => {
      active = false;
    };
  }, []);

  const handleSaveFolio = async (values: FolioFormValues) => {
    await folioApi.createFolio({
      branch_id: values.branchId,
      folio_no: values.folioNo,
      amount: values.amount,
      bank_payment: values.bankPayment,
      date: values.date,
      remark: values.remark,
      folio_type: values.folioType,
    });
    toast.success("Folio created successfully");
    setIsModalOpen(false);
    void getFolios();
  };

  const handleViewFolio = (folio: FolioData) => {
    void router.push(`/cash-adv-folio/view/${folio.id}`);
  };

  const thCls =
    "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap";
  const tdCls = "px-4 py-3 text-[13px] text-[#17222E] whitespace-nowrap";

  return (
    <>
      <Head>
        <title>Cash Adv. Folio | Pratik Transport</title>
        <meta name="description" content="Cash advance folio" />
      </Head>

      <main className="min-h-screen flex-1 bg-[#F2F5F9] px-6 py-10 text-[#17222E] md:px-8 md:py-12">
        <div className="mx-auto flex flex-col gap-7">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="flex flex-col gap-2">
              <h1 className="m-0 text-[24px] font-semibold leading-[1.2] text-[#0F2A47]">
                Cash Adv. Folio
              </h1>
              <div className="text-[15px] leading-[1.5] text-[#4D5B6A]">
                Manage your cash advance folios and entries.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={branchesLoading || branches.length === 0}
              className="flex h-11 items-center gap-2 rounded border border-blue-600 bg-blue-700 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={15} />
              Create Folio
            </button>
          </div>

          <div className="overflow-hidden rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#D5DDE6] px-6 py-4">
              <div className="flex items-baseline gap-2">
                <div className="text-base font-semibold text-[#0F2A47]">Folio List</div>
                <div className="text-[13px] text-[#5B6A7A]">({folios.length})</div>
              </div>
              <FilterSection
                search={search}
                onSearchChange={setSearch}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr className="border-b border-[#D5DDE6] bg-[#F8FAFC] text-left">
                    <th className={thCls}>Action</th>
                    <th className={thCls}>Folio Date</th>
                    <th className={thCls}>Folio No</th>
                    <th className={thCls}>Branch</th>
                    <th className={`${thCls} text-right`}>Amount</th>
                    <th className={`${thCls} text-right`}>Bank Amount</th>
                    <th className={thCls}>Remark</th>
                    <th className={`${thCls} text-center`}>No Of Trips</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-[13px] text-gray-400">
                        Loading folios...
                      </td>
                    </tr>
                  ) : folios.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-[13px] text-gray-400">
                        No entries found
                      </td>
                    </tr>
                  ) : (
                    folios.map((folio) => (
                      <tr
                        key={folio.id}
                        className="border-b border-[#EDF1F6] last:border-b-0 hover:bg-[#F8FAFC]"
                      >
                        <td className={`${tdCls} relative`}>
                          <ActionMenu
                            buttonLabel={`Folio actions for ${folio.folio_no}`}
                            items={[
                              {
                                label: "View",
                                icon: Eye,
                                onClick: () => handleViewFolio(folio),
                              },
                            ]}
                          />
                        </td>
                        <td className={tdCls}>{formatDisplayDate(folio.date)}</td>
                        <td className={`${tdCls} font-medium`}>{folio.folio_no}</td>
                        <td className={`${tdCls} capitalize`}>{folio.branch.name}</td>
                        <td className={`${tdCls} text-right font-medium`}>
                          {formatINR(folio.amount)}
                        </td>
                        <td className={`${tdCls} text-right font-medium`}>
                          {formatINR(folio.bank_payment)}
                        </td>
                        <td className={`${tdCls} max-w-[250px] truncate`} title={folio.remark}>
                          {folio.remark || "-"}
                        </td>
                        <td className={`${tdCls} text-center font-medium`}>
                          0
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D5DDE6] bg-white px-6 py-3.5">
              <div className="text-[13px] text-[#5B6A7A]">
                Showing {folios.length} {folios.length === 1 ? "entry" : "entries"}
              </div>
            </div>
          </div>
        </div>
      </main>

      <CreateFolioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFolio}
        branches={branches}
      />
    </>
  );
};

export default withAuth(CashAdvFolioPage);
