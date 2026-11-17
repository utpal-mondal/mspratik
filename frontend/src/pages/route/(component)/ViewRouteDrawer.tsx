import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RightDrawer from "@/components/ui/RightDrawer";
import apiService from "@/services/api";
import { RouteRecord } from "@/types/routes/types";
import RouteMapEditor from "./RouteMapEditor";

interface ViewRouteDrawerProps {
  routeId: number | null;
  onClose: () => void;
}

const ViewRouteDrawer: React.FC<ViewRouteDrawerProps> = ({ routeId, onClose }) => {
  const [route, setRoute] = useState<RouteRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!routeId) {
      setRoute(null);
      return;
    }

    const fetchRoute = async () => {
      try {
        setLoading(true);
        setRoute(null);
        const res = await apiService.getRoute(routeId);
        setRoute(res?.data?.data || null);
      } catch (error) {
        console.error("Error fetching route:", error);
        toast.error("Failed to fetch route details");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, [routeId]);

  return (
    <RightDrawer
      isOpen={!!routeId}
      onClose={onClose}
      title="Route Details"
      width="w-full max-w-6xl"
    >
      <div
        className="flex flex-col min-h-full text-[#17222E]"
       
      >
        {loading || !route ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-[#5B6A7A]">Loading route details...</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E6EBF1]">
              <div className="text-xs font-semibold tracking-[0.1em] uppercase text-[#4D6178]">
                Route
              </div>
              <div className="mt-1 text-lg font-semibold text-[#0F2A47] capitalize">
                {route.route_name || `Route #${route.id}`}
              </div>
            </div>

            <div className="p-3">
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
                fieldErrors={{}}
                readOnly
                onStartChange={() => {}}
                onViaChange={() => {}}
                onReorderStops={() => {}}
                onAddVia={() => {}}
                onRemoveVia={() => {}}
                onEndChange={() => {}}
              />
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#D5DDE6]">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 bg-white text-[#0F2A47] border border-[#C5CFDB] rounded font-medium text-[13px] cursor-pointer transition-colors hover:bg-[#F1F4F8]"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </RightDrawer>
  );
};

export default ViewRouteDrawer;
