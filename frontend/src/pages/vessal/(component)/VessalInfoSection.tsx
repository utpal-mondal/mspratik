import { Ship } from "lucide-react";

export interface VessalFormData {
  name: string;
  price: string;
}

interface VessalInfoSectionProps {
  formData: VessalFormData;
  fieldErrors: { [key: string]: string };
  inputClass: (field: string) => string;
  onChange: (field: keyof VessalFormData, value: string) => void;
  onClearError: (field: string) => void;
}

const VessalInfoSection: React.FC<VessalInfoSectionProps> = ({
  formData,
  fieldErrors,
  inputClass,
  onChange,
  onClearError,
}) => {
  return (
    <div className="">
      <div className="px-1 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Ship size={16} className="text-blue-600" />
          Vessal Information
        </h2>
      </div>
      <div className="p-2">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Vessal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                onChange("name", e.target.value);
                if (fieldErrors.name) onClearError("name");
              }}
              className={`${inputClass("name")} capitalize`}
              placeholder="Enter vessal name"
              maxLength={50}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Price
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={formData.price}
              onChange={(e) => {
                onChange("price", e.target.value.replace(/[^\d.]/g, ""));
                if (fieldErrors.price) onClearError("price");
              }}
              className={inputClass("price")}
              placeholder="e.g. 1500.00"
              maxLength={12}
            />
            {fieldErrors.price && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VessalInfoSection;
