import { SectionProps } from "@/types/vehicle-entry/types";
import CustomDatePicker from "@/components/ui/DatePicker";
import { formatDate } from "@/utils/dateRangeUtils";
// import ImageUpload from "@/components/ui/ImageUpload";

const DocumentsSection: React.FC<SectionProps> = ({
  formData,
  fieldErrors,
  inputClass,
  onChange,
  // onFileChange,
  onClearError,
}) => {
  // const handleFile = (
  //   field: "vehicleImage" | "rcBookImage",
  //   file: File | null
  // ) => {
  //   onFileChange(field, file);
  //   if (fieldErrors[field]) onClearError(field);
  // };

  return (
    <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
      <div className="px-6 pt-4">
        <h2 className="text-base font-semibold text-[#0F2A47]">License Details</h2>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              RC Number
            </label>
            <input
              type="text"
              value={formData.rcNumber}
              onChange={(e) => {
                onChange("rcNumber", e.target.value.toUpperCase());
                if (fieldErrors.rcNumber) onClearError("rcNumber");
              }}
              className={`${inputClass("rcNumber")} uppercase`}
              placeholder="Enter RC number"
              maxLength={20}
            />
            {fieldErrors.rcNumber && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.rcNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Permit Number
            </label>
            <input
              type="text"
              value={formData.permitNumber}
              onChange={(e) => {
                onChange("permitNumber", e.target.value.toUpperCase());
                if (fieldErrors.permitNumber) onClearError("permitNumber");
              }}
              className={`${inputClass("permitNumber")} uppercase`}
              placeholder="Enter permit number"
              maxLength={20}
            />
            {fieldErrors.permitNumber && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.permitNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Insurance Number
            </label>
            <input
              type="text"
              value={formData.insuranceNumber}
              onChange={(e) => {
                onChange("insuranceNumber", e.target.value.toUpperCase());
                if (fieldErrors.insuranceNumber) onClearError("insuranceNumber");
              }}
              className={`${inputClass("insuranceNumber")} uppercase`}
              placeholder="Enter insurance number"
              maxLength={20}
            />
            {fieldErrors.insuranceNumber && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.insuranceNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Insurance Expiry Date
            </label>
            <CustomDatePicker
              id="insuranceExpiryDate"
              value={formData.insuranceExpiryDate ? new Date(formData.insuranceExpiryDate) : null}
              onChange={(date) => {
                onChange("insuranceExpiryDate", date ? formatDate(date, "YYYY-MM-DD") : "");
                if (fieldErrors.insuranceExpiryDate) onClearError("insuranceExpiryDate");
              }}
              placeholder="DD/MM/YYYY"
              className={inputClass("insuranceExpiryDate")}
            />
            {fieldErrors.insuranceExpiryDate && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.insuranceExpiryDate}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              PUC Number
            </label>
            <input
              type="text"
              value={formData.pucNumber}
              onChange={(e) => {
                onChange("pucNumber", e.target.value.toUpperCase());
                if (fieldErrors.pucNumber) onClearError("pucNumber");
              }}
              className={`${inputClass("pucNumber")} uppercase`}
              placeholder="Enter PUC number"
              maxLength={20}
            />
            {fieldErrors.pucNumber && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.pucNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              PUC Expiry Date
            </label>
            <CustomDatePicker
              id="pucExpiryDate"
              value={formData.pucExpiryDate ? new Date(formData.pucExpiryDate) : null}
              onChange={(date) => {
                onChange("pucExpiryDate", date ? formatDate(date, "YYYY-MM-DD") : "");
                if (fieldErrors.pucExpiryDate) onClearError("pucExpiryDate");
              }}
              placeholder="DD/MM/YYYY"
              className={inputClass("pucExpiryDate")}
            />
            {fieldErrors.pucExpiryDate && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.pucExpiryDate}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Road Tax Expiry Date
            </label>
            <CustomDatePicker
              id="roadTaxExpiryDate"
              value={formData.roadTaxExpiryDate ? new Date(formData.roadTaxExpiryDate) : null}
              onChange={(date) => {
                onChange("roadTaxExpiryDate", date ? formatDate(date, "YYYY-MM-DD") : "");
                if (fieldErrors.roadTaxExpiryDate) onClearError("roadTaxExpiryDate");
              }}
              placeholder="DD/MM/YYYY"
              className={inputClass("roadTaxExpiryDate")}
            />
            {fieldErrors.roadTaxExpiryDate && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.roadTaxExpiryDate}</p>
            )}
          </div>

          {/* <ImageUpload
            label="Vehicle Image"
            file={formData.vehicleImage}
            error={fieldErrors.vehicleImage}
            onSelect={(file) => handleFile("vehicleImage", file)}
          />

          <ImageUpload
            label="RC Book Image"
            file={formData.rcBookImage}
            error={fieldErrors.rcBookImage}
            onSelect={(file) => handleFile("rcBookImage", file)}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default DocumentsSection;
