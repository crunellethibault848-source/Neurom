import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, Users, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type SuggestedProfile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  expertise_level: string
  followers_count: number
}

const TRENDING_TAGS = [
  { tag: 'GPT-5', count: '2.4k posts' },
  { tag: 'Gemini', count: '1.8k posts' },
  { tag: 'OpenSource', count: '1.2k posts' },
  { tag: 'PromptEngineering', count: '980 posts' },
  { tag: 'AgentsIA', count: '756 posts' },
]

export default function RightPanel() {
  const [suggested, setSuggested] = useState<SuggestedProfile[]>([])

  useEffect(() => {
    fetchSuggested()
  }, [])

  const fetchSuggested = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, expertise_level, followers_count')
      .order('followers_count', { ascending: false })
      .limit(3)
    if (data) setSuggested(data)
  }

  return (
    <div className="space-y-4">
      {/* Tendances */}
      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <TrendingUp size={15} className="text-brand" />
          <span className="font-display font-700 text-text-primary text-sm">Tendances IA</span>
        </div>
        <div className="divide-y divide-border">
          {TRENDING_TAGS.map(({ tag, count }) => (
            <button key={tag} className="w-full px-4 py-3 text-left hover:bg-bg-hover transition-all">
              <p className="text-brand text-sm font-500">#{tag}</p>
              <p className="text-text-muted text-xs mt-0.5">{count}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Profils suggérés */}
      {suggested.length > 0 && (
        <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Users size={15} className="text-brand" />
            <span className="font-display font-700 text-text-primary text-sm">À suivre</span>
          </div>
          <div className="divide-y divide-border">
            {suggested.map(p => (
              <Link
                key={p.id}
                href={`/profile/${p.username}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-bg-hover transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-bg-tertiary border border-border overflow-hidden flex-shrink-0">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand/10">
                      <span className="text-brand text-xs font-display font-700">
                        {(p.display_name || p.username)[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-xs font-500 truncate">{p.display_name || p.username}</p>
                  <p className="text-text-muted text-xs truncate">@{p.username}</p>
                </div>
                <span className="text-text-muted text-xs">{p.followers_count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lien footer */}
      <p className="text-text-muted text-xs px-1">
        © 2024 Neurom · <span className="hover:text-text-secondary cursor-pointer">Confidentialité</span> · <span className="hover:text-text-secondary cursor-pointer">Conditions</span>
      </p>
    </div>
  )
}
