import Head from 'next/head'
import Link from 'next/link'
import { Brain, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <>
      <Head><title>Page introuvable — Neurom</title></Head>
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 bg-grid">
        <div className="text-center max-w-md">
          <div className="flex items-center gap-2.5 mb-12 justify-center">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center glow-brand-sm">
              <Brain size={18} className="text-bg-primary" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-700 text-text-primary">Neurom</span>
          </div>

          <div className="font-display text-8xl font-800 text-gradient mb-4">404</div>
          <h1 className="font-display text-2xl font-700 text-text-primary mb-3">Page introuvable</h1>
          <p className="text-text-muted mb-8">
            Cette page n'existe pas ou a été déplacée. Même les meilleurs modèles hallucinent parfois.
          </p>

          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-bg-primary rounded-xl font-display font-700 text-sm hover:opacity-90 transition-all glow-brand-sm"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </>
  )
}
