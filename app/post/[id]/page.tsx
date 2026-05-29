import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getPost, getComments } from "@/lib/queries";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";
import { CommentSection } from "@/components/CommentSection";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  const post = await getPost(supabase, id, profile?.id ?? null);
  if (!post) notFound();

  const comments = await getComments(supabase, id);

  return (
    <AppShell profile={profile} hideRightPanel>
      <PageHeader title="Post" back />
      <PostCard post={post} currentUserId={profile?.id ?? null} clickable={false} />
      <CommentSection postId={id} initialComments={comments} profile={profile} />
    </AppShell>
  );
}
