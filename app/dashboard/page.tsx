'use client'

import { useEffect, useState } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Zap, BarChart2, Plus, CheckCircle } from 'lucide-react'

interface ScoreRecord {
  id: string
  total_score: number
  predicted_open_rate: string
  predicted_reply_rate: string
  created_at: string
}

function totalScoreColor(score: number): string {
  if (score >= 75) return 'text-green-400'
  if (score >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const upgraded = searchParams?.get('upgraded') === 'true'

  const [scores, setScores] = useState<ScoreRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    if (!user) return

    async function loadScores() {
      try {
        const res = await fetch('/api/scores')
        if (res.ok) {
          const data = await res.json()
          setScores(data)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }

    loadScores()
  }, [user])

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Zap className="w-8 h-8 text-blue-400 animate-pulse" />
      </div>
    )
  }

  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, s) => a + s.total_score, 0) / scores.length)
      : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          <span className="text-white font-bold">ColdScore.ai</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Grade new email
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Upgrade success banner */}
        {upgraded && (
          <div className="flex items-center gap-3 bg-green-900/30 border border-green-700/50 rounded-xl px-4 py-3 mb-6 text-green-300 text-sm">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            You&apos;re now on Pro! Unlimited email grading is unlocked.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Emails Graded', value: scores.length },
            { label: 'Average Score', value: avgScore !== null ? `${avgScore}/100` : '—' },
            {
              label: 'Best Score',
              value:
                scores.length > 0 ? `${Math.max(...scores.map((s) => s.total_score))}/100` : '—',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 text-center"
            >
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Score history */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-700">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-semibold">Score History</h2>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">Loading…</div>
          ) : scores.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-400 text-sm mb-4">No emails graded yet.</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Grade your first email
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {scores.map((s) => (
                <Link
                  key={s.id}
                  href={`/results/${s.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-700/30 transition-colors"
                >
                  <div>
                    <div className="text-slate-300 text-sm">
                      {new Date(s.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5">
                      Open: {s.predicted_open_rate} · Reply: {s.predicted_reply_rate}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${totalScoreColor(s.total_score)}`}>
                    {s.total_score}
                    <span className="text-slate-500 text-base font-normal">/100</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
