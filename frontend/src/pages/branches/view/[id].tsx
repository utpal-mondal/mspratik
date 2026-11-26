import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronLeft, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import AccessDenied from "../../../components/AccessDenied";
import usePermission from "../../../hook/usePermission";
import { branchApi, type BranchData } from "../../../lib/api";
import BranchDetailsSection from "../(component)/BranchDetailsSection";
import CreateBranchDrawer from "../(component)/CreateBranchDrawer";

const BranchViewPage = () => {
  const router = useRouter();
  const { isCadmin } = usePermission();
  const [branch, setBranch] = useState<BranchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const rawId = router.query.id;
    const branchId = typeof rawId === "string" ? Number(rawId) : NaN;
    if (!Number.isInteger(branchId) || branchId <= 0) {
      toast.error("Branch ID is required");
      void router.replace("/branches");
      return;
    }

    let active = true;
    const fetchBranch = async () => {
      try {
        setLoading(true);
        const response = await branchApi.getBranch(branchId);
        const branchData = response?.data as BranchData | undefined;
        if (!branchData) throw new Error("Branch details were not returned");
        if (active) setBranch(branchData);
      } catch (error) {
        console.error("Error fetching branch:", error);
        if (active) {
          toast.error("Failed to fetch branch details");
          void router.push("/branches");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchBranch();
    return () => {
      active = false;
    };
  }, [router.isReady, router.query.id]);

  const handleBranchSaved = async () => {
    setEditOpen(false);
    if (!branch) return;

    try {
      const response = await branchApi.getBranch(branch.id);
      const updatedBranch = response?.data as BranchData | undefined;
      if (!updatedBranch) throw new Error("Updated branch details were not returned");
      setBranch(updatedBranch);
    } catch (error) {
      console.error("Error refreshing branch details:", error);
      toast.error("Branch saved, but failed to refresh its details");
    }
  };

  if (!isCadmin()) return <AccessDenied />;

  return (
    <>
      <Head>
        <title>View Branch | Pratik Transport</title>
        <meta name="description" content="View branch details" />
      </Head>
      <main className="min-h-screen bg-[#F2F5F9] px-6 pb-8 pt-6 text-[#17222E] md:px-8">
        <div className="mx-auto flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Link
                href="/branches"
                className="-ml-2 flex h-7 w-fit items-center gap-1 self-start rounded px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4D6178] transition-colors hover:bg-[#E4EAF1]"
              >
                <ChevronLeft size={14} />
                Branch
              </Link>
              <h1 className="m-0 text-2xl font-semibold leading-[1.2] text-[#0F2A47]">
                View Branch
              </h1>
            </div>
            {branch && (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-1.5 rounded bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-[#5B6A7A]">Loading branch details...</p>
            </div>
          ) : branch ? (
            <BranchDetailsSection branch={branch} />
          ) : null}
        </div>
      </main>
      <CreateBranchDrawer
        isOpen={editOpen}
        branch={branch}
        onClose={() => setEditOpen(false)}
        onSaved={() => void handleBranchSaved()}
      />
    </>
  );
};

export default withAuth(BranchViewPage);
