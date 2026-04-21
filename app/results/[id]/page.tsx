'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Share2, Copy, CheckCheck, TrendingUp, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react'

interface DimensionScore {
  score: number
  max: number
  feedback: string
}

interface ScoreData {
  id: string
  total_score: number
  dimensions: {
    personalization: DimensionScore
    subject_line: DimensionScore
    clarity_of_offer: DimensionScore
    cta_strength: DimensionScore
    length_readability: DimensionScore
    tone: DimensionScore
  }
  predicted_open_rate: string
  predicted_reply_rate: string
  rewritten_email: string
  top_3_improvements: string[]
}

const DIMENSION_LABELS: Record<string, string> = {
  personalization: 'Personalization',
  subject_line: 'Subject Line',
  clarity_of_offer: 'Clarity of Offer',
  cta_strength: 'CTA Strength',
  length_readability: 'Length & Readability',
  tone: 'Tone',
}

function scoreColor(score: number, max: number): { text: string; bg: string; border: string } {
  const pct = score / max
  if (pct >= 0.75) return { text: 'text-green-400', bg: 'bg-green-500', border: 'border-green-500/30' }
  if (pct >= 0.5) return { text: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500/30' }
  return { text: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500/30' }
}

function totalScoreColor(score: number): string {
  if (score >= 75) return 'text-green-400'
  if (score >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

function totalScoreLabel(score: number): string {
  if (score >= 75) return 'Great Email ✅'
  if (score >= 50) return 'Needs Work ⚠️'
  return 'Weak Email ❌'
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [data, setData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (!id) return

    async function loadScore() {
      try {
        const res = await fetch(`/api/share/${id}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('Score not found.')
          } else {
            setError('Failed to load results.')
          }
          return
        }
        const json = await res.json()
        setData(json)
        setTimeout(() => setAnimating(true), 100)
      } catch {
        setError('Network error.')
      } finally {
        setLoading(false)
      }
    }

    loadScore()
  }, [id])

  async function copyShareUrl() {
    const url = `${window.location.origin}/share/${id}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function shareToTwitter() {
    if (!data) return
    const text = `My cold email scored ${data.total_score}/100 on @ColdScoreAI 📊\n✉️ Open rate: ${data.predicted_open_rate} | Reply rate: ${data.predicted_reply_rate}\n\nGrade yours free:`
    const url = `${window.location.origin}/share/${id}`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">{error || 'Something went wrong.'}</p>
        <Link href="/" className="text-blue-400 hover:underline text-sm">← Grade another email</Link>
      </div>
    )
  }

  const scoreColor = totalScoreColor(data.total_score)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          <span className="text-white font-bold">ColdScore.ai</span>
        </div>
        <Link href="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Grade another email
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Big Score */}
        <div className="text-center py-12">
          <div className={`text-8xl md:text-9xl font-black ${scoreColor} leading-none`}>
            {data.total_score}
          </div>
          <div className="text-slate-400 text-2xl font-medium mt-2">/ 100</div>
          <div className={`text-xl font-semibold mt-3 ${scoreColor}`}>
            {totalScoreLabel(data.total_score)}
          </div>
        </div>

        {/* Predicted Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Predicted Open Rate', value: data.predicted_open_rate, icon: TrendingUp },
            { label: 'Predicted Reply Rate', value: data.predicted_reply_rate, icon: RefreshCw },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 text-center">
              <stat.icon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-400">{stat.value}</div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 6 Dimension Bars */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold text-lg mb-5">Score Breakdown</h2>
          <div className="space-y-5">
            {Object.entries(data.dimensions).map(([key, dim]) => {
              const colors = scoreColor(dim.score, dim.max)
              const pct = animating ? Math.round((dim.score / dim.max) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-300 text-sm font-medium">{DIMENSION_LABELS[key]}</span>
                    <span className={`text-sm font-bold ${colors.text}`}>
                      {dim.score} / {dim.max}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-bar-fill ${colors.bg}`}
                      style={{ width: animating ? `${pct}%` : '0%', transition: 'width 1s ease-out' }}
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5">{dim.feedback}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top 3 Improvements */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold text-lg mb-4">Top 3 Improvements</h2>
          <div className="space-y-3">
            {data.top_3_improvements.map((tip, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-slate-300 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Rewrite */}
        <div className="bg-slate-800/60 border border-blue-700/40 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold text-lg mb-1">
            Here&apos;s how to score 90+
            <span className="ml-2 bg-blue-600/30 text-blue-300 text-xs px-2 py-0.5 rounded-full font-normal">AI Rewrite</span>
          </h2>
          <p className="text-slate-500 text-sm mb-4">This version scores ~90+ based on the improvements above.</p>
          <pre className="text-slate-200 text-sm whitespace-pre-wrap font-sans leading-relaxed bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            {data.rewritten_email}
          </pre>
        </div>

        {/* Share + CTA */}
        <div className="bg-gradient-to-r from-blue-900/60 to-slate-800/60 border border-blue-700/40 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg mb-1">Share your score</h2>
          <p className="text-slate-400 text-sm mb-4">Your score has a permanent public URL.</p>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-400 text-sm truncate">
              {typeof window !== 'undefined' ? `${window.location.origin}/share/${id}` : `coldscoreai.com/share/${id}`}
            </div>
            <button
              onClick={copyShareUrl}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button
              onClick={shareToTwitter}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Post on X/Twitter
            </button>
          </div>

          <div className="border-t border-slate-700/50 pt-4">
            <p className="text-slate-300 text-sm mb-3">
              Want unlimited grades + score history + PDF export?
            </p>
            <Link
              href="/sign-up?plan=pro"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <Zap className="w-4 h-4" />
              Upgrade to Pro — $9/month
            </Link>
            <span className="text-slate-500 text-xs ml-3">Unlimited grades · Rewrite suggestions · Score history</span>
          </div>
        </div>
      </div>
    </div>
  )
}
