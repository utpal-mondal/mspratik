import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  rightContent?: ReactNode;
}

const Card = ({
  title,
  children,
  className = "",
  bodyClassName = "",
  headerClassName = "",
  rightContent,
}: CardProps) => {
  return (
    <div
      className={clsx(
        "overflow-hidden bg-white shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className={clsx("flex items-center justify-between border-b border-slate-200  px-6 py-2", headerClassName)}>
        <h2 className="text-base font-semibold text-slate-800 mb-0">{title}</h2>

        {rightContent && (
          <div className="flex items-center">{rightContent}</div>
        )}
      </div>

      {/* Body */}
      <div className={clsx("p-4", bodyClassName)}>{children}</div>
    </div>
  );
};

export default Card;
