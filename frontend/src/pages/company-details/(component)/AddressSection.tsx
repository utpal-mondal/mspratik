import { MapPin } from "lucide-react";
import { SectionProps } from "@/types/company-details/types";

const AddressSection: React.FC<SectionProps> = ({
  formData,
  inputClass,
  onChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <MapPin size={20} className="text-gray-500" />
          Address
        </h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => onChange("address", e.target.value)}
              className={inputClass("address")}
              placeholder="Street and number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address 2</label>
            <input
              type="text"
              value={formData.address2}
              onChange={(e) => onChange("address2", e.target.value)}
              className={inputClass("address2")}
              placeholder="Additional address line"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Post Code</label>
            <input
              type="text"
              value={formData.postCode}
              onChange={(e) => onChange("postCode", e.target.value)}
              className={inputClass("postCode")}
              placeholder="Enter post code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => onChange("city", e.target.value)}
              className={inputClass("city")}
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => onChange("region", e.target.value)}
              className={inputClass("region")}
              placeholder="Enter region"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => onChange("country", e.target.value)}
              className={inputClass("country")}
              placeholder="Enter country"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSection;
