import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronLeft, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import apiService from "../../../services/api";
import RouteMapEditor from "../(component)/RouteMapEditor";
import { RoutePoint } from "@/types/route-entry/types";
import type { RouteRecord } from "@/types/routes/types";

const emptyErrors: Record<string, string> = {};

const ignorePointChange = (_point: RoutePoint) => {};
const ignoreViaChange = (_index: number, _point: RoutePoint) => {};
const ignoreReorder = (_points: RoutePoint[]) => {};
const ignoreAction = () => {};
const ignoreRemoveVia = (_index: number) => {};

const TITLE_SMALL_WORDS = new Set(["to", "and", "of", "the", "in", "at", "for", "or", "on", "via"]);

// "haldia to tarapith" -> "Haldia to Tarapith"
const toTitleCase = (value: string) =>
  value.replace(/\S+/g, (word, index) =>
    index > 0 && TITLE_SMALL_WORDS.has(word.toLowerCase())
      ? word.toLowerCase()
      : word.charAt(0).toUpperCase() + word.slice(1)
  );

const RouteViewPage = () => {
  const router = useRouter();
  const [route, setRoute] = useState<RouteRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    const rawId = router.query.id;
    const routeId = typeof rawId === "string" ? Number(rawId) : NaN;
    if (!Number.isInteger(routeId) || routeId <= 0) {
      toast.error("Route ID is required");
      void router.replace("/route");
      return;
    }

    let active = true;
    const fetchRoute = async () => {
      try {
        setLoading(true);
        const response = await apiService.getRoute(routeId);
        const routeData = response?.data?.data as RouteRecord | undefined;
        if (!routeData) {
          throw new Error("Route details were not returned");
        }
        if (active) setRoute(routeData);
      } catch (error) {
        console.error("Error fetching route:", error);
        if (active) {
          toast.error("Failed to fetch route details");
          void router.push("/route");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchRoute();
    return () => {
      active = false;
    };
  }, [router.isReady, router.query.id]);

  return (
    <>
      <Head>
        <title>View Route | Pratik Transport</title>
        <meta name="description" content="View route details" />
      </Head>

      <main className="min-h-screen bg-[#F2F5F9] px-6 pt-6 pb-8 text-[#17222E] md:px-8">
        <div className="mx-auto flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Link
                href="/route"
                className="self-start -ml-2 flex h-7 w-fit items-center gap-1 rounded px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4D6178] transition-colors hover:bg-[#E4EAF1]"
              >
                <ChevronLeft size={14} />
                Route
              </Link>
              <h1 className="m-0 text-2xl font-semibold leading-[1.2] text-[#0F2A47]">
                View Route
              </h1>
              {/* <div className="text-[13px] text-[#4D5B6A]">
                Review the route and its start, via and end points.
              </div> */}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-[#5B6A7A]">Loading route details...</p>
            </div>
          ) : route ? (
            <div className="overflow-hidden rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06),0_4px_16px_rgba(15,42,71,0.04)]">
              <div className="border-b border-[#D5DDE6] px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#3B4957]">
                      Route Name:
                    </label>
                    <p className="mt-0.5 text-[14px] text-[#17222E]">
                      {route.route_name ? toTitleCase(route.route_name) : "-"}
                    </p>
                  </div>
                  <div>
                    <Link
                      href={`/route/update?id=${route.id}`}
                      className="mt-2 inline-flex items-center gap-1.5 rounded bg-[#2563EB] px-4 py-2 text-sm font-medium text-white no-underline hover:bg-blue-500 transition-colors"
                    >
                      <Pencil size={14} />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <RouteMapEditor
                startPoint={{
                  name: route.start_name || "",
                  lat: route.start_lat || "",
                  long: route.start_long || "",
                }}
                viaPoints={route.via_points || []}
                endPoint={{
                  name: route.end_name || "",
                  lat: route.end_lat || "",
                  long: route.end_long || "",
                }}
                fieldErrors={emptyErrors}
                readOnly
                onStartChange={ignorePointChange}
                onViaChange={ignoreViaChange}
                onReorderStops={ignoreReorder}
                onAddVia={ignoreAction}
                onRemoveVia={ignoreRemoveVia}
                onEndChange={ignorePointChange}
              />
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
};

export default withAuth(RouteViewPage);
