import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { toast } from "react-toastify";
import RightDrawer from "@/components/ui/RightDrawer";
import apiService from "@/services/api";
import { ClientRecord } from "@/types/clients/types";

interface ViewClientDrawerProps {
  clientId: number | null;
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

const ViewClientDrawer: React.FC<ViewClientDrawerProps> = ({ clientId, onClose }) => {
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) {
      setClient(null);
      return;
    }

    const fetchClient = async () => {
      try {
        setLoading(true);
        setClient(null);
        const res = await apiService.getClient(clientId);
        setClient(res?.data?.data || null);
      } catch (error) {
        console.error("Error fetching client:", error);
        toast.error("Failed to fetch client details");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  return (
    <RightDrawer
      isOpen={!!clientId}
      onClose={onClose}
      title="Client Details"
      width="max-w-md"
    >
      <div
        className="flex flex-col min-h-full text-[#17222E]"
        style={{ fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Helvetica, sans-serif" }}
      >
        {loading || !client ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-[#5B6A7A]">Loading client details...</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E6EBF1]">
              <div className="text-xs font-semibold tracking-[0.1em] uppercase text-[#4D6178]">
                Client
              </div>
              <div className="mt-1 text-lg font-semibold text-[#0F2A47] capitalize">
                {client.client_name}
              </div>
            </div>

            <div className="flex-1 px-5 py-4 flex flex-col gap-5">
              <div>
                <SectionTitle>Contact Details</SectionTitle>
                <div className="border-t border-[#E6EBF1]">
                  <DetailRow label="Contact No" value={client.contact_no} />
                  <DetailRow label="Email ID" value={client.email_id} />
                  <DetailRow label="Contact Person" value={client.contact_person} />
                  <DetailRow label="Address" value={client.address_1} />
                </div>
              </div>

              <div>
                <SectionTitle>Tax Details</SectionTitle>
                <div className="border-t border-[#E6EBF1]">
                  <DetailRow label="GSTN No" value={client.gstn_no} />
                  <DetailRow label="Pan No" value={client.pan_no} />
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
              <Link
                href={`/client/update?id=${client.id}`}
                className="flex items-center gap-2 h-10 px-4 bg-[#0F2A47] text-white border border-[#0F2A47] rounded font-medium text-[13px] transition-colors hover:bg-[#17395E]"
              >
                <Pencil size={13} />
                Edit Client
              </Link>
            </div>
          </>
        )}
      </div>
    </RightDrawer>
  );
};

export default ViewClientDrawer;
