import type { FolioData } from "@/lib/api";
import { TripSection } from "./TripFields";

const formatDate = (value: string) => {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatAmount = (value: number | null) =>
  value == null ? "0.00" : value.toLocaleString("en-IN", { minimumFractionDigits: 2 });

const FolioDetails = ({ folio }: { folio: FolioData }) => (
  <TripSection title="Folio Details" columns={5}>
    <div>
      <h3 className="text-xs font-semibold text-[#5B6A7A]">Folio Date</h3>
      <p className="mt-1 text-[13px] text-[#17222E]">{formatDate(folio.date)}</p>
    </div>
    <div>
      <h3 className="text-xs font-semibold text-[#5B6A7A]">Folio No</h3>
      <p className="mt-1 text-[13px] text-[#17222E]">{folio.folio_no}</p>
    </div>
    <div>
      <h3 className="text-xs font-semibold text-[#5B6A7A]">Advance Amount</h3>
      <p className="mt-1 text-[13px] text-[#17222E]">{formatAmount(folio.amount)}</p>
    </div>
    <div>
      <h3 className="text-xs font-semibold text-[#5B6A7A]">Bank Amount</h3>
      <p className="mt-1 text-[13px] text-[#17222E]">{formatAmount(folio.bank_payment)}</p>
    </div>
    <div>
      <h3 className="text-xs font-semibold text-[#5B6A7A]">Branch</h3>
      <p className="mt-1 text-[13px] text-[#17222E]">{folio.branch.name}</p>
    </div>
  </TripSection>
);

export default FolioDetails;
