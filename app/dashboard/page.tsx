// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const roleMap: Record<string, string> = {
    STAFF:     "/dashboard/staff",
    AGENDARIS: "/dashboard/agendaris",
    DIREKTUR:  "/dashboard/direktur",
    ADMIN:     "/dashboard/admin",
  };

  redirect(roleMap[session.user.role] ?? "/login");
}
