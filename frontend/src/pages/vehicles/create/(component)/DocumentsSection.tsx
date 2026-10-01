import { FileText } from "lucide-react";
import { SectionProps } from "@/types/vehicle-entry/types";
import CustomDatePicker from "@/components/ui/DatePicker";
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
    <div className="bg-white">
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          License Details
        </h2>
      </div>
      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="mt-1 text-xs text-red-600">{fieldErrors.rcNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="mt-1 text-xs text-red-600">{fieldErrors.permitNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="mt-1 text-xs text-red-600">{fieldErrors.insuranceNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Expiry Date
            </label>
            <CustomDatePicker
              id="insuranceExpiryDate"
              value={formData.insuranceExpiryDate ? new Date(formData.insuranceExpiryDate) : null}
              onChange={(date) => {
                onChange("insuranceExpiryDate", date ? date.toISOString().split("T")[0] : "");
                if (fieldErrors.insuranceExpiryDate) onClearError("insuranceExpiryDate");
              }}
              placeholder="DD/MM/YYYY"
              className={inputClass("insuranceExpiryDate")}
            />
            {fieldErrors.insuranceExpiryDate && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.insuranceExpiryDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="mt-1 text-xs text-red-600">{fieldErrors.pucNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PUC Expiry Date
            </label>
            <CustomDatePicker
              id="pucExpiryDate"
              value={formData.pucExpiryDate ? new Date(formData.pucExpiryDate) : null}
              onChange={(date) => {
                onChange("pucExpiryDate", date ? date.toISOString().split("T")[0] : "");
                if (fieldErrors.pucExpiryDate) onClearError("pucExpiryDate");
              }}
              placeholder="DD/MM/YYYY"
              className={inputClass("pucExpiryDate")}
            />
            {fieldErrors.pucExpiryDate && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.pucExpiryDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Road Tax Expiry Date
            </label>
            <CustomDatePicker
              id="roadTaxExpiryDate"
              value={formData.roadTaxExpiryDate ? new Date(formData.roadTaxExpiryDate) : null}
              onChange={(date) => {
                onChange("roadTaxExpiryDate", date ? date.toISOString().split("T")[0] : "");
                if (fieldErrors.roadTaxExpiryDate) onClearError("roadTaxExpiryDate");
              }}
              placeholder="DD/MM/YYYY"
              className={inputClass("roadTaxExpiryDate")}
            />
            {fieldErrors.roadTaxExpiryDate && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.roadTaxExpiryDate}</p>
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
