import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Brain, Eye, EyeOff, Loader2, ArrowRight, Github } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import clsx from 'clsx'

type Mode = 'login' | 'register' | 'forgot'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/feed')
      } else if (mode === 'register') {
        if (username.length < 3) throw new Error('Le nom d\'utilisateur doit contenir au moins 3 caractères')
        if (!/^[a-z0-9_]+$/.test(username)) throw new Error('Nom d\'utilisateur: lettres minuscules, chiffres et _ uniquement')

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username, display_name: username }
          }
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
      <Head>
        <title>Neurom — Connexion</title>
      </Head>
      <div className="min-h-screen bg-bg-primary flex bg-grid">
        {/* Panel gauche — branding */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center items-start px-16 relative overflow-hidden">
          {/* Glow background */}
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-accent-blue/5 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center glow-brand">
                <Brain size={22} className="text-bg-primary" strokeWidth={2.5} />
              </div>
              <span className="font-display text-2xl font-800 tracking-tight text-text-primary">Neurom</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl font-800 text-text-primary leading-tight mb-6">
              La communauté<br />
              <span className="text-gradient">de l'IA en français</span>
            </h1>

            <p className="text-text-secondary text-lg leading-relaxed mb-10 max-w-md">
              Rejoins des milliers de passionnés, chercheurs et développeurs pour partager, débattre et façonner l'avenir de l'intelligence artificielle.
            </p>

            {/* Stats */}
            <div className="flex gap-8">
              {[
                { value: '10k+', label: 'Membres' },
                { value: '50k+', label: 'Publications' },
                { value: '500+', label: 'Discussions /jour' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-2xl font-700 text-brand">{value}</p>
                  <p className="text-text-muted text-sm mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel droit — formulaire */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            {/* Logo mobile */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center glow-brand-sm">
                <Brain size={18} className="text-bg-primary" strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl font-700 text-text-primary">Neurom</span>
            </div>

            {/* Card */}
            <div className="bg-bg-card border border-border rounded-2xl p-8">
              {/* Titre */}
              <h2 className="font-display text-2xl font-700 text-text-primary mb-1">
                {mode === 'login' ? 'Content de te revoir' : mode === 'register' ? 'Rejoindre Neurom' : 'Mot de passe oublié'}
              </h2>
              <p className="text-text-muted text-sm mb-6">
                {mode === 'login' ? 'Connecte-toi pour continuer' : mode === 'register' ? 'Crée ton compte gratuitement' : 'On t\'envoie un lien de réinitialisation'}
              </p>

              {/* Github OAuth */}
              {mode !== 'forgot' && (
                <>
                  <button
                    onClick={handleGithub}
                    className="w-full flex items-center justify-center gap-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-text-primary text-sm font-500 hover:bg-bg-hover hover:border-border-bright transition-all mb-4"
                  >
                    <Github size={18} />
                    Continuer avec GitHub
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-text-muted text-xs">ou par email</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                </>
              )}

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="text-text-secondary text-xs font-500 block mb-1.5">Nom d'utilisateur</label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase())}
                      placeholder="ton_pseudo"
                      required
                      className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm placeholder-text-muted outline-none focus:border-brand/50 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="text-text-secondary text-xs font-500 block mb-1.5">Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="toi@exemple.com"
                    required
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm placeholder-text-muted outline-none focus:border-brand/50 transition-colors"
                  />
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <label className="text-text-secondary text-xs font-500 block mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 pr-10 text-text-primary text-sm placeholder-text-muted outline-none focus:border-brand/50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-brand text-xs mt-1.5 hover:underline"
                      >
                        Mot de passe oublié ?
                      </button>
                    )}
                  </div>
                )}

                {/* Messages */}
                {error && (
                  <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl px-4 py-2.5 text-accent-red text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-brand/10 border border-brand/30 rounded-xl px-4 py-2.5 text-brand text-sm">
                    {success}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand text-bg-primary rounded-xl font-display font-700 text-sm hover:opacity-90 disabled:opacity-50 transition-all glow-brand-sm"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Se connecter' : mode === 'register' ? 'Créer mon compte' : 'Envoyer le lien'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Switch mode */}
              <p className="text-text-muted text-sm text-center mt-5">
                {mode === 'login' ? (
                  <>Pas encore de compte ?{' '}
                    <button onClick={() => setMode('register')} className="text-brand hover:underline font-500">S'inscrire</button>
                  </>
                ) : (
                  <>Déjà un compte ?{' '}
                    <button onClick={() => setMode('login')} className="text-brand hover:underline font-500">Se connecter</button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
