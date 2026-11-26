import { Building2 } from "lucide-react";
import type { BranchInput, BranchTextField } from "@/lib/api";
import type { BranchGeocodeStatus } from "@/hook/useBranchGeocode";

interface BranchInfoSectionProps {
  formData: BranchInput;
  fieldErrors: Record<string, string>;
  onChange: (field: BranchTextField, value: string) => void;
  geocodeStatus: BranchGeocodeStatus;
  geocodeMessage: string;
}

const fields: { name: BranchTextField; label: string; required: boolean }[] = [
  { name: "name", label: "Branch Name", required: true },
  { name: "head", label: "Head", required: true },
  { name: "phone_number", label: "Phone Number", required: false },
  { name: "email", label: "Email", required: false },
  { name: "address", label: "Address", required: true },
];

const placeholders: Record<BranchTextField, string> = {
  name: "Enter branch name",
  head: "Enter branch head",
  address: "Enter branch address",
  phone_number: "Enter phone number",
  email: "Enter email address",
};

const BranchInfoSection: React.FC<BranchInfoSectionProps> = ({
  formData,
  fieldErrors,
  onChange,
  geocodeStatus,
  geocodeMessage,
}) => (
  <div>
    <div className="border-b border-gray-100 px-1 py-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Building2 size={16} className="text-blue-600" />
        Branch Information
      </h2>
    </div>
    <div className="p-2">
      <div className="grid grid-cols-1 gap-4">
        {fields.map((field) => (
          <label key={field.name}>
            <span className="mb-1.5 block text-[15px] font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </span>
            <input
              type={field.name === "email" ? "email" : field.name === "phone_number" ? "tel" : "text"}
              inputMode={field.name === "phone_number" ? "numeric" : undefined}
              value={formData[field.name]}
              required={field.required}
              placeholder={placeholders[field.name]}
              maxLength={field.name === "phone_number" ? 10 : field.name === "address" ? 255 : 100}
              onChange={(event) =>
                onChange(
                  field.name,
                  field.name === "phone_number"
                    ? event.target.value.replace(/\D/g, "")
                    : event.target.value,
                )
              }
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 ${
                fieldErrors[field.name]
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {fieldErrors[field.name] && (
              <p data-field-error className="mt-1 text-xs text-red-600">
                {fieldErrors[field.name]}
              </p>
            )}
          </label>
        ))}
        <div className="grid grid-cols-2 gap-4">
          <label>
            <span className="mb-1.5 block text-[15px] font-medium text-gray-700">Latitude</span>
            <input
              readOnly
              value={formData.latitude == null ? "" : formData.latitude.toFixed(7)}
              placeholder="Auto-filled from address"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 outline-none"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-[15px] font-medium text-gray-700">Longitude</span>
            <input
              readOnly
              value={formData.longitude == null ? "" : formData.longitude.toFixed(7)}
              placeholder="Auto-filled from address"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 outline-none"
            />
          </label>
        </div>
        <p
          className={`text-xs ${
            geocodeStatus === "error" || geocodeStatus === "not-found"
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {geocodeMessage}
        </p>
      </div>
    </div>
  </div>
);

export default BranchInfoSection;
