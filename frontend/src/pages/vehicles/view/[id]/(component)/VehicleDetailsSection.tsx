import { Truck, FileText, Calendar, FileImage, FileText as PdfIcon } from "lucide-react";
import { VehicleRecord } from "@/types/vehicles/types";

// Strip the "/api" suffix so /uploads/... file paths resolve on the backend origin
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(
  /\/api\/?$/,
  ""
);

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
                <DetailField
                  label="Owner Name"
                  value={
                    <span className="capitalize">{vehicle.owner_name || "-"}</span>
                  }
                />
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
                <DetailField
                  label="Insurance Expiry"
                  value={formatDate(vehicle.insurance_expiry_date)}
                />
                <DetailField label="PUC Number" value={vehicle.puc_number} />
                <DetailField
                  label="PUC Expiry"
                  value={formatDate(vehicle.puc_expiry_date)}
                />
                <DetailField
                  label="Road Tax Expiry"
                  value={formatDate(vehicle.road_tax_expiry_date)}
                />
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

       <div className="bg-white border-t border-gray-200">
          <div className="px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FileImage size={16} className="text-blue-600" />
              Documents
            </h2>
          </div>
          <div className="px-4 pb-4">
            {vehicle.documents && vehicle.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicle.documents.map((doc) => {
                  const isImage = /\.(jpe?g|png|webp)$/i.test(doc.file_path);
                  const isPdf = /\.pdf$/i.test(doc.file_path);
                  const fileUrl = `${API_ORIGIN}${doc.file_path}`;
                  return (
                    <a
                      key={doc.id}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group no-underline rounded-lg border border-[#D5DDE6] overflow-hidden bg-white hover:border-blue-300 transition-colors"
                    >
                      <div className="h-44 bg-slate-50">
                        {isImage ? (
                          <img
                            src={fileUrl}
                            alt={doc.document_name}
                            className="w-full h-full object-cover group-hover:opacity-90 transition"
                          />
                        ) : (
                          <div
                            className={`flex items-center justify-center w-full h-full ${
                              isPdf ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <PdfIcon size={26} />
                          </div>
                        )}
                      </div>
                      <div className="px-2.5 py-2">
                        {/* <p className="text-[13px] font-medium text-[#0F2A47] truncate" title={doc.document_name}>
                          {doc.document_name}
                        </p> */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                            {doc.document_type === "rc_book_image" ? "RC Book Image" : doc.document_type === "vehicles_image" ? "Vehicles Image" : doc.document_type}
                          </span>
                          {doc.expiry_date && (
                            <span className="text-sm text-[#7B8896]">
                              Exp: {formatDate(doc.expiry_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px] text-gray-400">No documents uploaded</p>
            )}
          </div>
        </div>
      </div>

     
    </>
  );
};

export default VehicleDetailsSection;
