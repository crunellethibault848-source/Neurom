import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { SettingsForm } from "@/components/SettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Réglages — Neurom" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");

  return (
    <AppShell profile={profile} hideRightPanel>
      <PageHeader title="Réglages" subtitle="Votre profil public" back />
      <SettingsForm profile={profile} />
    </AppShell>
  );
}
