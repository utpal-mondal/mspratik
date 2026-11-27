import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronLeft, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import AccessDenied from "@/components/AccessDenied";
import withAuth from "@/components/withAuth";
import PointDetailsSection from "@/components/points/PointDetailsSection";
import PointFormDrawer from "@/components/points/PointFormDrawer";
import usePermission from "@/hook/usePermission";
import { pointApi, type PointData, type PointResource } from "@/lib/api";

interface PointViewPageProps {
  resource: PointResource;
  title: string;
}

const PointViewPage = ({ resource, title }: PointViewPageProps) => {
  const router = useRouter();
  const { isCadmin } = usePermission();
  const [point, setPoint] = useState<PointData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const singular = title.endsWith("s") ? title.slice(0, -1) : title;

  const fetchPoint = useCallback(async (id: number) => {
    const response = await pointApi.getPoint(resource, id);
    const pointData = response?.data as PointData | undefined;
    if (!pointData) throw new Error(`${singular} details were not returned`);
    setPoint(pointData);
  }, [resource, singular]);

  useEffect(() => {
    if (!router.isReady) return;
    const rawId = router.query.id;
    const pointId = typeof rawId === "string" ? Number(rawId) : NaN;
    if (!Number.isInteger(pointId) || pointId <= 0) {
      toast.error(`${singular} ID is required`);
      void router.replace(`/${resource}`);
      return;
    }

    let active = true;
    const loadPoint = async () => {
      try {
        setLoading(true);
        const response = await pointApi.getPoint(resource, pointId);
        const pointData = response?.data as PointData | undefined;
        if (!pointData) throw new Error(`${singular} details were not returned`);
        if (active) setPoint(pointData);
      } catch (error) {
        console.error(`Error fetching ${singular.toLowerCase()}:`, error);
        if (active) {
          toast.error(`Failed to fetch ${singular.toLowerCase()} details`);
          void router.push(`/${resource}`);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadPoint();
    return () => {
      active = false;
    };
  }, [router.isReady, router.query.id, resource, router, singular]);

  const handleSaved = async () => {
    setEditOpen(false);
    if (!point) return;
    try {
      await fetchPoint(point.id);
    } catch (error) {
      console.error(`Error refreshing ${singular.toLowerCase()} details:`, error);
      toast.error(`${singular} saved, but failed to refresh its details`);
    }
  };

  if (!isCadmin()) return <AccessDenied />;

  return (
    <>
      <main className="min-h-screen bg-[#F2F5F9] px-6 pb-8 pt-6 text-[#17222E] md:px-8">
        <div className="mx-auto flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Link
                href={`/${resource}`}
                className="-ml-2 flex h-7 w-fit items-center gap-1 self-start rounded px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4D6178] transition-colors hover:bg-[#E4EAF1]"
              >
                <ChevronLeft size={14} />
                {title}
              </Link>
              <h1 className="m-0 text-2xl font-semibold leading-[1.2] text-[#0F2A47]">
                View {singular}
              </h1>
            </div>
            {point && (
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
              <p className="text-sm text-[#5B6A7A]">Loading {singular.toLowerCase()} details...</p>
            </div>
          ) : point ? (
            <PointDetailsSection point={point} />
          ) : null}
        </div>
      </main>
      <PointFormDrawer
        resource={resource}
        title={title}
        isOpen={editOpen}
        point={point}
        onClose={() => setEditOpen(false)}
        onSaved={() => void handleSaved()}
      />
    </>
  );
};

export default withAuth(PointViewPage);
