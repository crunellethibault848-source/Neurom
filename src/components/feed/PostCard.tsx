import { useState } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, Share } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import clsx from 'clsx'

export type Post = {
  id: string
  content: string
  media_urls?: string[]
  category?: string
  tags?: string[]
  likes_count: number
  comments_count: number
  reposts_count: number
  views_count: number
  created_at: string
  author: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    expertise_level: string
  }
  user_liked?: boolean
  user_bookmarked?: boolean
}

const EXPERTISE_COLORS: Record<string, string> = {
  debutant: 'text-text-muted',
  intermediaire: 'text-accent-blue',
  avance: 'text-accent-purple',
  expert: 'text-brand',
  chercheur: 'text-accent-yellow',
}

const EXPERTISE_LABELS: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
  expert: 'Expert',
  chercheur: 'Chercheur',
}

const CATEGORY_COLORS: Record<string, string> = {
  recherche: 'bg-accent-purple/10 text-accent-purple',
  outils: 'bg-accent-blue/10 text-accent-blue',
  modeles: 'bg-brand/10 text-brand',
  carriere: 'bg-accent-yellow/10 text-accent-yellow',
  ethique: 'bg-accent-red/10 text-accent-red',
  apprendre: 'bg-accent-blue/10 text-accent-blue',
}

export default function PostCard({ post, onUpdate }: { post: Post; onUpdate?: () => void }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(post.user_liked ?? false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [bookmarked, setBookmarked] = useState(post.user_bookmarked ?? false)

  const handleLike = async () => {
    if (!user) return
    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1)

    if (newLiked) {
      await supabase.from('likes').insert({ user_id: user.id, post_id: post.id })
    } else {
      await supabase.from('likes').delete().match({ user_id: user.id, post_id: post.id })
    }
  }

  const handleBookmark = async () => {
    if (!user) return
    const newBookmarked = !bookmarked
    setBookmarked(newBookmarked)
    if (newBookmarked) {
      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: post.id })
    } else {
      await supabase.from('bookmarks').delete().match({ user_id: user.id, post_id: post.id })
    }
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })

  return (
    <article className="border-b border-border px-4 py-4 card-hover cursor-pointer">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/profile/${post.author.username}`} className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-bg-tertiary border border-border overflow-hidden">
            {post.author.avatar_url ? (
              <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand/10">
                <span className="text-brand text-sm font-display font-700">
                  {(post.author.display_name || post.author.username)[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link href={`/profile/${post.author.username}`} className="hover:underline">
              <span className="font-display font-600 text-text-primary text-sm">
                {post.author.display_name || post.author.username}
              </span>
            </Link>
            <span className={clsx('text-xs font-500', EXPERTISE_COLORS[post.author.expertise_level] || 'text-text-muted')}>
              {EXPERTISE_LABELS[post.author.expertise_level]}
            </span>
            <span className="text-text-muted text-xs">·</span>
            <span className="text-text-muted text-xs">@{post.author.username}</span>
            <span className="text-text-muted text-xs">·</span>
            <span className="text-text-muted text-xs">{timeAgo}</span>
            {post.category && (
              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-500', CATEGORY_COLORS[post.category] || 'bg-bg-hover text-text-secondary')}>
                {post.category}
              </span>
            )}
          </div>

          {/* Texte */}
          <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap break-words mb-3">
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.map(tag => (
                <span key={tag} className="text-brand text-xs hover:underline cursor-pointer">#{tag}</span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 mt-1">
            <button
              onClick={handleLike}
              className={clsx(
                'flex items-center gap-1.5 text-xs transition-all duration-150 group',
                liked ? 'text-accent-red' : 'text-text-muted hover:text-accent-red'
              )}
            >
              <Heart
                size={16}
                strokeWidth={2}
                className={clsx('transition-all', liked ? 'fill-accent-red' : 'group-hover:scale-110')}
              />
              <span>{likesCount > 0 ? likesCount : ''}</span>
            </button>

            <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-blue transition-all group">
              <MessageCircle size={16} strokeWidth={2} className="group-hover:scale-110 transition-all" />
              <span>{post.comments_count > 0 ? post.comments_count : ''}</span>
            </button>

            <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand transition-all group">
              <Repeat2 size={16} strokeWidth={2} className="group-hover:scale-110 transition-all" />
              <span>{post.reposts_count > 0 ? post.reposts_count : ''}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={clsx(
                'flex items-center gap-1.5 text-xs transition-all duration-150 group ml-auto',
                bookmarked ? 'text-brand' : 'text-text-muted hover:text-brand'
              )}
            >
              <Bookmark
                size={16}
                strokeWidth={2}
                className={clsx('transition-all', bookmarked ? 'fill-brand' : 'group-hover:scale-110')}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
