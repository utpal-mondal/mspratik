import { useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import withAuth from "../../components/withAuth";
import apiService from "../../services/api";
import Pagination from "../../components/ui/Pagination";
import { useDebounce } from "../../hook/useDebounce";
import PageHeader from "./(component)/PageHeader";
import FilterSection from "./(component)/FilterSection";
import BrokerTable from "./(component)/BrokerTable";
import DeleteBrokerModal from "./(component)/DeleteBrokerModal";
import { BrokerRecord } from "@/types/brokers/types";

const BrokersPage = () => {
  const [brokers, setBrokers] = useState<BrokerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BrokerRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 400);

  const getBrokers = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllBrokers({
        page,
        limit,
        query: debouncedQuery || undefined,
      });
      setBrokers(res?.data?.data || []);
      setTotal(res?.data?.meta?.total || 0);
    } catch (error) {
      console.error("Error fetching brokers:", error);
      toast.error("Failed to fetch brokers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBrokers();
  }, [page, limit, debouncedQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiService.deleteBroker(deleteTarget.id);
      setBrokers(brokers.filter((b) => b.id !== deleteTarget.id));
      setTotal((prev) => Math.max(prev - 1, 0));
      toast.success("Broker deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting broker:", error);
      toast.error("Failed to delete broker");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Brokers | Pratik Transport</title>
        <meta name="description" content="Broker list" />
      </Head>

      <main className="flex-1 p-3 md:p-4">
        <PageHeader total={total} />

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <FilterSection
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onReset={handleResetFilters}
          />

          <BrokerTable
            brokers={brokers}
            loading={loading}
            page={page}
            limit={limit}
            onDelete={setDeleteTarget}
          />

          <Pagination
            currentPage={page}
            total={total}
            perPage={limit}
            onPageChange={setPage}
          />
        </div>
      </main>

      <DeleteBrokerModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        brokerName={deleteTarget?.broker_name}
        isDeleting={deleting}
      />
    </>
  );
};

export default withAuth(BrokersPage);
