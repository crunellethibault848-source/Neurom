import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { RefreshCw, Loader2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import ComposePost from '@/components/feed/ComposePost'
import PostCard, { Post } from '@/components/feed/PostCard'
import RightPanel from '@/components/ui/RightPanel'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const TABS = [
  { id: 'pour_toi', label: 'Pour toi' },
  { id: 'abonnements', label: 'Abonnements' },
  { id: 'recherche', label: '🔬 Recherche' },
  { id: 'outils', label: '🛠️ Outils' },
  { id: 'modeles', label: '🤖 Modèles' },
]

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('pour_toi')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/')
  }, [user, authLoading])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url, expertise_level)
      `)
      .order('created_at', { ascending: false })
      .limit(30)

    if (activeTab !== 'pour_toi' && activeTab !== 'abonnements') {
      query = query.eq('category', activeTab)
    }

    const { data } = await query
    if (data) {
      // Si connecté, récupérer les likes de l'utilisateur
      if (user) {
        const postIds = data.map(p => p.id)
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds)

        const { data: bookmarks } = await supabase
          .from('bookmarks')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds)

        const likedSet = new Set(likes?.map(l => l.post_id))
        const bookmarkedSet = new Set(bookmarks?.map(b => b.post_id))

        setPosts(data.map(p => ({
          ...p,
          user_liked: likedSet.has(p.id),
          user_bookmarked: bookmarkedSet.has(p.id),
        })))
      } else {
        setPosts(data)
      }
    }
    setLoading(false)
  }, [activeTab, user])

  useEffect(() => {
    if (user) fetchPosts()
  }, [fetchPosts, user])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPosts()
    setRefreshing(false)
  }

  if (authLoading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Loader2 size={24} className="text-brand animate-spin" />
    </div>
  )

  return (
    <>
      <Head>
        <title>Accueil — Neurom</title>
      </Head>
      <AppLayout rightPanel={<RightPanel />}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="font-display font-700 text-text-primary">Accueil</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-text-muted hover:text-brand transition-colors"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin text-brand' : ''} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-none border-b border-border">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-500 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-brand text-brand font-display font-700'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Composer */}
        <ComposePost onPostCreated={fetchPosts} />

        {/* Posts */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="text-brand animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-4">
              <span className="text-3xl">🧠</span>
            </div>
            <h3 className="font-display font-700 text-text-primary mb-2">Aucune publication</h3>
            <p className="text-text-muted text-sm max-w-xs">
              Sois le premier à partager quelque chose dans cette catégorie !
            </p>
          </div>
        ) : (
          <div>
            {posts.map(post => (
              <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
            ))}
          </div>
        )}
      </AppLayout>
    </>
  )
}
