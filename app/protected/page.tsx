import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PhysioDashboard from "@/components/dashboard/physio-dashboard";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const claims = data.claims as { email?: string; name?: string };

  return (
    <PhysioDashboard
      userEmail={claims.email || "physiodynamics10@gmail.com"}
      fullName="Clinic Admin"
      showLogout={true}
    />
  );
}
