import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Home, Compass, Bell, Bookmark, User, Settings,
  LogOut, Brain, Search, PenSquare, Zap
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

const NAV_ITEMS = [
  { icon: Home, label: 'Accueil', href: '/feed' },
  { icon: Compass, label: 'Explorer', href: '/explore' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: Bookmark, label: 'Enregistrés', href: '/bookmarks' },
  { icon: User, label: 'Profil', href: '/profile' },
  { icon: Settings, label: 'Paramètres', href: '/settings' },
]

type Props = {
  children: ReactNode
  rightPanel?: ReactNode
}

export default function AppLayout({ children, rightPanel }: Props) {
  const router = useRouter()
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar gauche */}
      <aside className="w-64 fixed left-0 top-0 h-full border-r border-border flex flex-col z-40 bg-bg-primary">
        {/* Logo */}
        <div className="p-6 mb-2">
          <Link href="/feed" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center glow-brand-sm">
              <Brain size={18} className="text-bg-primary" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-700 tracking-tight text-text-primary">
              Neurom
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const isActive = router.pathname === href || (href === '/profile' && router.pathname.startsWith('/profile'))
            return (
              <Link
                key={href}
                href={href === '/profile' ? `/profile/${profile?.username || ''}` : href}
                className={clsx(
                  'flex items-center gap-3.5 px-3 py-3 rounded-xl mb-1 transition-all duration-150 group',
                  isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={clsx(isActive ? 'text-brand' : 'text-text-secondary group-hover:text-text-primary')}
                />
                <span className={clsx('font-display font-500 text-sm', isActive ? 'text-brand' : '')}>
                  {label}
                </span>
                {href === '/notifications' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-brand pulse-dot" />
                )}
              </Link>
            )
          })}

          {/* Bouton poster */}
          <button
            onClick={() => document.dispatchEvent(new CustomEvent('open-compose'))}
            className="w-full mt-4 px-4 py-3 bg-brand text-bg-primary rounded-xl font-display font-700 text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all glow-brand-sm"
          >
            <PenSquare size={16} strokeWidth={2.5} />
            Publier
          </button>
        </nav>

        {/* Profil utilisateur */}
        {profile && (
          <div className="p-3 border-t border-border">
            <Link href={`/profile/${profile.username}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-hover transition-all group">
              <div className="w-8 h-8 rounded-full bg-bg-tertiary border border-border overflow-hidden flex-shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-brand text-xs font-display font-700">
                      {(profile.display_name || profile.username)[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm font-500 truncate">{profile.display_name || profile.username}</p>
                <p className="text-text-muted text-xs truncate">@{profile.username}</p>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); signOut() }}
                className="text-text-muted hover:text-accent-red transition-colors opacity-0 group-hover:opacity-100"
                title="Déconnexion"
              >
                <LogOut size={15} />
              </button>
            </Link>
          </div>
        )}
      </aside>

      {/* Contenu principal */}
      <main className="ml-64 flex-1 flex">
        <div className="flex-1 max-w-2xl border-r border-border min-h-screen">
          {children}
        </div>

        {/* Panel droit */}
        {rightPanel && (
          <div className="w-80 hidden xl:block">
            <div className="sticky top-0 p-4">
              {rightPanel}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
