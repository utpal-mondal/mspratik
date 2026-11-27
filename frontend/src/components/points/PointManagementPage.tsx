import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Eye, MapPin, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import ActionMenu, { type ActionMenuItem } from "@/components/ui/ActionMenu";
import AccessDenied from "@/components/AccessDenied";
import withAuth from "@/components/withAuth";
import PointFormDrawer from "@/components/points/PointFormDrawer";
import usePermission from "@/hook/usePermission";
import { useDebounce } from "@/hook/useDebounce";
import {
  pointApi,
  type PointData,
  type PointResource,
} from "@/lib/api";

interface PointManagementPageProps {
  resource: PointResource;
  title: string;
}

const PointManagementPage = ({ resource, title }: PointManagementPageProps) => {
  const router = useRouter();
  const { isCadmin } = usePermission();
  const [points, setPoints] = useState<PointData[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PointData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PointData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const requestId = useRef(0);
  const debouncedQuery = useDebounce(query, 400);
  const singular = title.endsWith("s") ? title.slice(0, -1) : title;
  const pageSize = 10;

  const getPoints = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    try {
      setLoading(true);
      const response = await pointApi.getPoints(resource, debouncedQuery);
      if (currentRequestId === requestId.current) setPoints(response?.data || []);
    } catch (error) {
      if (currentRequestId === requestId.current) {
        console.error(`Error fetching ${title.toLowerCase()}:`, error);
        toast.error(`Failed to fetch ${title.toLowerCase()}`);
      }
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  }, [debouncedQuery, resource, title]);

  useEffect(() => {
    void getPoints();
    return () => {
      requestId.current += 1;
    };
  }, [getPoints]);

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(points.length / pageSize));
    if (page > lastPage) setPage(lastPage);
  }, [page, points.length]);

  const openAddDrawer = () => {
    setEditTarget(null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await pointApi.deletePoint(resource, deleteTarget.id);
      setPoints((current) => current.filter((point) => point.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success(`${singular} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${title.toLowerCase()}:`, error);
      toast.error(`Failed to delete ${singular.toLowerCase()}`);
    } finally {
      setDeleting(false);
    }
  };

  if (!isCadmin()) return <AccessDenied />;

  const total = points.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pagePoints = points.slice((page - 1) * pageSize, page * pageSize);
  const tableHead =
    "bg-slate-200 px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.07em] text-gray-500 whitespace-nowrap";
  const tableCell =
    "border-b border-[#E6EBF1] px-4 py-3 text-[13px] font-medium text-gray-800";

  const actions = (point: PointData): ActionMenuItem[] => [
    { label: "View", icon: Eye, onClick: () => void router.push(`/${resource}/view/${point.id}`) },
    { label: "Edit", icon: Pencil, onClick: () => { setEditTarget(point); setDrawerOpen(true); } },
    { label: "Delete", icon: Trash2, danger: true, onClick: () => setDeleteTarget(point) },
  ];

  return (
    <>
      <main className="min-h-screen flex-1 bg-[#F2F5F9] px-6 py-10 text-[#17222E] md:px-8 md:py-12">
        <div className="mx-auto flex flex-col gap-7">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4D6178]">
                {title} Master · {total} records
              </div>
              <h1 className="m-0 text-2xl font-semibold leading-tight text-[#0F2A47]">{title}</h1>
              <p className="m-0 text-[15px] leading-normal text-[#4D5B6A]">
                Manage {title.toLowerCase()} and contact details.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddDrawer}
              className="flex h-11 items-center gap-2 rounded border border-blue-600 bg-blue-700 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              <Plus size={15} /> Add {singular}
            </button>
          </div>

          <section className="overflow-hidden rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D5DDE6] px-6 py-4">
              <h2 className="text-base font-semibold text-[#0F2A47]">{title} list</h2>
              <div className="relative w-full max-w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8896]" size={14} />
                <input
                  type="search"
                  placeholder={`Search ${title.toLowerCase()}...`}
                  value={query}
                  onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                  className="h-10 w-full rounded border border-[#C5CFDB] bg-white pl-9 pr-8 text-[13px] text-[#17222E] placeholder-[#7B8896] focus:border-[#0F2A47] focus:outline-none focus:ring-2 focus:ring-[#0F2A47]/20"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setPage(1); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#7B8896] hover:text-[#3B4957]"
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
                <thead>
                  <tr>
                    <th scope="col" className={`${tableHead} w-14 pl-6`}>SL No.</th>
                    <th scope="col" className={tableHead}>Name</th>
                    <th scope="col" className={tableHead}>Contact person</th>
                    <th scope="col" className={tableHead}>Contact person mobile no</th>
                    <th scope="col" className={`${tableHead} pr-6`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-[13px] text-[#5B6A7A]">Loading {title.toLowerCase()}...</td></tr>
                  ) : pagePoints.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <MapPin className="mx-auto h-8 w-8 text-[#C5CFDB]" />
                        <p className="mt-2 text-[13px] text-[#5B6A7A]">No {title.toLowerCase()} found</p>
                      </td>
                    </tr>
                  ) : pagePoints.map((point, index) => (
                    <tr key={point.id} className={`transition-colors hover:bg-[#EAF0F7] ${index % 2 ? "bg-[#F8FAFC]" : "bg-white"}`}>
                      <td className={`${tableCell} pl-6 text-[#7B8896]`}>
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      <td className={`${tableCell} font-semibold text-[#0F2A47]`}>
                        <button
                          type="button"
                          onClick={() => void router.push(`/${resource}/view/${point.id}`)}
                          className="cursor-pointer hover:underline"
                        >
                          {point.name}
                        </button>
                      </td>
                      <td className={tableCell}>{point.contact_person || "-"}</td>
                      <td className={tableCell}>{point.contact_person_mobile_no || "-"}</td>
                      <td className={`${tableCell} pr-6`}>
                        <ActionMenu items={actions(point)} buttonLabel={`${singular} actions`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D5DDE6] bg-white px-6 py-3.5">
              <div className="text-[13px] text-[#5B6A7A]">Showing {start}–{end} of {total} {title.toLowerCase()}</div>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))} className="h-10 rounded border border-[#D5DDE6] bg-white px-4 text-[13px] font-medium text-[#0F2A47] disabled:cursor-not-allowed disabled:text-[#7B8896]">Previous</button>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="h-10 rounded border border-[#D5DDE6] bg-white px-4 text-[13px] font-medium text-[#0F2A47] disabled:cursor-not-allowed disabled:text-[#7B8896]">Next</button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <PointFormDrawer
        resource={resource}
        title={title}
        isOpen={drawerOpen}
        point={editTarget}
        onClose={closeDrawer}
        onSaved={() => {
          closeDrawer();
          void getPoints();
        }}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-2 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"><AlertTriangle size={16} /></div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Delete {singular}</h2>
                <p className="mt-1 text-xs text-gray-500">Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteTarget.name}</span>? This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">Cancel</button>
              <button type="button" onClick={() => void handleDelete()} disabled={deleting} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-70">{deleting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default withAuth(PointManagementPage);
