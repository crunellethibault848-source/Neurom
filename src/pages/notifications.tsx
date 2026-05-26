import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Heart, MessageCircle, UserPlus, Repeat2, AtSign, Loader2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import RightPanel from '@/components/ui/RightPanel'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import clsx from 'clsx'

type Notification = {
  id: string
  type: string
  read: boolean
  created_at: string
  actor: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  post_id: string | null
}

const NOTIF_CONFIG: Record<string, { icon: any; color: string; label: (actor: string) => string }> = {
  like: { icon: Heart, color: 'text-accent-red', label: (a) => `${a} a aimé ta publication` },
  comment: { icon: MessageCircle, color: 'text-accent-blue', label: (a) => `${a} a commenté ta publication` },
  follow: { icon: UserPlus, color: 'text-brand', label: (a) => `${a} te suit maintenant` },
  repost: { icon: Repeat2, color: 'text-accent-purple', label: (a) => `${a} a republié ta publication` },
  mention: { icon: AtSign, color: 'text-accent-yellow', label: (a) => `${a} t'a mentionné` },
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/')
  }, [user, authLoading])

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey(username, display_name, avatar_url)
      `)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      setNotifications(data)
      // Marquer toutes comme lues
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user!.id)
        .eq('read', false)
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
        <title>Notifications — Neurom</title>
      </Head>
      <AppLayout rightPanel={<RightPanel />}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-border px-4 py-4">
          <h1 className="font-display font-700 text-text-primary">Notifications</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="text-brand animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-4">
              <span className="text-3xl">🔔</span>
            </div>
            <h3 className="font-display font-700 text-text-primary mb-2">Tout est calme ici</h3>
            <p className="text-text-muted text-sm">Tes notifications apparaîtront ici</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map(notif => {
              const config = NOTIF_CONFIG[notif.type]
              if (!config) return null
              const Icon = config.icon
              const actorName = notif.actor?.display_name || notif.actor?.username || 'Quelqu\'un'

              return (
                <div
                  key={notif.id}
                  className={clsx(
                    'flex items-start gap-4 px-4 py-4 card-hover transition-all',
                    !notif.read && 'bg-brand/5'
                  )}
                >
                  {/* Icône type */}
                  <div className={clsx('mt-1 flex-shrink-0', config.color)}>
                    <Icon size={18} strokeWidth={2} />
                  </div>

                  {/* Avatar acteur */}
                  <Link href={`/profile/${notif.actor?.username}`} className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-bg-tertiary border border-border overflow-hidden">
                      {notif.actor?.avatar_url ? (
                        <img src={notif.actor.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand/10">
                          <span className="text-brand text-sm font-display font-700">
                            {actorName[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Contenu */}
                  <div className="flex-1">
                    <p className="text-text-primary text-sm">
                      <Link href={`/profile/${notif.actor?.username}`} className="font-display font-600 hover:underline">
                        {actorName}
                      </Link>
                      {' '}{config.label('').replace(actorName, '').trim()}
                    </p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </div>

                  {/* Indicateur non lu */}
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-2 pulse-dot" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </AppLayout>
    </>
  )
}
