import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Loader2, Bookmark } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import PostCard, { Post } from '@/components/feed/PostCard'
import RightPanel from '@/components/ui/RightPanel'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/')
  }, [user, authLoading])

  useEffect(() => {
    if (user) fetchBookmarks()
  }, [user])

  const fetchBookmarks = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('bookmarks')
      .select(`
        post_id,
        post:posts!bookmarks_post_id_fkey(
          *,
          author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url, expertise_level)
        )
      `)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })

    if (data) {
      const postsData = data
        .map((b: any) => b.post)
        .filter(Boolean)
        .map((p: any) => ({ ...p, user_bookmarked: true }))
      setPosts(postsData)
    }
    setLoading(false)
  }

  if (authLoading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Loader2 size={24} className="text-brand animate-spin" />
    </div>
  )

  return (
    <>
      <Head>
        <title>Enregistrés — Neurom</title>
      </Head>
      <AppLayout rightPanel={<RightPanel />}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-border px-4 py-4">
          <h1 className="font-display font-700 text-text-primary">Enregistrés</h1>
          <p className="text-text-muted text-xs mt-0.5">{posts.length} publication{posts.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="text-brand animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-4">
              <Bookmark size={28} className="text-brand" />
            </div>
            <h3 className="font-display font-700 text-text-primary mb-2">Aucun enregistrement</h3>
            <p className="text-text-muted text-sm max-w-xs">
              Enregistre des publications pour les retrouver facilement ici.
            </p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} onUpdate={fetchBookmarks} />
          ))
        )}
      </AppLayout>
    </>
  )
}
