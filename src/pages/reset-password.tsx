import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Brain, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 6) { setError('Minimum 6 caractères'); return }

    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/feed'), 2000)
    }
    setLoading(false)
  }

  return (
    <>
      <Head><title>Nouveau mot de passe — Neurom</title></Head>
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 bg-grid">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center glow-brand-sm">
              <Brain size={18} className="text-bg-primary" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-700 text-text-primary">Neurom</span>
          </div>

          <div className="bg-bg-card border border-border rounded-2xl p-8">
            {success ? (
              <div className="text-center">
                <div className="text-4xl mb-4">✅</div>
                <h2 className="font-display text-xl font-700 text-text-primary mb-2">Mot de passe mis à jour</h2>
                <p className="text-text-muted text-sm">Redirection en cours...</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-700 text-text-primary mb-1">Nouveau mot de passe</h2>
                <p className="text-text-muted text-sm mb-6">Choisis un mot de passe sécurisé</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-text-secondary text-xs font-500 block mb-1.5">Nouveau mot de passe</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 pr-10 text-text-primary text-sm outline-none focus:border-brand/50 transition-colors"
                      />
                      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-text-secondary text-xs font-500 block mb-1.5">Confirmer</label>
                    <input
                      type={show ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm outline-none focus:border-brand/50 transition-colors"
                    />
                  </div>
                  {error && <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl px-4 py-2.5 text-accent-red text-sm">{error}</div>}
                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-brand text-bg-primary rounded-xl font-display font-700 text-sm hover:opacity-90 disabled:opacity-50 transition-all">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Mettre à jour</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
