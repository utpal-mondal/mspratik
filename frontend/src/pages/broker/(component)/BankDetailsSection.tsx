import { useEffect, useState } from "react";
import { SectionProps } from "@/types/broker-entry/types";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import apiService from "@/services/api";

interface BankOption {
  value: string;
  label: string;
}

const BankDetailsSection: React.FC<SectionProps> = ({
  formData,
  fieldErrors,
  inputClass,
  onChange,
  onClearError,
}) => {
  const [bankOptions, setBankOptions] = useState<BankOption[]>([]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await apiService.getAllBanks();
        const banks = res?.data?.data || [];
        setBankOptions(
          banks.map((b: { id: number; bank_name: string }) => ({
            value: String(b.id),
            label: b.bank_name,
          }))
        );
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    };
    fetchBanks();
  }, []);

  return (
    <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
      <div className="px-6 pt-4">
        <h2 className="text-base font-semibold text-[#0F2A47]">Bank Details</h2>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Banker Name
            </label>
            <input
              type="text"
              value={formData.bankerName}
              onChange={(e) => {
                onChange("bankerName", e.target.value);
                if (fieldErrors.bankerName) onClearError("bankerName");
              }}
              className={`${inputClass("bankerName")} capitalize`}
              placeholder="Enter Banker name"
              maxLength={50}
            />
            {fieldErrors.bankerName && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.bankerName}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Bank
            </label>
            <SearchableDropdown
              options={bankOptions}
              value={bankOptions.find((o) => o.value === formData.bankId) || null}
              onChange={(option) => {
                onChange("bankId", option ? option.value : "");
                if (fieldErrors.bankId) onClearError("bankId");
              }}
              placeholder="Select bank"
              searchPlaceholder="Search bank..."
              labelKey="value"
              displayKey="label"
              className="w-full"
              buttonClassName="h-10 text-[13px] !rounded !border-[#C5CFDB]"
            />
            {fieldErrors.bankId && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.bankId}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Branch Name
            </label>
            <input
              type="text"
              value={formData.branchName}
              onChange={(e) => {
                onChange("branchName", e.target.value);
                if (fieldErrors.branchName) onClearError("branchName");
              }}
              className={`${inputClass("branchName")} capitalize`}
              placeholder="Enter Branch name"
              maxLength={50}
            />
            {fieldErrors.branchName && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.branchName}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Account No
            </label>
            <input
              type="text"
              value={formData.accountNo}
              onChange={(e) => {
                onChange("accountNo", e.target.value.replace(/\D/g, ""));
                if (fieldErrors.accountNo) onClearError("accountNo");
              }}
              className={inputClass("accountNo")}
              placeholder="Enter Account No"
              maxLength={20}
            />
            {fieldErrors.accountNo && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.accountNo}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              IFSC Code
            </label>
            <input
              type="text"
              value={formData.ifscCode}
              onChange={(e) => {
                onChange("ifscCode", e.target.value.toUpperCase());
                if (fieldErrors.ifscCode) onClearError("ifscCode");
              }}
              className={`${inputClass("ifscCode")} uppercase`}
              placeholder="Enter IFSC Code"
              maxLength={11}
            />
            {fieldErrors.ifscCode && (
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.ifscCode}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsSection;
