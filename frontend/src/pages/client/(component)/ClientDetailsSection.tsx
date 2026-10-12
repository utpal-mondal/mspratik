import { SectionProps } from "@/types/client-entry/types";

const labelClass = "block text-[13px] font-medium text-[#3B4957] mb-1.5";
const errorClass = "mt-1 text-xs text-[#A12B2B]";

const ClientDetailsSection: React.FC<SectionProps> = ({
  formData,
  fieldErrors,
  inputClass,
  onChange,
  onClearError,
}) => {
  return (
    <div className="bg-white">
      <div className="px-6 pt-4">
        <h2 className="text-base font-semibold text-[#0F2A47]">Client Details</h2>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Client Name <span className="text-[#A12B2B]">*</span>
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => {
                onChange("clientName", e.target.value);
                if (fieldErrors.clientName) onClearError("clientName");
              }}
              className={`${inputClass("clientName")} capitalize`}
              placeholder="Enter Client name"
              maxLength={50}
            />
            {fieldErrors.clientName && (
              <p className={errorClass}>{fieldErrors.clientName}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Contact No</label>
            <input
              type="tel"
              value={formData.contactNo}
              onChange={(e) => {
                onChange("contactNo", e.target.value.replace(/[^\d+\s-]/g, ""));
                if (fieldErrors.contactNo) onClearError("contactNo");
              }}
              className={inputClass("contactNo")}
              placeholder="Enter Contact no"
              maxLength={10}
            />
            {fieldErrors.contactNo && (
              <p className={errorClass}>{fieldErrors.contactNo}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Email Id</label>
            <input
              type="email"
              value={formData.emailId}
              onChange={(e) => {
                onChange("emailId", e.target.value);
                if (fieldErrors.emailId) onClearError("emailId");
              }}
              className={inputClass("emailId")}
              placeholder="Enter email"
              maxLength={50}
            />
            {fieldErrors.emailId && (
              <p className={errorClass}>{fieldErrors.emailId}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Contact Person</label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => {
                onChange("contactPerson", e.target.value);
                if (fieldErrors.contactPerson) onClearError("contactPerson");
              }}
              className={`${inputClass("contactPerson")} capitalize`}
              placeholder="Enter Contact Person name"
              maxLength={50}
            />
            {fieldErrors.contactPerson && (
              <p className={errorClass}>{fieldErrors.contactPerson}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Address</label>
            <input
              type="text"
              value={formData.address1}
              onChange={(e) => {
                onChange("address1", e.target.value);
                if (fieldErrors.address1) onClearError("address1");
              }}
              className={inputClass("address1")}
              placeholder="Enter Line One"
              maxLength={100}
            />
            {fieldErrors.address1 && (
              <p className={errorClass}>{fieldErrors.address1}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsSection;
