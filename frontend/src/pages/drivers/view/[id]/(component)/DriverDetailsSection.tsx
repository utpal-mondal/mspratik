import { User, Calendar, FileImage, FileText } from "lucide-react";
import { DriverRecord } from "@/types/drivers/types";

// Strip the "/api" suffix so /uploads/... file paths resolve on the backend origin
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(
  /\/api\/?$/,
  ""
);

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

const DriverDetailsSection: React.FC<DriverDetailsSectionProps> = ({ driver }) => {
  return (
    <>
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

    <div className="bg-white border-t border-gray-200">
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileImage size={16} className="text-blue-600" />
          Documents
        </h2>
      </div>
      <div className="px-4 pb-4">
        {driver.documents && driver.documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {driver.documents.map((doc) => {
              const displayName = doc.document_name.split("/").pop() || doc.document_name;
              const extSource = doc.file_path || doc.document_name;
              const isImage = /\.(jpe?g|png|webp|svg)$/i.test(extSource);
              const isPdf = /\.pdf$/i.test(extSource);
              const fileUrl = doc.file_path
                ? `${API_ORIGIN}${doc.file_path}`
                : null;
              return (
                <a
                  key={doc.id}
                  href={fileUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group no-underline rounded-lg border border-[#D5DDE6] overflow-hidden bg-white hover:border-blue-300 transition-colors"
                >
                  <div className="h-44 bg-slate-50">
                    {isImage && fileUrl ? (
                      <img
                        src={fileUrl}
                        alt={displayName}
                        className="w-full h-full object-cover group-hover:opacity-90 transition"
                      />
                    ) : (
                      <div
                        className={`flex items-center justify-center w-full h-full ${
                          isPdf ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <FileText size={26} />
                      </div>
                    )}
                  </div>
                  <div className="px-2.5 py-2">
                    {/* <p className="text-[13px] font-medium text-[#0F2A47] truncate" title={displayName}>
                      {displayName}
                    </p> */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                        {doc.document_type}
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
    </>
  );
};

export default DriverDetailsSection;
