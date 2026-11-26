import type { BranchData } from "@/lib/api";

const BranchDetailsSection: React.FC<{ branch: BranchData }> = ({ branch }) => (
  <section className="overflow-hidden rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06),0_4px_16px_rgba(15,42,71,0.04)]">
    <div className="grid gap-5 border-b border-[#D5DDE6] px-5 py-4 sm:grid-cols-2">
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Branch Name</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">{branch.name}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Head</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">{branch.head}</p>
      </div>
      <div className="sm:col-span-2">
        <h2 className="text-sm font-bold text-[#3B4957]">Address</h2>
        <p className="mt-1 whitespace-pre-wrap text-[14px] text-[#17222E]">{branch.address}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Phone Number</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">{branch.phone_number || "-"}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Email</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">{branch.email || "-"}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Latitude</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">{branch.latitude?.toFixed(7) ?? "-"}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Longitude</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">{branch.longitude?.toFixed(7) ?? "-"}</p>
      </div>
    </div>
  </section>
);

export default BranchDetailsSection;
