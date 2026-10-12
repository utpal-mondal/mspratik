import { useEffect, useState } from "react";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import apiService from "@/services/api";

interface ClientOption {
  value: string;
  label: string;
}

interface ClientSectionProps {
  clientId: string;
  error?: string;
  onChange: (value: string) => void;
  onClearError: () => void;
}

const ClientSection: React.FC<ClientSectionProps> = ({
  clientId,
  error,
  onChange,
  onClearError,
}) => {
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await apiService.getAllClients({ page: 1, limit: 100 });
        const clients = res?.data?.data || [];
        setClientOptions(
          clients.map((c: { id: number; client_name: string }) => ({
            value: String(c.id),
            label: c.client_name,
          }))
        );
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="bg-white">
      <div className="flex items-center h-10 px-5 text-black">
        <h2 className="m-0 text-xs font-semibold tracking-[0.08em] uppercase">
          Client Details
        </h2>
      </div>
      <div className="px-5 py-4">
        <div className="max-w-[320px] flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#3B4957]">
            Client Name <span className="text-[#A12B2B]">*</span>
          </label>
          <SearchableDropdown
            options={clientOptions}
            value={clientOptions.find((o) => o.value === clientId) || null}
            onChange={(option) => {
              onChange(option ? option.value : "");
              if (error) onClearError();
            }}
            placeholder="Select client"
            searchPlaceholder="Search client..."
            labelKey="value"
            displayKey="label"
            allowClear={false}
            className="w-full"
            buttonClassName={`text-[13px] ${error ? "border-red-500" : ""}`}
          />
          {error && <p className="mt-0.5 text-xs text-[#A12B2B]">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ClientSection;
