import { useEffect, useState } from "react";
import { Briefcase, FileText, Landmark, Settings2, Calendar } from "lucide-react";
import { BrokerRecord } from "@/types/brokers/types";
import apiService from "@/services/api";

interface BrokerDetailsSectionProps {
  broker: BrokerRecord;
}

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAmount = (value?: string | number) => {
  if (value === undefined || value === null || value === "") return "-";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const DetailField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">
      {label}
    </p>
    <p className="text-sm text-gray-900">{value || "-"}</p>
  </div>
);

const BrokerDetailsSection: React.FC<BrokerDetailsSectionProps> = ({ broker }) => {
  const [bankName, setBankName] = useState<string>("");

  useEffect(() => {
    if (broker.bank_id == null) return;
    const fetchBank = async () => {
      try {
        const res = await apiService.getAllBanks();
        const banks: { id: number; bank_name: string }[] = res?.data?.data || [];
        const match = banks.find((b) => b.id === broker.bank_id);
        if (match) setBankName(match.bank_name);
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    };
    fetchBank();
  }, [broker.bank_id]);

  return (
    <div className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        <div className="divide-y divide-gray-200">
          <div>
            <div className="px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600" />
                Broker Details
              </h2>
            </div>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailField
                  label="Broker Name"
                  value={<span className="capitalize">{broker.broker_name}</span>}
                />
                <DetailField label="Contact No" value={broker.contact_no} />
                <DetailField label="Email Id" value={broker.email_id} />
                <DetailField
                  label="Contact Person"
                  value={<span className="capitalize">{broker.contact_person || "-"}</span>}
                />
                <DetailField label="Add1" value={broker.address_1} />
                <DetailField label="Add2" value={broker.address_2} />
                <DetailField label="Add3" value={broker.address_3} />
                <DetailField label="Opening Balance" value={formatAmount(broker.opening_balance)} />
                <DetailField label="Previous Due" value={formatAmount(broker.previous_due)} />
              </div>
            </div>
          </div>

          <div>
            <div className="px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                Tax Details
              </h2>
            </div>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailField
                  label="GSTN No"
                  value={<span className="uppercase">{broker.gstn_no || "-"}</span>}
                />
                <DetailField
                  label="Pan No"
                  value={<span className="uppercase">{broker.pan_no || "-"}</span>}
                />
                <DetailField
                  label="Short Form"
                  value={<span className="uppercase">{broker.short_form || "-"}</span>}
                />
                <DetailField label="Adhar No" value={broker.adhar_no} />
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          <div>
            <div className="px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Landmark size={16} className="text-blue-600" />
                Bank Details
              </h2>
            </div>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailField
                  label="Banker Name"
                  value={<span className="capitalize">{broker.banker_name || "-"}</span>}
                />
                <DetailField label="Bank" value={bankName || (broker.bank_id != null ? `#${broker.bank_id}` : "-")} />
                <DetailField
                  label="Branch Name"
                  value={<span className="capitalize">{broker.branch_name || "-"}</span>}
                />
                <DetailField label="Account No" value={broker.account_no} />
                <DetailField
                  label="IFSC Code"
                  value={<span className="uppercase">{broker.ifsc_code || "-"}</span>}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Settings2 size={16} className="text-blue-600" />
                Broker Settings
              </h2>
            </div>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailField
                  label="Broker Type"
                  value={
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium capitalize bg-green-50 text-green-700">
                      {broker.broker_type || "normal"}
                    </span>
                  }
                />
                <DetailField
                  label="Owner Bill Type"
                  value={
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium capitalize bg-amber-50 text-amber-700">
                      {broker.owner_bill_type || "normal"}
                    </span>
                  }
                />
                <DetailField
                  label="Qty Round"
                  value={<span className="capitalize">{(broker.qty_round || "-").replace(/_/g, " ")}</span>}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200">
        <div className="px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" />
            Record Information
          </h2>
        </div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DetailField label="Broker ID" value={`#${broker.id}`} />
            <DetailField label="Created At" value={formatDateTime(broker.created_at)} />
            <DetailField label="Last Updated" value={formatDateTime(broker.updated_at)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerDetailsSection;
