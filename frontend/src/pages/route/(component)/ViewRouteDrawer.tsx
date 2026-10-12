import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RightDrawer from "@/components/ui/RightDrawer";
import apiService from "@/services/api";
import { RouteRecord } from "@/types/routes/types";

interface ViewRouteDrawerProps {
  routeId: number | null;
  onClose: () => void;
}

const DetailRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[#E6EBF1] last:border-b-0">
    <span className="text-[13px] text-[#5B6A7A]">{label}</span>
    <span className="text-[13px] font-medium text-[#17222E] text-right break-words">
      {value?.trim() ? value : "-"}
    </span>
  </div>
);

const SectionTitle = ({ children }: { children: string }) => (
  <h4 className="text-xs font-semibold tracking-[0.07em] uppercase text-[#4D6178] mb-1">
    {children}
  </h4>
);

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
      width="max-w-md"
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
            <div className="px-3 py-2 bg-[#F8FAFC] border-b border-[#E6EBF1]">
              <div className="text-xs font-semibold tracking-[0.1em] uppercase text-[#4D6178]">
                Route
              </div>
              <div className="mt-1 text-lg font-semibold text-[#0F2A47] capitalize">
                {route.client_name || `Route #${route.id}`}
              </div>
            </div>

            <div className="flex-1 px-5 py-4 flex flex-col gap-5">
              <div>
                <SectionTitle>Client</SectionTitle>
                <div className="border-t border-[#E6EBF1]">
                  <DetailRow label="Client Name" value={route.client_name} />
                </div>
              </div>

              <div>
                <SectionTitle>Start Point</SectionTitle>
                <div className="border-t border-[#E6EBF1]">
                  <DetailRow label="Name" value={route.start_name} />
                  <DetailRow label="Lat" value={route.start_lat} />
                  <DetailRow label="Long" value={route.start_long} />
                </div>
              </div>

              <div>
                <SectionTitle>Via Point</SectionTitle>
                <div className="border-t border-[#E6EBF1]">
                  <DetailRow label="Name" value={route.via_name} />
                  <DetailRow label="Lat" value={route.via_lat} />
                  <DetailRow label="Long" value={route.via_long} />
                </div>
              </div>

              <div>
                <SectionTitle>End Point</SectionTitle>
                <div className="border-t border-[#E6EBF1]">
                  <DetailRow label="Name" value={route.end_name} />
                  <DetailRow label="Lat" value={route.end_lat} />
                  <DetailRow label="Long" value={route.end_long} />
                </div>
              </div>
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
