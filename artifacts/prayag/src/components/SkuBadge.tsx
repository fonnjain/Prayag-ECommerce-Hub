import { useState, type CSSProperties } from "react";

interface SkuBadgeProps {
  sku: string;
  className?: string;
  style?: CSSProperties;
  "data-testid"?: string;
}

export default function SkuBadge({ sku, className = "", style, "data-testid": testId }: SkuBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className={`inline-flex w-fit whitespace-nowrap items-center rounded-full border px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] shadow-sm transition-all duration-300 ${isHovered
        ? "-translate-y-0.5 border-[#9a6a2e] bg-[#9a6a2e] text-white shadow-[0_8px_18px_rgba(154,106,46,0.25)]"
        : "border-[#c99b58]/35 bg-[#fbf1e3] text-[#9a6a2e]"
      } ${className}`}
      style={style}
      data-testid={testId}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      SKU: {sku}
    </span>
  );
}