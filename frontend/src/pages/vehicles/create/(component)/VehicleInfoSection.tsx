import { SectionProps } from "@/types/vehicle-entry/types";
import CustomDatePicker from "@/components/ui/DatePicker";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import { formatDate } from "@/utils/dateRangeUtils";

const vehicleTypeOptions = [
  { value: "self", label: "Self" },
  { value: "others", label: "Others" },
];

const VehicleInfoSection: React.FC<SectionProps> = ({
  formData,
  fieldErrors,
  inputClass,
  onChange,
  onClearError,
}) => {
  return (
    <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
      <div className="px-6 pt-4">
        <h2 className="text-base font-semibold text-[#0F2A47]">Vehicle Information</h2>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Vehicle Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={(e) => {
                onChange("vehicleNumber", e.target.value.toUpperCase());
                if (fieldErrors.vehicleNumber) onClearError("vehicleNumber");
              }}
              className={`${inputClass("vehicleNumber")} uppercase`}
              placeholder="e.g. MH12AB1234"
              maxLength={13}
            />
            {fieldErrors.vehicleNumber && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.vehicleNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Vehicle Type
            </label>
            <SearchableDropdown
              options={vehicleTypeOptions}
              value={vehicleTypeOptions.find((o) => o.value === formData.vehicleType) || null}
              onChange={(option) => {
                onChange("vehicleType", option ? option.value : "");
                if (fieldErrors.vehicleType) onClearError("vehicleType");
              }}
              placeholder="Select vehicle type"
              searchPlaceholder="Search vehicle type..."
              labelKey="value"
              displayKey="label"
              allowClear={false}
              className="w-full"
              buttonClassName="h-10 text-[13px] !rounded !border-[#C5CFDB]"
            />
            {fieldErrors.vehicleType && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.vehicleType}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Number of Wheels
            </label>
            <input
              type="number"
              min={2}
              max={5}
              value={formData.numberOfWheels}
              onChange={(e) => {
                onChange("numberOfWheels", e.target.value.replace(/\D/g, ""));
                if (fieldErrors.numberOfWheels) onClearError("numberOfWheels");
              }}
              className={inputClass("numberOfWheels")}
              placeholder="e.g. 4"
            />
            {fieldErrors.numberOfWheels && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.numberOfWheels}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Registration Expiry Date
            </label>
            {/* <input
              type="date"
              value={formData.registrationExpiryDate}
              onChange={(e) => onChange("registrationExpiryDate", e.target.value)}
              className={inputClass("registrationExpiryDate")}
            /> */}

            <CustomDatePicker
              id="date"
              value={formData.registrationExpiryDate ? new Date(formData.registrationExpiryDate) : null}
              onChange={(date) => onChange("registrationExpiryDate", date ? formatDate(date, "YYYY-MM-DD") : "")}
              placeholder="DD/MM/YYYY"
              className={inputClass("registrationExpiryDate")}
            />
          </div>



          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Owner Phone Number
            </label>
            <input
              type="tel"
              value={formData.ownerPhone}
              onChange={(e) => {
                onChange("ownerPhone", e.target.value.replace(/[^\d+\s-]/g, ""));
                if (fieldErrors.ownerPhone) onClearError("ownerPhone");
              }}
              className={inputClass("ownerPhone")}
              placeholder="e.g. 9876543210"
              maxLength={10}
            />
            {fieldErrors.ownerPhone && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.ownerPhone}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Owner Name
            </label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => {
                onChange("ownerName", e.target.value);
                if (fieldErrors.ownerName) onClearError("ownerName");
              }}
              className={`${inputClass("ownerName")} capitalize`}
              placeholder="Enter owner name"
              maxLength={50}
            />
            {fieldErrors.ownerName && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.ownerName}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleInfoSection;
