import { Eye, Pencil, Trash2, Users } from "lucide-react";
import ActionMenu, { ActionMenuItem } from "@/components/ui/ActionMenu";
import { ClientRecord } from "@/types/clients/types";

interface ClientTableProps {
  clients: ClientRecord[];
  loading: boolean;
  page: number;
  limit: number;
  onView: (clientId: number) => void;
  onDelete: (client: ClientRecord) => void;
}

const thBase =
  "bg-[#0F2A47] text-white text-left px-4 py-3.5 text-xs font-semibold tracking-[0.07em] uppercase whitespace-nowrap";
const tdBase =
  "px-4 py-3 border-b border-[#E6EBF1] text-[#3B4957] whitespace-nowrap";

const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  loading,
  page,
  limit,
  onView,
  onDelete,
}) => {
  const actions = (client: ClientRecord): ActionMenuItem[] => [
    {
      label: "View",
      icon: Eye,
      onClick: () => onView(client.id),
    },
    {
      label: "Edit",
      icon: Pencil,
      href: `/client/update?id=${client.id}`,
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: () => onDelete(client),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
        <thead>
          <tr>
            <th scope="col" className={`${thBase} pl-6 w-14`}>
              Sl
            </th>
            <th scope="col" className={thBase}>
              Name
            </th>
            <th scope="col" className={thBase}>
              Contact NO
            </th>
            <th scope="col" className={thBase}>
              Email ID
            </th>
            <th scope="col" className={thBase}>
              Contact Person Name
            </th>
            <th scope="col" className={`${thBase} pr-6`}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-[#5B6A7A]">
                Loading clients...
              </td>
            </tr>
          ) : clients.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center">
                <Users className="mx-auto h-8 w-8 text-[#C5CFDB]" />
                <p className="mt-2 text-[13px] text-[#5B6A7A]">No clients found</p>
              </td>
            </tr>
          ) : (
            clients.map((client, index) => (
              <tr
                key={client.id}
                className={`transition-colors hover:bg-[#EAF0F7] ${
                  index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                }`}
              >
                <td className={`${tdBase} pl-6 text-[#7B8896]`}>
                  {(page - 1) * limit + index + 1}
                </td>
                <td className={`${tdBase} font-semibold text-[#0F2A47]`}>
                  <span
                    className="capitalize cursor-pointer hover:underline"
                    onClick={() => onView(client.id)}
                  >
                    {client.client_name}
                  </span>
                </td>
                <td className={tdBase}>{client.contact_no || "-"}</td>
                <td className={tdBase}>{client.email_id || "-"}</td>
                <td className={`${tdBase} capitalize`}>
                  {client.contact_person || "-"}
                </td>
                <td className={`${tdBase} pr-6`}>
                  <ActionMenu items={actions(client)} buttonLabel="Client actions" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;
