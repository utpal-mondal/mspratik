import { Truck, FileText, Calendar } from "lucide-react";
import { VehicleRecord } from "@/types/vehicles/types";

interface VehicleDetailsSectionProps {
  vehicle: VehicleRecord;
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

const formatDate = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

const VehicleDetailsSection: React.FC<VehicleDetailsSectionProps> = ({ vehicle }) => {
  return (
    <>
      <div className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          <div>
            <div className="px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Truck size={16} className="text-blue-600" />
                Vehicle Information
              </h2>
            </div>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailField label="Vehicle Number" value={vehicle.vehicle_number} />
                <DetailField
                  label="Vehicle Type"
                  value={
                    <span className="capitalize">{vehicle.vehicle_type || "-"}</span>
                  }
                />
                <DetailField
                  label="Number of Wheels"
                  value={vehicle.number_of_wheels ?? "-"}
                />
                <DetailField
                  label="Registration Expiry"
                  value={formatDate(vehicle.registration_expiry_date)}
                />
                <DetailField label="Owner Name" value={vehicle.owner_name} />
                <DetailField label="Owner Phone" value={vehicle.owner_phone} />
              </div>
            </div>
          </div>

          <div>
            <div className="px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                License Details
              </h2>
            </div>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailField label="RC Number" value={vehicle.rc_number} />
                <DetailField label="Permit Number" value={vehicle.permit_number} />
                <DetailField label="Insurance Number" value={vehicle.insurance_number} />
                <DetailField label="PUC Number" value={vehicle.puc_number} />
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
            <DetailField label="Vehicle ID" value={`#${vehicle.id}`} />
            <DetailField label="Created At" value={formatDateTime(vehicle.created_at)} />
            <DetailField label="Last Updated" value={formatDateTime(vehicle.updated_at)} />
          </div>
        </div>
      </div>
      </div>

     
    </>
  );
};

export default VehicleDetailsSection;
