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
    <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
      <div className="px-6 pt-4">
        <h2 className="text-base font-semibold text-[#0F2A47]">Broker Settings</h2>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
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
              className="w-full"
              buttonClassName="h-10 text-[13px] !rounded !border-[#C5CFDB]"
            />
            {fieldErrors.brokerType && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.brokerType}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
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
              className="w-full"
              buttonClassName="h-10 text-[13px] !rounded !border-[#C5CFDB]"
            />
            {fieldErrors.ownerBillType && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.ownerBillType}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
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
              className="w-full"
              buttonClassName="h-10 text-[13px] !rounded !border-[#C5CFDB]"
            />
            {fieldErrors.qtyRound && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.qtyRound}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerSettingsSection;
