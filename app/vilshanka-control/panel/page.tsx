import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { CallbackRequestsPanel } from "@/components/admin/CallbackRequestsPanel";
import { ADMIN_LOGIN_PATH, isAdminAuthenticated } from "@/lib/auth";
import { getCallbackRequests } from "@/lib/callback-requests";
import { getHouses } from "@/lib/houses";

export const metadata = { title: "Керування будиночками та заявками" };
export const dynamic = "force-dynamic";

export default async function AdminPanelPage() {
  if (!(await isAdminAuthenticated())) redirect(ADMIN_LOGIN_PATH);
  const [houses, callbackRequests] = await Promise.all([
    // Якщо таблицю houses ще не створено, панель лишається доступною для заявок.
    // Усі mutation API будиночків однаково записують виключно в Supabase.
    getHouses(),
    getCallbackRequests(),
  ]);
  return (
    <>
      <CallbackRequestsPanel initialRequests={callbackRequests} />
      <AdminDashboard initialHouses={houses} />
    </>
  );
}
