import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { toast } from "react-toastify";
import RightDrawer from "@/components/ui/RightDrawer";
import apiService from "@/services/api";
import { CompanyRecord } from "@/types/company-details/types";

interface ViewCompanyDrawerProps {
  companyId: number | null;
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

const ViewCompanyDrawer: React.FC<ViewCompanyDrawerProps> = ({ companyId, onClose }) => {
  const [company, setCompany] = useState<CompanyRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyId) {
      setCompany(null);
      return;
    }

    const fetchCompany = async () => {
      try {
        setLoading(true);
        setCompany(null);
        const res = await apiService.getCompany(companyId);
        setCompany(res?.data?.data || null);
      } catch (error) {
        console.error("Error fetching company:", error);
        toast.error("Failed to fetch company details");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [companyId]);

  return (
    <RightDrawer
      isOpen={!!companyId}
      onClose={onClose}
      title="Company Details"
      width="max-w-md"
    >
      <div
        className="flex flex-col min-h-full text-[#17222E]"
        style={{ fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Helvetica, sans-serif" }}
      >
        {loading || !company ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-[#5B6A7A]">Loading company details...</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E6EBF1]">
              <div className="text-xs font-semibold tracking-[0.1em] uppercase text-[#4D6178]">
                Company
              </div>
              <div className="mt-1 text-lg font-semibold text-[#0F2A47] capitalize">
                {company.name}
              </div>
            </div>

            <div className="flex-1 px-5 py-4 flex flex-col gap-5">
              <div>
                <SectionTitle>Company Info</SectionTitle>
                <div className="border-t border-[#E6EBF1]">
                  <DetailRow label="Email" value={company.email} />
                  <DetailRow label="Phone" value={company.phone_number} />
                  <DetailRow label="VAT Number" value={company.vat_number} />
                  <DetailRow label="Language" value={company.language} />
                  <DetailRow label="Currency" value={company.currency} />
                </div>
              </div>

              <div>
                <SectionTitle>Address</SectionTitle>
                <div className="border-t border-[#E6EBF1]">
                  <DetailRow label="Address" value={company.address} />
                  <DetailRow label="Address 2" value={company.address_2} />
                  <DetailRow label="Post Code" value={company.post_code} />
                  <DetailRow label="City" value={company.city} />
                  <DetailRow label="Region" value={company.region} />
                  <DetailRow label="Country" value={company.country} />
                </div>
              </div>

              <div>
                <SectionTitle>Contact Person</SectionTitle>
                <div className="border-t border-[#E6EBF1]">
                  <DetailRow label="Name" value={company.contact_name} />
                  <DetailRow label="Email" value={company.contact_email} />
                  <DetailRow label="Phone" value={company.contact_phone} />
                </div>
              </div>

              <div>
                <SectionTitle>Other</SectionTitle>
                <div className="border-t border-[#E6EBF1]">
                  <DetailRow label="Remarks" value={company.remark} />
                  <DetailRow label="Location API" value={company.location_api} />
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
                href={`/company-details/update?id=${company.id}`}
                className="flex items-center gap-2 h-10 px-4 bg-blue-700 text-white border border-blue-400 rounded font-medium text-[13px] transition-colors hover:bg-blue-500"
              >
                <Pencil size={13} />
                Edit Company
              </Link>
            </div>
          </>
        )}
      </div>
    </RightDrawer>
  );
};

export default ViewCompanyDrawer;
