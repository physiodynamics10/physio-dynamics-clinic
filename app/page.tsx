import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PhysioDashboard from "@/components/dashboard/physio-dashboard";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    const claims = data.claims as { email?: string };
    return (
      <PhysioDashboard
        userEmail={claims.email || "physiodynamics10@gmail.com"}
        fullName="Clinic Admin"
      />
    );
  }

  // If not logged in, redirect to login page
  redirect("/auth/login");
}
