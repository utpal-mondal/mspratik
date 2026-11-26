import type { FirmRecord } from "@/services/api";

const formatCash = (value?: number | null) =>
  value == null
    ? "-"
    : value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const FirmDetailsSection: React.FC<{ firm: FirmRecord }> = ({ firm }) => (
  <section className="overflow-hidden rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06),0_4px_16px_rgba(15,42,71,0.04)]">
    <div className="grid gap-5 px-5 py-4 sm:grid-cols-2">
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Name</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">{firm.name}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Address 1</h2>
        <p className="mt-1 whitespace-pre-wrap text-[14px] text-[#17222E]">
          {firm.address_1 || "-"}
        </p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Address 2</h2>
        <p className="mt-1 whitespace-pre-wrap text-[14px] text-[#17222E]">
          {firm.address_2 || "-"}
        </p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">PAN No</h2>
        <p className="mt-1 uppercase text-[14px] text-[#17222E]">{firm.pan_no}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">GSTN No</h2>
        <p className="mt-1 uppercase text-[14px] text-[#17222E]">{firm.gstn_no}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Cash In Hand (Opening)</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">{formatCash(firm.cash_in_hand)}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Short Form</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">{firm.short_form || "-"}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">TAN No</h2>
        <p className="mt-1 uppercase text-[14px] text-[#17222E]">{firm.tan_no}</p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#3B4957]">Starting Session</h2>
        <p className="mt-1 text-[14px] text-[#17222E]">
          {firm.starting_session || "-"}
        </p>
      </div>
    </div>
  </section>
);

export default FirmDetailsSection;
