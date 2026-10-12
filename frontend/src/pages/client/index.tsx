import { useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import { Search, X } from "lucide-react";
import withAuth from "../../components/withAuth";
import apiService from "../../services/api";
import { useDebounce } from "../../hook/useDebounce";
import PageHeader from "./(component)/PageHeader";
import ClientTable from "./(component)/ClientTable";
import ViewClientDrawer from "./(component)/ViewClientDrawer";
import DeleteClientModal from "./(component)/DeleteClientModal";
import { ClientRecord } from "@/types/clients/types";

const ClientsPage = () => {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 400);

  const getClients = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllClients({
        page,
        limit,
        query: debouncedQuery || undefined,
      });
      setClients(res?.data?.data || []);
      setTotal(res?.data?.meta?.total || 0);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClients();
  }, [page, limit, debouncedQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiService.deleteClient(deleteTarget.id);
      setClients(clients.filter((c) => c.id !== deleteTarget.id));
      setTotal((prev) => Math.max(prev - 1, 0));
      toast.success("Client deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
    } finally {
      setDeleting(false);
    }
  };

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const prevDisabled = page <= 1;
  const nextDisabled = page * limit >= total;

  const pagerBtn =
    "h-10 px-4 bg-white border border-[#D5DDE6] rounded text-[13px] font-medium transition-colors";

  return (
    <>
      <Head>
        <title>Clients | Pratik Transport</title>
        <meta name="description" content="Client list" />
      
      </Head>

      <main
        className="flex-1 min-h-screen bg-[#F2F5F9] px-6 py-10 md:px-8 md:py-12 text-[#17222E]"
      >
        <div className=" mx-auto flex flex-col gap-7">
          <PageHeader total={total} />

          <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#D5DDE6]">
              <div className="text-base font-semibold text-[#0F2A47]">Client list</div>
              <div className="relative w-full max-w-[260px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8896]"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search name, contact or email..."
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

            <ClientTable
              clients={clients}
              loading={loading}
              page={page}
              limit={limit}
              onView={setViewId}
              onDelete={setDeleteTarget}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-[#D5DDE6] bg-white">
              <div className="text-[13px] text-[#5B6A7A]">
                Showing {start}–{end} of {total} clients
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
      </main>

      <ViewClientDrawer clientId={viewId} onClose={() => setViewId(null)} />

      <DeleteClientModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        clientName={deleteTarget?.client_name}
        isDeleting={deleting}
      />
    </>
  );
};

export default withAuth(ClientsPage);
