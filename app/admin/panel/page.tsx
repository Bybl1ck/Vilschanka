import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { CallbackRequestsPanel } from "@/components/admin/CallbackRequestsPanel";
import { isAdmin } from "@/lib/auth";
import { getCallbackRequests } from "@/lib/callback-requests";
import { getHouses } from "@/lib/houses";

export const metadata = { title: "Керування будиночками та заявками" };
export const dynamic = "force-dynamic";

export default async function AdminPanelPage() {
  if (!(await isAdmin())) redirect("/admin");
  const [houses, callbackRequests] = await Promise.all([getHouses(), getCallbackRequests()]);
  return (
    <>
      <CallbackRequestsPanel initialRequests={callbackRequests} />
      <AdminDashboard initialHouses={houses} />
    </>
  );
}
