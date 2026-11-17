import { SectionProps } from "@/types/company-details/types";

const labelClass = "block text-[13px] font-medium text-[#3B4957] mb-1.5";

const AddressSection: React.FC<SectionProps> = ({
  formData,
  inputClass,
  onChange,
}) => {
  return (
    <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
      <div className="px-6 pt-4">
        <h2 className="text-base font-semibold text-[#0F2A47]">Address</h2>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => onChange("address", e.target.value)}
              className={inputClass("address")}
              placeholder="Street and number"
              maxLength={100}
            />
          </div>
          <div>
            <label className={labelClass}>Address 2</label>
            <input
              type="text"
              value={formData.address2}
              onChange={(e) => onChange("address2", e.target.value)}
              className={inputClass("address2")}
              placeholder="Additional address line"
              maxLength={100}
            />
          </div>
          <div>
            <label className={labelClass}>Post Code</label>
            <input
              type="text"
              value={formData.postCode}
              onChange={(e) => onChange("postCode", e.target.value)}
              className={inputClass("postCode")}
              placeholder="Enter post code"
              maxLength={12}
            />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => onChange("city", e.target.value)}
              className={`${inputClass("city")} capitalize`}
              placeholder="Enter city"
              maxLength={100}
            />
          </div>
          <div>
            <label className={labelClass}>Region</label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => onChange("region", e.target.value)}
              className={`${inputClass("region")} capitalize`}
              placeholder="Enter region"
              maxLength={50}
            />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => onChange("country", e.target.value)}
              className={`${inputClass("country")} capitalize`}
              placeholder="Enter country"
              maxLength={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSection;
