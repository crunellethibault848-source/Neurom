import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Search, Users, Hash, Loader2, UserPlus, Check } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import PostCard, { Post } from '@/components/feed/PostCard'
import RightPanel from '@/components/ui/RightPanel'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  expertise_level: string
  followers_count: number
  following_count: number
  posts_count: number
}

const EXPERTISE_LABELS: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
  expert: 'Expert',
  chercheur: 'Chercheur',
}

const EXPERTISE_COLORS: Record<string, string> = {
  debutant: 'text-text-muted bg-bg-tertiary',
  intermediaire: 'text-accent-blue bg-accent-blue/10',
  avance: 'text-accent-purple bg-accent-purple/10',
  expert: 'text-brand bg-brand/10',
  chercheur: 'text-accent-yellow bg-accent-yellow/10',
}

const CATEGORIES = ['Tous', 'Recherche', 'Outils', 'Modèles', 'Carrière', 'Éthique', 'Apprendre']

export default function ExplorePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'personnes' | 'publications'>('personnes')
  const [search, setSearch] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState('Tous')

  useEffect(() => {
    if (!authLoading && !user) router.push('/')
  }, [user, authLoading])

  useEffect(() => {
    if (!user) return
    fetchData()
    fetchFollowing()
  }, [user, search, tab])

  const fetchFollowing = async () => {
    if (!user) return
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
    if (data) setFollowing(new Set(data.map(f => f.following_id)))
  }

  const fetchData = async () => {
    setLoading(true)
    if (tab === 'personnes') {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('followers_count', { ascending: false })
        .limit(20)

      if (search) {
        query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`)
      }

      const { data } = await query
      if (data) setProfiles(data)
    } else {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url, expertise_level)
        `)
        .order('likes_count', { ascending: false })
        .limit(30)

      if (search) {
        query = query.ilike('content', `%${search}%`)
      }

      const { data } = await query
      if (data) setPosts(data)
    }
    setLoading(false)
  }

  const handleFollow = async (profileId: string) => {
    if (!user) return
    const isFollowing = following.has(profileId)
    const newFollowing = new Set(following)

    if (isFollowing) {
      await supabase.from('follows').delete().match({ follower_id: user.id, following_id: profileId })
      newFollowing.delete(profileId)
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profileId })
      newFollowing.add(profileId)
    }
    setFollowing(newFollowing)
  }

  if (authLoading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Loader2 size={24} className="text-brand animate-spin" />
    </div>
  )

  return (
    <>
      <Head>
        <title>Explorer — Neurom</title>
      </Head>
      <AppLayout rightPanel={<RightPanel />}>
        {/* Header sticky */}
        <div className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-border">
          <div className="px-4 pt-4 pb-3">
            <h1 className="font-display font-700 text-text-primary mb-3">Explorer</h1>
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher des personnes, sujets..."
                className="w-full bg-bg-tertiary border border-border rounded-xl pl-9 pr-4 py-2.5 text-text-primary text-sm placeholder-text-muted outline-none focus:border-brand/40 transition-colors"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {[
              { id: 'personnes', label: 'Personnes', icon: Users },
              { id: 'publications', label: 'Publications', icon: Hash },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id as any)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-500 border-b-2 transition-all',
                  tab === id
                    ? 'border-brand text-brand font-display font-700'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="text-brand animate-spin" />
          </div>
        ) : tab === 'personnes' ? (
          <div className="divide-y divide-border">
            {profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <span className="text-4xl mb-4">🔍</span>
                <p className="text-text-muted">Aucun profil trouvé</p>
              </div>
            ) : profiles.map(p => (
              <div key={p.id} className="flex items-start gap-4 px-4 py-4 card-hover">
                <Link href={`/profile/${p.username}`} className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-bg-tertiary border border-border overflow-hidden">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand/10">
                        <span className="text-brand font-display font-700">
                          {(p.display_name || p.username)[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/profile/${p.username}`}>
                        <span className="font-display font-600 text-text-primary hover:underline">{p.display_name || p.username}</span>
                      </Link>
                      <span className="text-text-muted text-sm ml-2">@{p.username}</span>
                      <span className={clsx('ml-2 text-xs px-2 py-0.5 rounded-full font-500', EXPERTISE_COLORS[p.expertise_level] || '')}>
                        {EXPERTISE_LABELS[p.expertise_level]}
                      </span>
                    </div>
                    {user && user.id !== p.id && (
                      <button
                        onClick={() => handleFollow(p.id)}
                        className={clsx(
                          'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-700 transition-all',
                          following.has(p.id)
                            ? 'border border-border text-text-secondary hover:border-accent-red hover:text-accent-red'
                            : 'bg-brand text-bg-primary hover:opacity-90'
                        )}
                      >
                        {following.has(p.id) ? (
                          <><Check size={12} /> Suivi</>
                        ) : (
                          <><UserPlus size={12} /> Suivre</>
                        )}
                      </button>
                    )}
                  </div>
                  {p.bio && <p className="text-text-secondary text-sm mt-1 line-clamp-2">{p.bio}</p>}
                  <div className="flex gap-4 mt-2">
                    <span className="text-text-muted text-xs"><span className="text-text-secondary font-500">{p.followers_count}</span> abonnés</span>
                    <span className="text-text-muted text-xs"><span className="text-text-secondary font-500">{p.posts_count}</span> posts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <span className="text-4xl mb-4">📭</span>
                <p className="text-text-muted">Aucune publication trouvée</p>
              </div>
            ) : posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </AppLayout>
    </>
  )
}
