import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "contained" | "text" | "outlined";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function getVariantClass(variant: ButtonVariant) {
  if (variant === "text") {
    return "text-gray-700 hover:text-gray-900 disabled:text-gray-400";
  }

  if (variant === "outlined") {
    return "inline-flex items-center justify-center rounded-full border border-gray-900 bg-transparent text-gray-900 hover:opacity-80 disabled:opacity-50";
  }

  return "inline-flex items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-400";
}

function getSizeClass(variant: ButtonVariant, size: ButtonSize) {
  if (variant === "text") {
    if (size === "sm") return "text-sm";
    if (size === "lg") return "text-lg";
    return "";
  }

  if (size === "sm") return "px-4 py-2 text-sm";
  if (size === "lg") return "px-8 py-4 text-lg";
  return "px-8 py-3";
}

export default function Button({ children, className = "", disabled, isLoading = false, size = "md", type = "button", variant = "contained", ...props }: ButtonProps) {
  const baseClasses =
    "text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed cursor-pointer";
  const variantClasses = getVariantClass(variant);
  const sizeClasses = getSizeClass(variant, size);

  const mergedClassName = [baseClasses, variantClasses, sizeClasses, className].filter(Boolean).join(" ");

  const circularSpinner = (
    <svg className="m-auto size-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <button type={type} className={mergedClassName} disabled={disabled || isLoading} aria-busy={isLoading} {...props}>
      {isLoading ? circularSpinner : children}
    </button>
  );
}
