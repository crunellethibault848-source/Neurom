import { useState, useRef, useEffect } from 'react'
import { Image, Hash, X, Send, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

const CATEGORIES = [
  { value: 'recherche', label: '🔬 Recherche' },
  { value: 'outils', label: '🛠️ Outils' },
  { value: 'modeles', label: '🤖 Modèles' },
  { value: 'carriere', label: '💼 Carrière' },
  { value: 'ethique', label: '🌍 Éthique' },
  { value: 'apprendre', label: '🎓 Apprendre' },
]

type Props = {
  onPostCreated?: () => void
  compact?: boolean
}

export default function ComposePost({ onPostCreated, compact }: Props) {
  const { user, profile } = useAuth()
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(!compact)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async () => {
    if (!user || !content.trim()) return
    setLoading(true)

    const tagsArray = tags.split(',').map(t => t.trim().replace('#', '')).filter(Boolean)

    const { error } = await supabase.from('posts').insert({
      author_id: user.id,
      content: content.trim(),
      category: category || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
    })

    if (!error) {
      setContent('')
      setCategory('')
      setTags('')
      setExpanded(false)
      onPostCreated?.()
    }
    setLoading(false)
  }

  const charCount = content.length
  const maxChars = 1000
  const remaining = maxChars - charCount
  const isOverLimit = remaining < 0

  if (!profile) return null

  return (
    <div className={clsx('border-b border-border', expanded ? 'p-4' : 'p-3')}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-bg-tertiary border border-border overflow-hidden flex-shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand/10">
              <span className="text-brand text-sm font-display font-700">
                {(profile.display_name || profile.username)[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="Quoi de neuf dans le monde de l'IA ?"
            rows={expanded ? 3 : 1}
            className="w-full bg-transparent text-text-primary placeholder-text-muted text-sm outline-none resize-none leading-relaxed"
          />

          {expanded && (
            <div className="mt-3 space-y-3 animate-fadeInUp">
              {/* Catégorie */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(cat => cat === c.value ? '' : c.value)}
                    className={clsx(
                      'text-xs px-2.5 py-1 rounded-full border transition-all',
                      category === c.value
                        ? 'border-brand/50 bg-brand/10 text-brand'
                        : 'border-border text-text-muted hover:border-border-bright hover:text-text-secondary'
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Tags */}
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Tags séparés par virgule (ex: gpt4, llm, prompt)"
                className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-xs text-text-secondary placeholder-text-muted outline-none focus:border-brand/40"
              />

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className={clsx('text-xs', remaining < 50 ? 'text-accent-red' : 'text-text-muted')}>
                  {remaining} caractères
                </span>
                <div className="flex items-center gap-2">
                  {compact && (
                    <button
                      onClick={() => { setExpanded(false); setContent('') }}
                      className="text-text-muted hover:text-text-secondary text-xs px-3 py-1.5"
                    >
                      Annuler
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !content.trim() || isOverLimit}
                    className="flex items-center gap-2 px-4 py-1.5 bg-brand text-bg-primary rounded-full text-xs font-display font-700 hover:opacity-90 disabled:opacity-40 transition-all"
                  >
                    {loading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    Publier
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
