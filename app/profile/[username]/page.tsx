import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import {
  getProfile,
  getPostsByUser,
  getProfileStats,
} from "@/lib/queries";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { Feed } from "@/components/Feed";
import { FollowButton } from "@/components/FollowButton";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const me = await getCurrentProfile(supabase);

  const profile = await getProfile(supabase, username);
  if (!profile) notFound();

  const [posts, stats] = await Promise.all([
    getPostsByUser(supabase, profile.id, me?.id ?? null),
    getProfileStats(supabase, profile.id),
  ]);

  // Est-ce que je suis cet utilisateur ?
  let following = false;
  if (me && me.id !== profile.id) {
    const { data } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", me.id)
      .eq("following_id", profile.id)
      .maybeSingle();
    following = !!data;
  }

  const name = profile.display_name ?? profile.username;
  const isMe = me?.id === profile.id;

  return (
    <AppShell profile={me}>
      <PageHeader title={name} subtitle={`${stats.posts} post${stats.posts > 1 ? "s" : ""}`} back />

      {/* Bandeau noir géométrique en guise de couverture */}
      <div className="relative h-36 bg-ink">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(var(--canvas)_1px,transparent_1px),linear-gradient(90deg,var(--canvas)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-end justify-between">
          <div className="-mt-12">
            <span className="inline-block rounded-full ring-4 ring-canvas">
              <Avatar src={profile.avatar_url} name={name} size={88} />
            </span>
          </div>
          <div className="pt-3">
            {isMe ? (
              <Link
                href="/settings"
                className="inline-flex h-9 items-center rounded-full border border-line px-5 text-sm font-semibold transition hover:border-ink"
              >
                Modifier le profil
              </Link>
            ) : (
              <FollowButton
                targetUserId={profile.id}
                currentUserId={me?.id ?? null}
                initiallyFollowing={following}
              />
            )}
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-xl font-bold tracking-tight">{name}</h2>
          <p className="text-[15px] text-subtle">@{profile.username}</p>
        </div>

        {profile.bio && (
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-normal">
            {profile.bio}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-subtle">
          {profile.website && (
            <a
              href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline-offset-2 hover:underline"
            >
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          <span>A rejoint Neurom il y a {timeAgo(profile.created_at)}</span>
        </div>

        <div className="mt-3 flex gap-5 text-sm">
          <span>
            <strong className="font-semibold">{stats.following}</strong>{" "}
            <span className="text-subtle">abonnements</span>
          </span>
          <span>
            <strong className="font-semibold">{stats.followers}</strong>{" "}
            <span className="text-subtle">abonnés</span>
          </span>
        </div>
      </div>

      <div className="border-t border-line">
        <Feed
          posts={posts}
          currentUserId={me?.id ?? null}
          emptyTitle={isMe ? "Vous n'avez rien publié" : "Aucun post"}
          emptyDescription={
            isMe
              ? "Partagez votre première découverte IA — elle apparaîtra ici."
              : "Cet utilisateur n'a pas encore publié."
          }
        />
      </div>
    </AppShell>
  );
}
