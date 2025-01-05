import { cn } from "../../../lib/utils";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-400",
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-400",
        success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-400",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400",
        outline: "border border-gray-200 hover:bg-gray-100 hover:text-gray-900",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 hover:text-gray-900",
        ghost: "hover:bg-gray-100 hover:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900",
        link: "text-gray-900 underline-offset-4 hover:underline",
        sidebar: "w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 transition-all duration-200 text-gray-700 hover:text-gray-900 font-medium",
        sidebarActive: "w-full text-left px-4 py-2 bg-gray-100 flex items-center gap-2 text-gray-900 font-medium border-r-4 border-gray-900",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
        sidebar: "h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };