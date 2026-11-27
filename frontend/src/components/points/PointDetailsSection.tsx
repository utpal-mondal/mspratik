import type { PointData } from "@/lib/api";

const PointDetailsSection: React.FC<{ point: PointData }> = ({ point }) => (
  <section className="overflow-hidden rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06),0_4px_16px_rgba(15,42,71,0.04)]">
    <div className="grid gap-5 border-b border-[#D5DDE6] px-5 py-4 sm:grid-cols-2">
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Name</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">{point.name}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Contact Person</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">{point.contact_person || "-"}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Contact Person Mobile No</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">
          {point.contact_person_mobile_no || "-"}
        </p>
      </div>
    </div>
  </section>
);

export default PointDetailsSection;
