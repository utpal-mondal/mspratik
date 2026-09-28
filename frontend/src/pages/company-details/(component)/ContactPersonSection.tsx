import { Phone } from "lucide-react";
import { SectionProps } from "@/types/company-details/types";

const ContactPersonSection: React.FC<SectionProps> = ({
  formData,
  inputClass,
  onChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Phone size={20} className="text-gray-500" />
          Contact Person
        </h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => onChange("contactName", e.target.value)}
              className={inputClass("contactName")}
              placeholder="Enter contact name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => onChange("contactEmail", e.target.value)}
              className={inputClass("contactEmail")}
              placeholder="Enter contact email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => onChange("contactPhone", e.target.value)}
              className={inputClass("contactPhone")}
              placeholder="Enter contact phone"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPersonSection;
