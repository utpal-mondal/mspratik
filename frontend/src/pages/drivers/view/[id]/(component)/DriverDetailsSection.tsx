import { User, Calendar } from "lucide-react";
import { DriverRecord } from "@/types/drivers/types";

interface DriverDetailsSectionProps {
  driver: DriverRecord;
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

const DetailField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">
      {label}
    </p>
    <p className="text-sm text-gray-900">{value || "-"}</p>
  </div>
);

const DriverDetailsSection: React.FC<DriverDetailsSectionProps> = ({ driver }) => {
  return (
    <div className="grid grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
      <div className="bg-white ">
        <div className="px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <User size={16} className="text-blue-600" />
            Driver Information
          </h2>
        </div>
        <div className="px-4 pb-4 flex flex-col">
          <div className=" gap-3">
            <DetailField
              label="Driver Name"
              value={
                <span className="capitalize">{driver.driver_name || "-"}</span>
              }
            />
            <DetailField label="Phone Number" value={driver.phone_number} />
            <DetailField
              label="Experience"
              value={
                driver.experience_years != null
                  ? `${driver.experience_years} years`
                  : "-"
              }
            />
            <DetailField label="Licence Number" value={driver.licence_number} />
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" />
            Record Information
          </h2>
        </div>
        <div className="px-4 pb-4 flex flex-row">
          <div className=" gap-3">
            <DetailField label="Driver ID" value={`#${driver.id}`} />
            <DetailField label="Created At" value={formatDateTime(driver.created_at)} />
            <DetailField label="Last Updated" value={formatDateTime(driver.updated_at)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetailsSection;
