import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  ArrowLeft, MapPin, Link as LinkIcon, Calendar,
  UserPlus, Check, Edit2, Loader2
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import PostCard, { Post } from '@/components/feed/PostCard'
import RightPanel from '@/components/ui/RightPanel'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import clsx from 'clsx'
import Link from 'next/link'

type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  website: string | null
  expertise_level: string
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
}

const EXPERTISE_LABELS: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
  expert: 'Expert',
  chercheur: 'Chercheur',
}

const EXPERTISE_COLORS: Record<string, string> = {
  debutant: 'text-text-muted',
  intermediaire: 'text-accent-blue',
  avance: 'text-accent-purple',
  expert: 'text-brand',
  chercheur: 'text-accent-yellow',
}

export default function ProfilePage() {
  const router = useRouter()
  const { username } = router.query
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'posts' | 'likes' | 'media'>('posts')

  const isOwnProfile = user && profile && user.id === profile.id

  useEffect(() => {
    if (username) fetchProfile()
  }, [username])

  useEffect(() => {
    if (profile) {
      fetchPosts()
      if (user && !isOwnProfile) checkFollowing()
    }
  }, [profile, tab])

  const fetchProfile = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
    if (data) setProfile(data)
    setLoading(false)
  }

  const fetchPosts = async () => {
    if (!profile) return
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url, expertise_level)
      `)
      .eq('author_id', profile.id)
      .order('created_at', { ascending: false })

    if (data) setPosts(data)
  }

  const checkFollowing = async () => {
    if (!user || !profile) return
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .match({ follower_id: user.id, following_id: profile.id })
      .single()
    setIsFollowing(!!data)
  }

  const handleFollow = async () => {
    if (!user || !profile) return
    if (isFollowing) {
      await supabase.from('follows').delete().match({ follower_id: user.id, following_id: profile.id })
      setIsFollowing(false)
      setProfile(p => p ? { ...p, followers_count: p.followers_count - 1 } : p)
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id })
      setIsFollowing(true)
      setProfile(p => p ? { ...p, followers_count: p.followers_count + 1 } : p)
    }
  }

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="text-brand animate-spin" />
      </div>
    </AppLayout>
  )

  if (!profile) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <span className="text-4xl mb-4">👤</span>
        <h2 className="font-display font-700 text-text-primary mb-2">Profil introuvable</h2>
        <p className="text-text-muted">Ce compte n'existe pas ou a été supprimé.</p>
      </div>
    </AppLayout>
  )

  return (
    <>
      <Head>
        <title>{profile.display_name || profile.username} (@{profile.username}) — Neurom</title>
      </Head>
      <AppLayout rightPanel={<RightPanel />}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-4 px-4 py-3">
            <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-display font-700 text-text-primary text-sm">{profile.display_name || profile.username}</h1>
              <p className="text-text-muted text-xs">{profile.posts_count} publications</p>
            </div>
          </div>
        </div>

        {/* Bannière */}
        <div className="h-32 bg-gradient-to-br from-brand/20 via-accent-blue/10 to-bg-tertiary relative overflow-hidden">
          {profile.banner_url && (
            <img src={profile.banner_url} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        {/* Profil info */}
        <div className="px-4 pb-4 border-b border-border">
          <div className="flex items-end justify-between -mt-8 mb-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-bg-tertiary border-4 border-bg-primary overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand/10">
                  <span className="text-brand text-2xl font-display font-700">
                    {(profile.display_name || profile.username)[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-8">
              {isOwnProfile ? (
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-full text-sm font-display font-600 text-text-primary hover:bg-bg-hover transition-all"
                >
                  <Edit2 size={14} />
                  Modifier
                </Link>
              ) : user ? (
                <button
                  onClick={handleFollow}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-display font-700 transition-all',
                    isFollowing
                      ? 'border border-border text-text-primary hover:border-accent-red hover:text-accent-red'
                      : 'bg-brand text-bg-primary hover:opacity-90 glow-brand-sm'
                  )}
                >
                  {isFollowing ? <><Check size={14} /> Suivi</> : <><UserPlus size={14} /> Suivre</>}
                </button>
              ) : null}
            </div>
          </div>

          {/* Nom & username */}
          <div className="mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-xl font-700 text-text-primary">{profile.display_name || profile.username}</h2>
              <span className={clsx('text-sm font-500', EXPERTISE_COLORS[profile.expertise_level] || '')}>
                {EXPERTISE_LABELS[profile.expertise_level]}
              </span>
            </div>
            <p className="text-text-muted text-sm">@{profile.username}</p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-text-primary text-sm leading-relaxed mb-3">{profile.bio}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-text-muted text-sm mb-4">
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-brand hover:underline">
                <LinkIcon size={14} />
                {profile.website.replace(/https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              Membre depuis {format(new Date(profile.created_at), 'MMMM yyyy', { locale: fr })}
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <button className="hover:underline">
              <span className="font-display font-700 text-text-primary">{profile.following_count}</span>
              <span className="text-text-muted text-sm ml-1">abonnements</span>
            </button>
            <button className="hover:underline">
              <span className="font-display font-700 text-text-primary">{profile.followers_count}</span>
              <span className="text-text-muted text-sm ml-1">abonnés</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border sticky top-[53px] z-20 bg-bg-primary">
          {[
            { id: 'posts', label: 'Publications' },
            { id: 'likes', label: 'J\'aime' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={clsx(
                'flex-1 py-3 text-sm font-500 border-b-2 transition-all',
                tab === t.id
                  ? 'border-brand text-brand font-display font-700'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <span className="text-4xl mb-4">📝</span>
            <p className="text-text-muted">Aucune publication pour l'instant</p>
          </div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </AppLayout>
    </>
  )
}
