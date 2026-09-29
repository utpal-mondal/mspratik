import { IdCard } from "lucide-react";
import { SectionProps } from "@/types/driver-entry/types";
import ImageUpload from "@/components/ui/ImageUpload";

const DocumentsSection: React.FC<SectionProps> = ({
  formData,
  fieldErrors,
  onFileChange,
  onClearError,
}) => {
  const handleFile = (
    field: "driverPhoto" | "licenceImage",
    file: File | null
  ) => {
    onFileChange(field, file);
    if (fieldErrors[field]) onClearError(field);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-5 py-3 border-b border-gray-200">
        <h2 className="text-base font-medium text-gray-900 flex items-center gap-2">
          <IdCard size={18} className="text-gray-500" />
          Documents
        </h2>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ImageUpload
            label="Driver Photo"
            file={formData.driverPhoto}
            error={fieldErrors.driverPhoto}
            onSelect={(file) => handleFile("driverPhoto", file)}
          />

          <ImageUpload
            label="Driving Licence Image"
            file={formData.licenceImage}
            error={fieldErrors.licenceImage}
            onSelect={(file) => handleFile("licenceImage", file)}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentsSection;
