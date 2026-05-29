import { PostCard } from "./PostCard";
import { EmptyState } from "./EmptyState";
import type { PostWithAuthor } from "@/lib/types";

interface FeedProps {
  posts: PostWithAuthor[];
  currentUserId: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function Feed({
  posts,
  currentUserId,
  emptyTitle = "Rien à afficher pour l'instant",
  emptyDescription = "Soyez le premier à publier. Vos découvertes, l'actu et les bons plans IA apparaîtront ici.",
}: FeedProps) {
  if (posts.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="stagger flex flex-col">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
