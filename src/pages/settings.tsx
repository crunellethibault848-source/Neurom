import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  ArrowLeft, User, Shield, Bell, Palette,
  Save, Loader2, LogOut, Trash2, CheckCircle2
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

const EXPERTISE_OPTIONS = [
  { value: 'debutant', label: 'Débutant', desc: 'Je découvre l\'IA' },
  { value: 'intermediaire', label: 'Intermédiaire', desc: 'J\'utilise des outils IA régulièrement' },
  { value: 'avance', label: 'Avancé', desc: 'Je développe avec des APIs IA' },
  { value: 'expert', label: 'Expert', desc: 'Je travaille professionnellement dans l\'IA' },
  { value: 'chercheur', label: 'Chercheur', desc: 'Je fais de la recherche en IA' },
]

type Section = 'profil' | 'compte' | 'notifications' | 'apparence'

export default function SettingsPage() {
  const { user, profile, refreshProfile, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const [section, setSection] = useState<Section>('profil')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Profil form state
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [expertiseLevel, setExpertiseLevel] = useState('debutant')

  useEffect(() => {
    if (!authLoading && !user) router.push('/')
  }, [user, authLoading])

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setUsername(profile.username || '')
      setBio(profile.bio || '')
      setWebsite(profile.website || '')
      setExpertiseLevel(profile.expertise_level || 'debutant')
    }
  }, [profile])

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        username: username.toLowerCase(),
        bio,
        website,
        expertise_level: expertiseLevel,
      })
      .eq('id', user.id)

    if (!error) {
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const SECTIONS = [
    { id: 'profil', label: 'Profil', icon: User },
    { id: 'compte', label: 'Compte', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'apparence', label: 'Apparence', icon: Palette },
  ]

  if (authLoading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Loader2 size={24} className="text-brand animate-spin" />
    </div>
  )

  return (
    <>
      <Head>
        <title>Paramètres — Neurom</title>
      </Head>
      <AppLayout>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-4 px-4 py-4">
            <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-display font-700 text-text-primary">Paramètres</h1>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar sections */}
          <div className="w-48 border-r border-border min-h-screen pt-2">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id as Section)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm transition-all',
                  section === id
                    ? 'text-brand border-r-2 border-brand bg-brand/5'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}

            <div className="mt-4 pt-4 border-t border-border px-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-accent-red hover:bg-accent-red/10 rounded-lg transition-all"
              >
                <LogOut size={15} />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Contenu section */}
          <div className="flex-1 p-6">
            {section === 'profil' && (
              <div className="max-w-lg space-y-5">
                <h2 className="font-display font-700 text-text-primary text-lg mb-6">Modifier le profil</h2>

                {/* Avatar preview */}
                {profile && (
                  <div className="flex items-center gap-4 mb-6 p-4 bg-bg-card border border-border rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-bg-tertiary border border-border overflow-hidden">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand/10">
                          <span className="text-brand text-xl font-display font-700">
                            {(profile.display_name || profile.username)[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-text-primary text-sm font-500">{profile.display_name || profile.username}</p>
                      <p className="text-text-muted text-xs">@{profile.username}</p>
                    </div>
                  </div>
                )}

                {/* Nom affiché */}
                <div>
                  <label className="text-text-secondary text-xs font-500 block mb-1.5">Nom affiché</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    maxLength={50}
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm placeholder-text-muted outline-none focus:border-brand/40 transition-colors"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="text-text-secondary text-xs font-500 block mb-1.5">Nom d'utilisateur</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase())}
                      maxLength={30}
                      className="w-full bg-bg-tertiary border border-border rounded-xl pl-7 pr-4 py-2.5 text-text-primary text-sm outline-none focus:border-brand/40 transition-colors"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-text-secondary text-xs font-500 block mb-1.5">Bio</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    maxLength={200}
                    rows={3}
                    placeholder="Parle-nous de toi..."
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm placeholder-text-muted outline-none focus:border-brand/40 transition-colors"
                  />
                  <p className="text-text-muted text-xs mt-1 text-right">{bio.length}/200</p>
                </div>

                {/* Site web */}
                <div>
                  <label className="text-text-secondary text-xs font-500 block mb-1.5">Site web</label>
                  <input
                    type="url"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm placeholder-text-muted outline-none focus:border-brand/40 transition-colors"
                  />
                </div>

                {/* Niveau d'expertise */}
                <div>
                  <label className="text-text-secondary text-xs font-500 block mb-2">Niveau d'expertise</label>
                  <div className="space-y-2">
                    {EXPERTISE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setExpertiseLevel(opt.value)}
                        className={clsx(
                          'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                          expertiseLevel === opt.value
                            ? 'border-brand/50 bg-brand/5'
                            : 'border-border hover:border-border-bright hover:bg-bg-hover'
                        )}
                      >
                        <div className={clsx(
                          'w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all',
                          expertiseLevel === opt.value ? 'border-brand bg-brand' : 'border-border'
                        )} />
                        <div>
                          <p className="text-text-primary text-sm font-500">{opt.label}</p>
                          <p className="text-text-muted text-xs">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save button */}
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand text-bg-primary rounded-xl font-display font-700 text-sm hover:opacity-90 disabled:opacity-50 transition-all glow-brand-sm"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : saved ? (
                    <><CheckCircle2 size={16} /> Sauvegardé !</>
                  ) : (
                    <><Save size={16} /> Sauvegarder</>
                  )}
                </button>
              </div>
            )}

            {section === 'compte' && (
              <div className="max-w-lg space-y-4">
                <h2 className="font-display font-700 text-text-primary text-lg mb-6">Compte</h2>

                <div className="p-4 bg-bg-card border border-border rounded-xl">
                  <p className="text-text-secondary text-xs font-500 mb-1">Email connecté</p>
                  <p className="text-text-primary text-sm">{user?.email}</p>
                </div>

                <div className="p-4 bg-accent-red/5 border border-accent-red/20 rounded-xl">
                  <h3 className="font-display font-700 text-accent-red text-sm mb-2">Zone de danger</h3>
                  <p className="text-text-muted text-xs mb-3">Ces actions sont irréversibles.</p>
                  <button className="flex items-center gap-2 px-4 py-2 border border-accent-red/40 text-accent-red rounded-lg text-sm hover:bg-accent-red/10 transition-all">
                    <Trash2 size={14} />
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            )}

            {section === 'notifications' && (
              <div className="max-w-lg">
                <h2 className="font-display font-700 text-text-primary text-lg mb-6">Notifications</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Nouveaux abonnés', desc: 'Quand quelqu\'un te suit' },
                    { label: 'Likes sur tes posts', desc: 'Quand quelqu\'un aime ta publication' },
                    { label: 'Commentaires', desc: 'Quand quelqu\'un commente ta publication' },
                    { label: 'Mentions', desc: 'Quand quelqu\'un te mentionne' },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex items-center justify-between p-4 bg-bg-card border border-border rounded-xl">
                      <div>
                        <p className="text-text-primary text-sm font-500">{label}</p>
                        <p className="text-text-muted text-xs">{desc}</p>
                      </div>
                      <button className="w-11 h-6 bg-brand rounded-full relative transition-all">
                        <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-bg-primary rounded-full transition-all" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === 'apparence' && (
              <div className="max-w-lg">
                <h2 className="font-display font-700 text-text-primary text-lg mb-6">Apparence</h2>
                <div className="p-4 bg-bg-card border border-border rounded-xl">
                  <p className="text-text-secondary text-sm font-500 mb-3">Thème</p>
                  <div className="flex gap-3">
                    <button className="flex-1 p-3 bg-bg-primary border-2 border-brand rounded-xl text-center">
                      <div className="w-full h-10 bg-bg-secondary rounded-lg mb-2" />
                      <span className="text-text-primary text-xs font-display font-700">Sombre</span>
                    </button>
                    <button className="flex-1 p-3 bg-bg-card border border-border rounded-xl text-center opacity-40 cursor-not-allowed">
                      <div className="w-full h-10 bg-gray-200 rounded-lg mb-2" />
                      <span className="text-text-muted text-xs">Clair (bientôt)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  )
}
