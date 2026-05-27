import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Home, Compass, Bell, Bookmark, User, Settings,
  LogOut, Brain, PenSquare, Sun, Moon
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
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
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 h-full flex flex-col z-40" style={{ backgroundColor: 'var(--bg-primary)', borderRight: '1px solid var(--border)' }}>
        {/* Logo */}
        <div className="p-6 mb-2 flex items-center justify-between">
          <Link href="/feed" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-brand-sm" style={{ backgroundColor: 'var(--brand)' }}>
              <Brain size={18} style={{ color: 'var(--bg-primary)' }} strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl tracking-tight" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              Neurom
            </span>
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'var(--text-muted)', backgroundColor: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const isActive = router.pathname === href || (href === '/profile' && router.pathname.startsWith('/profile'))
            return (
              <Link
                key={href}
                href={href === '/profile' ? `/profile/${profile?.username || ''}` : href}
                className="flex items-center gap-3.5 px-3 py-3 rounded-xl mb-1 transition-all duration-150 group"
                style={{
                  backgroundColor: isActive ? 'var(--brand-dim)' : 'transparent',
                  color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-display text-sm" style={{ fontWeight: isActive ? 700 : 500 }}>
                  {label}
                </span>
                {href === '/notifications' && (
                  <span className="ml-auto w-2 h-2 rounded-full pulse-dot" style={{ backgroundColor: 'var(--brand)' }} />
                )}
              </Link>
            )
          })}

          {/* Publier */}
          <button
            onClick={() => document.dispatchEvent(new CustomEvent('open-compose'))}
            className="w-full mt-4 px-4 py-3 rounded-xl font-display text-sm flex items-center justify-center gap-2 transition-all glow-brand-sm"
            style={{ backgroundColor: 'var(--brand)', color: 'var(--bg-primary)', fontWeight: 700 }}
          >
            <PenSquare size={16} strokeWidth={2.5} />
            Publier
          </button>
        </nav>

        {/* Profil bas */}
        {profile && (
          <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative">
              <Link href={`/profile/${profile.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-tertiary)' }}>
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-dim)' }}>
                      <span className="text-xs font-display font-700" style={{ color: 'var(--brand)' }}>
                        {(profile.display_name || profile.username)[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-500 truncate" style={{ color: 'var(--text-primary)' }}>{profile.display_name || profile.username}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>@{profile.username}</p>
                </div>
              </Link>
              <button
                onClick={signOut}
                className="opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-red)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                title="Déconnexion"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 flex">
        <div className="flex-1 max-w-2xl min-h-screen" style={{ borderRight: '1px solid var(--border)' }}>
          {children}
        </div>
        {rightPanel && (
          <div className="w-80 hidden xl:block">
            <div className="sticky top-0 p-4">{rightPanel}</div>
          </div>
        )}
      </main>
    </div>
  )
}
