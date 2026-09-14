"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-800 group-[.toaster]:shadow-xl font-sans",
          description: "group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-sky-500 group-[.toast]:text-slate-950 font-medium",
          cancelButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
