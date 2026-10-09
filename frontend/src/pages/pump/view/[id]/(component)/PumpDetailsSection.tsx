import { Fuel, FileText, Landmark, Calendar } from "lucide-react";
import { PumpRecord } from "@/types/pumps/types";

interface PumpDetailsSectionProps {
  pump: PumpRecord;
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

const PumpDetailsSection: React.FC<PumpDetailsSectionProps> = ({ pump }) => {
  return (
    <div className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        <div className="divide-y divide-gray-200">
          <div>
            <div className="px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Fuel size={16} className="text-blue-600" />
                Pump Details
              </h2>
            </div>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailField
                  label="Name"
                  value={<span className="capitalize">{pump.pump_name}</span>}
                />
                <DetailField label="Contact No" value={pump.contact_no} />
                <DetailField label="Email Id" value={pump.email_id} />
                <DetailField
                  label="Contact Person"
                  value={<span className="capitalize">{pump.contact_person || "-"}</span>}
                />
                <DetailField label="Add1" value={pump.address_1} />
                <DetailField label="Add2" value={pump.address_2} />
                <DetailField label="Add3" value={pump.address_3} />
                <DetailField label="Opening Balance" value={formatAmount(pump.opening_balance)} />
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
                  value={<span className="uppercase">{pump.gstn_no || "-"}</span>}
                />
                <DetailField
                  label="Pan No"
                  value={<span className="uppercase">{pump.pan_no || "-"}</span>}
                />
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
                  value={<span className="capitalize">{pump.banker_name || "-"}</span>}
                />
                <DetailField
                  label="Branch Name"
                  value={<span className="capitalize">{pump.branch_name || "-"}</span>}
                />
                <DetailField label="Account No" value={pump.account_no} />
                <DetailField
                  label="IFSC Code"
                  value={<span className="uppercase">{pump.ifsc_code || "-"}</span>}
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
            <DetailField label="Pump ID" value={`#${pump.id}`} />
            <DetailField label="Created At" value={formatDateTime(pump.created_at)} />
            <DetailField label="Last Updated" value={formatDateTime(pump.updated_at)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PumpDetailsSection;
