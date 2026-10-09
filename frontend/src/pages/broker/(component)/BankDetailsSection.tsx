import { useEffect, useState } from "react";
import { Landmark } from "lucide-react";
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
    <div className="bg-white">
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Landmark size={16} className="text-blue-600" />
          Bank Details
        </h2>
      </div>
      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="mt-1 text-xs text-red-600">{fieldErrors.bankerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-[27rem]"
              buttonClassName="text-xs"
            />
            {fieldErrors.bankId && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.bankId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="mt-1 text-xs text-red-600">{fieldErrors.branchName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="mt-1 text-xs text-red-600">{fieldErrors.accountNo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="mt-1 text-xs text-red-600">{fieldErrors.ifscCode}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsSection;
