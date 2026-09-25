import { Clock } from "lucide-react";

interface Credential {
  role: string;
  userName: string;
  password: string;
  access: string;
  color: "red" | "blue" | "green";
}

const credentials: Credential[] = [
  {
    role: "Company User",
    userName: "companyUser",
    password: "company@user123",
    access: "Full Access",
    color: "red",
  },
  {
    role: "Normal User",
    userName: "normalUser",
    password: "normal@user123",
    access: "Full Access",
    color: "blue",
  },
  // {
  //   role: "Unique Tel Company",
  //   userName: "uniqueTelCompany@123",
  //   password: "unique@123",
  //   access: "Full Access",
  //   color: "green",
  // },
];

const colorClasses = {
  red: {
    title: "text-red-600",
    badge: "bg-red-50 text-red-600 border border-red-100",
  },
  blue: {
    title: "text-blue-600",
    badge: "bg-blue-50 text-blue-600 border border-blue-100",
  },
  green: {
    title: "text-green-600",
    badge: "bg-green-50 text-green-600 border border-green-100",
  },
};

interface SampleCredentialsProps {
  onSelect: (credential: Pick<Credential, "userName" | "password">) => void;
}

export default function SampleCredentials({
  onSelect,
}: SampleCredentialsProps) {
  return (
    <div
      className="mt-3 border-t border-slate-200 pt-3"
      style={{ animationDelay: "600ms" }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Clock size={15} className="text-blue-600" />

        <h3 className="text-xs font-semibold  tracking-wide mt-2 text-slate-700">
          Demo Login
        </h3>
      </div>

      {/* Credential Cards */}
      <div className="space-y-2">
        {credentials.map((credential, index) => (
          <button
            key={index}
            type="button"
            onClick={() =>
              onSelect({
                userName: credential.userName,
                password: credential.password,
              })
            }
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left transition-all hover:border-blue-300 hover:bg-slate-50"
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide ${colorClasses[credential.color].title}`}
              >
                {credential.role}
              </span>

              <span
                className={`rounded px-2 py-0.5 text-[10px] font-medium ${colorClasses[credential.color].badge}`}
              >
                {credential.access}
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex">
                <span className="w-16 font-medium text-slate-500">User Name</span>
                <span className="truncate">{credential.userName}</span>
              </div>

              <div className="flex">
                <span className="w-16 font-medium text-slate-500">
                  Password
                </span>
                <span>{credential.password}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-500">
        Click any credential card to auto-fill the login form.
      </p>

      <p className="mt-3 text-center text-[11px] text-slate-500">
        Use these credentials to explore different user roles and permissions
      </p>
    </div>
  );
}
