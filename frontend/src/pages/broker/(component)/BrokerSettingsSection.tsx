import { Settings2 } from "lucide-react";
import { SectionProps } from "@/types/broker-entry/types";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";

const brokerTypeOptions = [
  { value: "normal", label: "Normal" },
  { value: "special", label: "Special" },
];

const ownerBillTypeOptions = [
  { value: "normal", label: "Normal" },
  { value: "without_pan", label: "Without PAN" },
];

const qtyRoundOptions = [
  { value: "not_applicable", label: "Not Applicable" },
  { value: "applicable", label: "Applicable" },
  // { value: "round_up", label: "Round Up" },
];

const BrokerSettingsSection: React.FC<SectionProps> = ({
  formData,
  fieldErrors,
  inputClass,
  onChange,
  onClearError,
}) => {
  return (
    <div className="bg-white">
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Settings2 size={16} className="text-blue-600" />
          Broker Settings
        </h2>
      </div>
      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Broker Type
            </label>
            <SearchableDropdown
              options={brokerTypeOptions}
              value={brokerTypeOptions.find((o) => o.value === formData.brokerType) || null}
              onChange={(option) => {
                onChange("brokerType", option ? option.value : "");
                if (fieldErrors.brokerType) onClearError("brokerType");
              }}
              placeholder="Select broker type"
              searchPlaceholder="Search broker type..."
              labelKey="value"
              displayKey="label"
              allowClear={false}
              className="w-[27rem]"
              buttonClassName="text-xs"
            />
            {fieldErrors.brokerType && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.brokerType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Bill Type
            </label>
            <SearchableDropdown
              options={ownerBillTypeOptions}
              value={ownerBillTypeOptions.find((o) => o.value === formData.ownerBillType) || null}
              onChange={(option) => {
                onChange("ownerBillType", option ? option.value : "");
                if (fieldErrors.ownerBillType) onClearError("ownerBillType");
              }}
              placeholder="Select owner bill type"
              searchPlaceholder="Search owner bill type..."
              labelKey="value"
              displayKey="label"
              allowClear={false}
              className="w-[27rem]"
              buttonClassName="text-xs"
            />
            {fieldErrors.ownerBillType && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.ownerBillType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qty Round
            </label>
            <SearchableDropdown
              options={qtyRoundOptions}
              value={qtyRoundOptions.find((o) => o.value === formData.qtyRound) || null}
              onChange={(option) => {
                onChange("qtyRound", option ? option.value : "");
                if (fieldErrors.qtyRound) onClearError("qtyRound");
              }}
              placeholder="Select qty round"
              searchPlaceholder="Search qty round..."
              labelKey="value"
              displayKey="label"
              allowClear={false}
              className="w-[27rem]"
              buttonClassName="text-xs"
            />
            {fieldErrors.qtyRound && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.qtyRound}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerSettingsSection;
