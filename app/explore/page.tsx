import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getPostsByCategory } from "@/lib/queries";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/types";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { Feed } from "@/components/Feed";

export const dynamic = "force-dynamic";

const VALID: PostCategory[] = ["actu", "decouverte", "outil", "bon_plan", "general"];

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const category: PostCategory = VALID.includes(cat as PostCategory)
    ? (cat as PostCategory)
    : "actu";

  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  const posts = await getPostsByCategory(supabase, category, profile?.id ?? null);

  return (
    <AppShell profile={profile}>
      <PageHeader title="Explorer" subtitle="L'IA, par thème" />
      <Suspense>
        <CategoryTabs />
      </Suspense>
      <Feed
        posts={posts}
        currentUserId={profile?.id ?? null}
        emptyTitle={`Aucun post « ${CATEGORY_LABELS[category]} »`}
        emptyDescription="Cette rubrique est encore vide. Lancez la conversation en publiant le premier post."
      />
    </AppShell>
  );
}
