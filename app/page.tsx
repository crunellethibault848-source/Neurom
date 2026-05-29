import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getFeed } from "@/lib/queries";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { ComposeBox } from "@/components/ComposeBox";
import { Feed } from "@/components/Feed";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  const posts = await getFeed(supabase, profile?.id ?? null);

  return (
    <AppShell profile={profile}>
      <PageHeader
        title="Pour toi"
        right={
          <span className="font-mono text-[11px] uppercase tracking-widest text-subtle">
            neurom
          </span>
        }
      />

      {/* Zone de publication inline */}
      {profile && (
        <div className="border-b border-line">
          <ComposeBox profile={profile} />
        </div>
      )}

      <Feed posts={posts} currentUserId={profile?.id ?? null} />
    </AppShell>
  );
}
