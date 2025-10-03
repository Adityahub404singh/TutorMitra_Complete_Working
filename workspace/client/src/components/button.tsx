
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "google" | "phone";
  children: React.ReactNode;
}

export default function Button({ variant = "primary", children, ...props }: ButtonProps) {
  const baseClasses =
    "font-semibold rounded-md shadow px-6 py-3 focus:outline-none focus:ring-2 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed";

  let variantClasses = "";

  switch (variant) {
    case "primary":
      variantClasses =
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
      break;
    case "secondary":
      variantClasses =
        "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400";
      break;
    case "google":
      variantClasses =
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 flex items-center justify-center space-x-2";
      break;
    case "phone":
      variantClasses =
        "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 flex items-center justify-center space-x-2";
      break;
    default:
      variantClasses = "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
  }

  return (
    <button className={`${baseClasses} ${variantClasses}`} {...props}>
      {children}
    </button>
  );
}
