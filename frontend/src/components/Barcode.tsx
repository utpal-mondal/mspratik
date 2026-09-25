"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  format?: string;
  className?: string;
}

export default function Barcode({
  value,
  width = 1,
  height = 50,
  displayValue = true,
  format = "CODE128",
  className,
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, value, {
        format,
        width,
        height,
        displayValue,
        margin: 0,
      });
    }
  }, [value, width, height, displayValue, format]);

  return <svg ref={svgRef} className={className} />;
}

export const getBarcodeSvgString = (
  value: string,
  options?: Partial<Omit<BarcodeProps, "value" | "className">>
): string => {
  if (typeof document === "undefined") return "";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(svg, value, {
    format: options?.format ?? "CODE128",
    width: options?.width ?? 1,
    height: options?.height ?? 50,
    displayValue: options?.displayValue ?? true,
    margin: 0,
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(svg);
};
