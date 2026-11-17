import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { toast } from "react-toastify";
import { Plus, Search, X } from "lucide-react";
import withAuth from "../../components/withAuth";
import usePermission from "../../hook/usePermission";
import AccessDenied from "../../components/AccessDenied";
import apiService from "../../services/api";
import { useDebounce } from "../../hook/useDebounce";
import PageHeader from "./(component)/PageHeader";
import CompanyTable from "./(component)/CompanyTable";
import ViewCompanyDrawer from "./(component)/ViewCompanyDrawer";
import DeleteCompanyModal from "./(component)/DeleteCompanyModal";
import { CompanyRecord } from "@/types/company-details/types";

const CompaniesPage = () => {
  const { isCadmin } = usePermission();
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CompanyRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 400);

  const getCompanies = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllCompanies({
        page,
        limit,
        query: debouncedQuery || undefined,
      });
      setCompanies(res?.data?.data || []);
      setTotal(res?.data?.meta?.total || 0);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCompanies();
  }, [page, limit, debouncedQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiService.deleteCompany(deleteTarget.id);
      setCompanies(companies.filter((c) => c.id !== deleteTarget.id));
      setTotal((prev) => Math.max(prev - 1, 0));
      toast.success("Company deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company");
    } finally {
      setDeleting(false);
    }
  };

  if (!isCadmin()) {
    return <AccessDenied />;
  }

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const prevDisabled = page <= 1;
  const nextDisabled = page * limit >= total;

  const pagerBtn =
    "h-10 px-4 bg-white border border-[#D5DDE6] rounded text-[13px] font-medium transition-colors";

  return (
    <>
      <Head>
        <title>Companies | Pratik Transport</title>
        <meta name="description" content="Company list" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Companies">
          <Link
            href="/company-details/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus size={15} />
            Add Company
          </Link>
        </PageHeader>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#D5DDE6]">
              <div className="text-base font-semibold text-[#0F2A47]">
                Company list
              </div>
              <div className="relative w-full max-w-[260px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8896]"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search name, email or city..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-10 pl-9 pr-8 border border-[#C5CFDB] rounded bg-white text-[13px] text-[#17222E] placeholder-[#7B8896] focus:outline-none focus:ring-2 focus:ring-[#0F2A47]/20 focus:border-[#0F2A47]"
                />
                {searchQuery !== "" && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#7B8896] hover:text-[#3B4957] rounded transition-colors"
                    title="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <CompanyTable
              companies={companies}
              loading={loading}
              page={page}
              limit={limit}
              onView={setViewId}
              onDelete={setDeleteTarget}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-[#D5DDE6] bg-white">
              <div className="text-[13px] text-[#5B6A7A]">
                Showing {start}–{end} of {total} companies
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={prevDisabled}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className={`${pagerBtn} ${
                    prevDisabled
                      ? "text-[#7B8896] cursor-not-allowed"
                      : "text-[#0F2A47] cursor-pointer hover:bg-[#F1F4F8]"
                  }`}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={nextDisabled}
                  onClick={() => setPage((p) => p + 1)}
                  className={`${pagerBtn} ${
                    nextDisabled
                      ? "text-[#7B8896] cursor-not-allowed"
                      : "text-[#0F2A47] cursor-pointer hover:bg-[#F1F4F8]"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ViewCompanyDrawer companyId={viewId} onClose={() => setViewId(null)} />

      <DeleteCompanyModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        companyName={deleteTarget?.name}
        isDeleting={deleting}
      />
    </>
  );
};

export default withAuth(CompaniesPage);
