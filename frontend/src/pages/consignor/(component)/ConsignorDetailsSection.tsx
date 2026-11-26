import type { ConsignorRecord } from "@/services/api";

const ConsignorDetailsSection: React.FC<{ consignor: ConsignorRecord }> = ({
  consignor,
}) => (
  <section className="overflow-hidden rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06),0_4px_16px_rgba(15,42,71,0.04)]">
    <div className="grid gap-5 border-b border-[#D5DDE6] px-5 py-4 sm:grid-cols-2">
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Consignor Name</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">{consignor.name}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Address</h2>
        <p className="mt-1 whitespace-pre-wrap text-[14px] text-[#17222E]">
          {consignor.address || "-"}
        </p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Email</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">{consignor.email || "-"}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Mobile Number</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">
          {consignor.phone_number || "-"}
        </p>
      </div>
    </div>
  </section>
);

export default ConsignorDetailsSection;
