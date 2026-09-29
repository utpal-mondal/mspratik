import { FileText } from "lucide-react";
import { SectionProps } from "@/types/vehicle-entry/types";
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-5 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          RC & Documents
        </h2>
      </div>
      <div className="p-5">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
