import { User } from "lucide-react";
import type { ConsignorPayload } from "@/services/api";

type ConsignorField = keyof ConsignorPayload;

interface ConsignorInfoSectionProps {
  formData: ConsignorPayload;
  fieldErrors: Record<string, string>;
  onChange: (field: ConsignorField, value: string) => void;
}

const fields: { name: ConsignorField; label: string; required: boolean }[] = [
  { name: "name", label: "Consignor Name", required: true },
  { name: "address", label: "Address", required: false },
  { name: "email", label: "Email", required: false },
  { name: "phone_number", label: "Mobile Number", required: false },
];

const placeholders: Record<ConsignorField, string> = {
  name: "Enter consignor name",
  address: "Enter address",
  email: "Enter email address",
  phone_number: "Enter 10-digit mobile number",
};

const ConsignorInfoSection: React.FC<ConsignorInfoSectionProps> = ({
  formData,
  fieldErrors,
  onChange,
}) => (
  <div>
    <div className="border-b border-gray-100 px-1 py-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <User size={16} className="text-blue-600" />
        Consignor Information
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
              type={
                field.name === "email"
                  ? "email"
                  : field.name === "phone_number"
                    ? "tel"
                    : "text"
              }
              inputMode={field.name === "phone_number" ? "numeric" : undefined}
              value={formData[field.name]}
              required={field.required}
              placeholder={placeholders[field.name]}
              maxLength={field.name === "phone_number" ? 10 : field.name === "address" ? 255 : 100}
              pattern={field.name === "phone_number" ? "[0-9]{10}" : undefined}
              onChange={(event) =>
                onChange(
                  field.name,
                  field.name === "phone_number"
                    ? event.target.value.replace(/\D/g, "").slice(0, 10)
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
      </div>
    </div>
  </div>
);

export default ConsignorInfoSection;
