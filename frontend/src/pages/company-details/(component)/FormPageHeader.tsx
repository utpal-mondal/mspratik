import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface FormPageHeaderProps {
  title: string;
  description: string;
  backHref?: string;
}

const FormPageHeader: React.FC<FormPageHeaderProps> = ({
  title,
  description,
  backHref = "/company-details",
}) => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="flex flex-col gap-2">
        <Link
          href={backHref}
          className="flex items-center gap-1 text-xs font-semibold tracking-[0.1em] uppercase text-[#4D6178] hover:text-[#0F2A47] transition-colors w-fit"
        >
          <ChevronLeft size={13} />
          Company Master
        </Link>
        <h3 className="m-0 text-[24px] leading-[1.2] font-semibold text-[#0F2A47]">
          {title}
        </h3>
        <div className="text-[15px] leading-[1.5] text-[#4D5B6A]">{description}</div>
      </div>
    </div>
  );
};

export default FormPageHeader;
