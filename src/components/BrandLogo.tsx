export function BrandMark({
  size = 26,
  variant = "stamp",
}: {
  size?: number;
  variant?: "mark" | "stamp";
}) {
  if (variant === "stamp") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="32" height="32" fill="#9B1C1C" />
        <g
          transform="translate(16 16) rotate(45) translate(-16 -16)"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="butt"
          strokeLinejoin="miter"
        >
          <path d="M11.5 9.2V7H20.5V18.3" />
          <path d="M20.5 22.8V25H11.5V13.7" />
          <path d="M9.2 20.5H7V11.5H18.3" />
          <path d="M22.8 11.5H25V20.5H13.7" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <g
        transform="translate(16 16) rotate(45) translate(-16 -16)"
        stroke="#9B1C1C"
        strokeWidth="2.4"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      >
        <path d="M11 8.5V6H21V18.5" />
        <path d="M21 23.5V26H11V13.5" />
        <path d="M8.5 21H6V11H18.5" />
        <path d="M23.5 11H26V21H13.5" />
      </g>
    </svg>
  );
}

export function BrandLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const iconSize = size === "sm" ? 22 : 26;
  const textClass = size === "sm" ? "text-base" : "text-lg";

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
      <BrandMark size={iconSize} variant="stamp" />
      <span className={`${textClass} font-semibold tracking-tight text-[#111111]`}>
        S.S Tailors
      </span>
    </span>
  );
}
