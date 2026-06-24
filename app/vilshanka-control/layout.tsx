import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function VilshankaControlLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#EEF1F5] text-[#17243A]">
      <AdminHeader />
      <main>{children}</main>
    </div>
  );
}
