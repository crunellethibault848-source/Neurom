import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Brain, Eye, EyeOff, Loader2, ArrowRight, Github } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'

type Mode = 'login' | 'register' | 'forgot'

export default function AuthPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const inputStyle = {
    width: '100%',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '10px 16px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        await new Promise(r => setTimeout(r, 500))
        window.location.href = '/feed'
      } else if (mode === 'register') {
        if (username.length < 3) throw new Error("Le nom d'utilisateur doit contenir au moins 3 caractères")
        if (!/^[a-z0-9_]+$/.test(username)) throw new Error('Nom d\'utilisateur: lettres minuscules, chiffres et _ uniquement')
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username, display_name: username } }
        })
        if (error) throw error
        setSuccess('Vérifie ta boîte mail pour confirmer ton compte !')
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        setSuccess('Email de réinitialisation envoyé !')
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    }
    setLoading(false)
  }

  const handleGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/feed` }
    })
  }

  return (
    <>
      <Head><title>Neurom — Connexion</title></Head>
      <div className="min-h-screen flex bg-grid" style={{ backgroundColor: 'var(--bg-primary)' }}>

        {/* Panel gauche branding */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center items-start px-16 relative overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'var(--brand-glow)' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-brand" style={{ backgroundColor: 'var(--brand)' }}>
                <Brain size={22} style={{ color: 'var(--bg-primary)' }} strokeWidth={2.5} />
              </div>
              <span className="font-display text-2xl" style={{ fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>Neurom</span>
            </div>

            <h1 className="font-display text-5xl leading-tight mb-6" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              La communauté<br />
              <span className="text-gradient">de l'IA en français</span>
            </h1>

            <p className="text-lg leading-relaxed mb-10 max-w-md" style={{ color: 'var(--text-secondary)' }}>
              Rejoins des milliers de passionnés, chercheurs et développeurs pour partager, débattre et façonner l'avenir de l'intelligence artificielle.
            </p>

            <div className="flex gap-8">
              {[{ value: '10k+', label: 'Membres' }, { value: '50k+', label: 'Publications' }, { value: '500+', label: 'Discussions /jour' }].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-2xl" style={{ fontWeight: 700, color: 'var(--brand)' }}>{value}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel droit formulaire */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 relative">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="absolute top-6 right-6 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            {theme === 'dark' ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          <div className="w-full max-w-md">
            {/* Logo mobile */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-brand-sm" style={{ backgroundColor: 'var(--brand)' }}>
                <Brain size={18} style={{ color: 'var(--bg-primary)' }} strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Neurom</span>
            </div>

            {/* Card */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 className="font-display text-2xl mb-1" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {mode === 'login' ? 'Content de te revoir' : mode === 'register' ? 'Rejoindre Neurom' : 'Mot de passe oublié'}
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                {mode === 'login' ? 'Connecte-toi pour continuer' : mode === 'register' ? 'Crée ton compte gratuitement' : "On t'envoie un lien de réinitialisation"}
              </p>

              {mode !== 'forgot' && (
                <>
                  <button
                    onClick={handleGithub}
                    className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-500 transition-all mb-4"
                    style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    <Github size={18} />
                    Continuer avec GitHub
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>ou par email</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="text-xs font-500 block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nom d'utilisateur</label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase())}
                      placeholder="ton_pseudo"
                      required
                      style={inputStyle}
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-500 block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="toi@exemple.com"
                    required
                    style={inputStyle}
                  />
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <label className="text-xs font-500 block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mot de passe</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        style={{ ...inputStyle, paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {mode === 'login' && (
                      <button type="button" onClick={() => setMode('forgot')} className="text-xs mt-1.5 hover:underline" style={{ color: 'var(--brand)' }}>
                        Mot de passe oublié ?
                      </button>
                    )}
                  </div>
                )}

                {error && (
                  <div className="rounded-xl px-4 py-2.5 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--accent-red)' }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-xl px-4 py-2.5 text-sm" style={{ backgroundColor: 'var(--brand-dim)', border: '1px solid var(--brand)', color: 'var(--brand)' }}>
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display text-sm glow-brand-sm"
                  style={{ backgroundColor: 'var(--brand)', color: 'var(--bg-primary)', fontWeight: 700, opacity: loading ? 0.5 : 1 }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : (
                    <>{mode === 'login' ? 'Se connecter' : mode === 'register' ? 'Créer mon compte' : 'Envoyer le lien'}<ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <p className="text-sm text-center mt-5" style={{ color: 'var(--text-muted)' }}>
                {mode === 'login' ? (
                  <>Pas encore de compte ?{' '}<button onClick={() => setMode('register')} className="font-500 hover:underline" style={{ color: 'var(--brand)' }}>S'inscrire</button></>
                ) : (
                  <>Déjà un compte ?{' '}<button onClick={() => setMode('login')} className="font-500 hover:underline" style={{ color: 'var(--brand)' }}>Se connecter</button></>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
