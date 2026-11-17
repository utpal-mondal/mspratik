import { SectionProps } from "@/types/company-details/types";

const labelClass = "block text-[15px] font-medium text-[#3B4957] mb-1.5";

const ContactPersonSection: React.FC<SectionProps> = ({
  formData,
  inputClass,
  onChange,
}) => {
  return (
    <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
      <div className="px-6 pt-4">
        <h2 className="text-base font-semibold text-[#0F2A47]">Contact Person</h2>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Contact Name</label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => onChange("contactName", e.target.value)}
              className={`${inputClass("contactName")} capitalize`}
              placeholder="Enter contact name"
              maxLength={30}
            />
          </div>
          <div>
            <label className={labelClass}>Contact Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => onChange("contactEmail", e.target.value)}
              className={inputClass("contactEmail")}
              placeholder="Enter contact email"
              maxLength={50}
            />
          </div>
          <div>
            <label className={labelClass}>Contact Phone</label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => onChange("contactPhone", e.target.value)}
              className={inputClass("contactPhone")}
              placeholder="Enter contact phone"
              maxLength={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPersonSection;
