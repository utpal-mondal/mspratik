import type { FirmPayload } from "@/services/api";

export type FirmTextField =
  | "name"
  | "address_1"
  | "address_2"
  | "pan_no"
  | "gstn_no"
  | "short_form"
  | "tan_no";

interface FirmTextInputProps {
  name: FirmTextField;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  required?: boolean;
  maxLength: number;
  pattern?: string;
  uppercase?: boolean;
  onChange: (name: FirmTextField, value: string) => void;
}

const FirmTextInput: React.FC<FirmTextInputProps> = ({
  name,
  label,
  value,
  placeholder,
  error,
  required = false,
  maxLength,
  pattern,
  uppercase = false,
  onChange,
}) => (
  <label>
    <span className="mb-1.5 block text-[15px] font-medium text-[#3B4957]">
      {label} {required && <span className="text-red-500">*</span>}
    </span>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      pattern={pattern}
      onChange={(event) =>
        onChange(name, uppercase ? event.target.value.toUpperCase() : event.target.value)
      }
      className={`h-10 w-full rounded border px-3 text-[13px] transition-colors focus:outline-none focus:ring-2 ${
        error
          ? "border-red-500 focus:ring-red-500/20"
          : "border-[#C5CFDB] focus:border-[#0F2A47] focus:ring-[#0F2A47]/20"
      }`}
    />
    {error && <p className="mt-1 text-xs text-[#A12B2B]">{error}</p>}
  </label>
);

const getStartingYears = () => {
  const now = new Date();
  const currentStartYear =
    now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from(
    { length: Math.max(0, currentStartYear - 2017 + 1) },
    (_, index) => currentStartYear - index,
  );
};

const startingYears = getStartingYears();

interface FirmInfoSectionProps {
  formData: FirmPayload;
  fieldErrors: Record<string, string>;
  onTextChange: (field: FirmTextField, value: string) => void;
  onCashInHandChange: (value: number | null) => void;
  onStartingSessionChange: (value: string) => void;
}

const FirmInfoSection: React.FC<FirmInfoSectionProps> = ({
  formData,
  fieldErrors,
  onTextChange,
  onCashInHandChange,
  onStartingSessionChange,
}) => (
  <section className="overflow-hidden rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
    <div className="px-6 pt-4">
      <h2 className="text-base font-semibold text-[#0F2A47]">Firm Details</h2>
    </div>
    <div className="px-6 py-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FirmTextInput
          name="name"
          label="Name"
          value={formData.name}
          placeholder="Enter Firm Name"
          error={fieldErrors.name}
          required
          maxLength={100}
          onChange={onTextChange}
        />
        <FirmTextInput
          name="address_1"
          label="Address 1"
          value={formData.address_1}
          placeholder="Enter Line One"
          error={fieldErrors.address_1}
          maxLength={255}
          onChange={onTextChange}
        />
        <FirmTextInput
          name="address_2"
          label="Address 2"
          value={formData.address_2}
          placeholder="Enter Line Two"
          error={fieldErrors.address_2}
          maxLength={255}
          onChange={onTextChange}
        />
        <FirmTextInput
          name="pan_no"
          label="PAN No"
          value={formData.pan_no}
          placeholder="Enter PAN No"
          error={fieldErrors.pan_no}
          required
          maxLength={10}
          pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]"
          uppercase
          onChange={onTextChange}
        />
        <FirmTextInput
          name="gstn_no"
          label="GSTN No"
          value={formData.gstn_no}
          placeholder="Enter GSTN No"
          error={fieldErrors.gstn_no}
          required
          maxLength={15}
          pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z]Z[0-9A-Za-z]"
          uppercase
          onChange={onTextChange}
        />
        <label>
          <span className="mb-1.5 block text-[15px] font-medium text-[#3B4957]">
            Cash In Hand (Opening)
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={formData.cash_in_hand ?? ""}
            placeholder="Enter Opening Cash"
            onChange={(event) =>
              onCashInHandChange(
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
            className={`h-10 w-full rounded border px-3 text-[13px] transition-colors focus:outline-none focus:ring-2 ${
              fieldErrors.cash_in_hand
                ? "border-red-500 focus:ring-red-500/20"
                : "border-[#C5CFDB] focus:border-[#0F2A47] focus:ring-[#0F2A47]/20"
            }`}
          />
          {fieldErrors.cash_in_hand && (
            <p className="mt-1 text-xs text-[#A12B2B]">
              {fieldErrors.cash_in_hand}
            </p>
          )}
        </label>
        <FirmTextInput
          name="short_form"
          label="Short Form"
          value={formData.short_form}
          placeholder="Enter Short Form"
          error={fieldErrors.short_form}
          maxLength={10}
          onChange={onTextChange}
        />
        <FirmTextInput
          name="tan_no"
          label="TAN No"
          value={formData.tan_no}
          placeholder="Enter TAN No"
          error={fieldErrors.tan_no}
          required
          maxLength={10}
          pattern="[A-Za-z]{4}[0-9]{5}[A-Za-z]"
          uppercase
          onChange={onTextChange}
        />
        <label>
          <span className="mb-1.5 block text-[15px] font-medium text-[#3B4957]">
            Starting Session
          </span>
          <select
            value={formData.starting_session}
            onChange={(event) => onStartingSessionChange(event.target.value)}
            className={`h-10 w-full rounded border bg-white px-3 text-[13px] text-[#17222E] transition-colors focus:outline-none focus:ring-2 ${
              fieldErrors.starting_session
                ? "border-red-500 focus:ring-red-500/20"
                : "border-[#C5CFDB] focus:border-[#0F2A47] focus:ring-[#0F2A47]/20"
            }`}
          >
            <option value="">Select Session</option>
            {startingYears.map((year) => (
              <option
                key={year}
                value={`${year}-${String((year + 1) % 100).padStart(2, "0")}`}
              >
                {year}-{String((year + 1) % 100).padStart(2, "0")}
              </option>
            ))}
            <option value="ALL">ALL</option>
          </select>
          {fieldErrors.starting_session && (
            <p className="mt-1 text-xs text-[#A12B2B]">
              {fieldErrors.starting_session}
            </p>
          )}
        </label>
      </div>
    </div>
  </section>
);

export default FirmInfoSection;
