// hooks/useUpdateParams.ts

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUpdateParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getCurrentParams = () => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams(searchParams.toString());
  };

  const updateParam = (key: string, value: string) => {
    const params = getCurrentParams();

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const updateParams = (values: Record<string, string>) => {
    const params = getCurrentParams();

    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearParams = (keys: string[]) => {
    const params = getCurrentParams();

    keys.forEach((key) => {
      params.delete(key);
    });

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return {
    updateParam,
    updateParams,
    clearParams,
  };
}