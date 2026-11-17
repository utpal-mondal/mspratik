import { SectionProps } from "@/types/pump-entry/types";

const PumpDetailsSection: React.FC<SectionProps> = ({
  formData,
  fieldErrors,
  inputClass,
  onChange,
  onClearError,
}) => {
  return (
    <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
      <div className="px-6 pt-4">
        <h2 className="text-base font-semibold text-[#0F2A47]">Pump Details</h2>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.pumpName}
              onChange={(e) => {
                onChange("pumpName", e.target.value);
                if (fieldErrors.pumpName) onClearError("pumpName");
              }}
              className={`${inputClass("pumpName")} capitalize`}
              placeholder="Enter Pump Name"
              maxLength={100}
            />
            {fieldErrors.pumpName && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.pumpName}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Contact No
            </label>
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
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.contactNo}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Email Id
            </label>
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
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.emailId}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Contact Person
            </label>
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
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.contactPerson}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Add1
            </label>
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
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.address1}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Add2
            </label>
            <input
              type="text"
              value={formData.address2}
              onChange={(e) => {
                onChange("address2", e.target.value);
                if (fieldErrors.address2) onClearError("address2");
              }}
              className={inputClass("address2")}
              placeholder="Enter Line Two"
              maxLength={100}
            />
            {fieldErrors.address2 && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.address2}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Add3
            </label>
            <input
              type="text"
              value={formData.address3}
              onChange={(e) => {
                onChange("address3", e.target.value);
                if (fieldErrors.address3) onClearError("address3");
              }}
              className={inputClass("address3")}
              placeholder="Enter Line Three"
              maxLength={100}
            />
            {fieldErrors.address3 && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.address3}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Op Balance
            </label>
            <input
              type="number"
              value={formData.openingBalance}
              onChange={(e) => {
                onChange("openingBalance", e.target.value);
                if (fieldErrors.openingBalance) onClearError("openingBalance");
              }}
              className={inputClass("openingBalance")}
              placeholder="Enter Opening balance"
            />
            {fieldErrors.openingBalance && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.openingBalance}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PumpDetailsSection;
