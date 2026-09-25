"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export interface ActionMenuItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  action?: string;
  onClick?: () => void;
  danger?: boolean;
  variant?: "default" | "danger";
  separator?: boolean;
  loading?: boolean;
  disabled?: boolean;
  keepOpen?: boolean;
}

interface ActionsMenuProps {
  items: ActionMenuItem[];
  onAction?: (item: ActionMenuItem) => void;
  buttonLabel?: string;
}

export default function ActionsMenu({
  items,
  onAction,
  buttonLabel = "Actions",
}: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const updatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();

    if (!rect) return;

    const separatorCount = items.filter((item) => item.separator).length;
    const menuWidth = 224; // max-w-[14rem]
    const itemHeight = 32;
    const separatorHeight = 8;
    const padding = 8;
    const menuHeight = items.length * itemHeight + separatorCount * separatorHeight + padding;

    let top = rect.bottom + 6;
    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - 6;
    }
    top = Math.max(6, top);

    let left = rect.left;
    if (left + menuWidth > window.innerWidth) {
      left = rect.right - menuWidth;
    }
    left = Math.max(6, left);

    setPos({
      top,
      left,
    });
  };

  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }

    updatePosition();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  const handleItemClick = (item: ActionMenuItem) => {
    if (item.disabled || item.loading) return;
    item.onClick?.();
    onAction?.(item);
    if (!item.keepOpen) setOpen(false);
  };

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-label={buttonLabel}
        aria-expanded={open}
        className="
          inline-flex h-7 w-7 items-center justify-center
          rounded-md border border-slate-200/70
          bg-white text-slate-500
          transition-colors
          hover:bg-slate-50 hover:text-slate-700
          focus:outline-none focus:ring-2 focus:ring-slate-200
        "
      >
        <MoreHorizontal size={16} />
      </button>

      {open && pos && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Menu */}
          <div
            className="
              fixed z-50
              min-w-[11rem] max-w-[14rem]
              max-h-[calc(100vh-2rem)]
              overflow-y-auto overflow-x-hidden
              rounded-md
              border border-slate-200/80
              bg-white
              py-1
              shadow-lg
            "
            style={{
              top: pos.top,
              left: pos.left,
            }}
          >
            {items.map((item) => {
              const Icon = item.loading ? Loader2 : item.icon;
              const isDanger = item.danger || item.variant === "danger";

              return (
                <div key={item.label}>
                  {item.separator && (
                    <div className="my-1 h-px bg-slate-100" />
                  )}
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`
                        flex w-full items-center gap-2
                        px-3 py-1.5
                        text-left text-[12px] no-underline
                        transition-colors
                        ${
                          isDanger
                            ? "text-red-600 hover:bg-red-100 hover:underline"
                            : "text-slate-700 hover:bg-slate-200 hover:underline"
                        }
                      `}
                    >
                      <Icon
                        size={16}
                        className={
                          isDanger
                            ? "shrink-0 text-red-500"
                            : "shrink-0 text-slate-500"
                        }
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={item.disabled || item.loading}
                      onClick={() => handleItemClick(item)}
                      className={`
                        flex w-full items-center gap-2
                        px-3 py-1.5
                        text-left text-[12px]
                        transition-colors
                        disabled:opacity-60 disabled:cursor-not-allowed
                        ${
                          isDanger
                            ? "text-red-600 hover:bg-red-100 hover:underline"
                            : "text-slate-700 hover:bg-slate-200 hover:underline"
                        }
                      `}
                    >
                      <Icon
                        size={16}
                        className={`shrink-0 ${
                          isDanger ? "text-red-500" : "text-slate-500"
                        } ${item.loading ? "animate-spin" : ""}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}