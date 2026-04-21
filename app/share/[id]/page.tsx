import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Zap, Share2, TrendingUp } from 'lucide-react'

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
  top_3_improvements: string[]
  created_at: string
}

const DIMENSION_LABELS: Record<string, string> = {
  personalization: 'Personalization',
  subject_line: 'Subject Line',
  clarity_of_offer: 'Clarity of Offer',
  cta_strength: 'CTA Strength',
  length_readability: 'Length & Readability',
  tone: 'Tone',
}

async function getScore(id: string): Promise<ScoreData | null> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://coldscoreai.com'
    const res = await fetch(`${appUrl}/api/share/${id}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const score = await getScore(params.id)
  if (!score) return { title: 'Score not found — ColdScore.ai' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://coldscoreai.com'

  return {
    title: `${score.total_score}/100 Cold Email Score — ColdScore.ai`,
    description: `Cold email scored ${score.total_score}/100. Predicted open rate: ${score.predicted_open_rate}, reply rate: ${score.predicted_reply_rate}. Grade yours free at ColdScore.ai.`,
    openGraph: {
      title: `${score.total_score}/100 Cold Email Score`,
      description: `Open rate: ${score.predicted_open_rate} · Reply rate: ${score.predicted_reply_rate} · Graded by ColdScore.ai`,
      images: [
        {
          url: `${appUrl}/api/og?score=${score.total_score}&open=${encodeURIComponent(score.predicted_open_rate)}&reply=${encodeURIComponent(score.predicted_reply_rate)}`,
          width: 1200,
          height: 630,
          alt: `ColdScore.ai — ${score.total_score}/100`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${score.total_score}/100 Cold Email Score`,
      description: `Open rate: ${score.predicted_open_rate} · Reply rate: ${score.predicted_reply_rate}`,
      images: [
        `${appUrl}/api/og?score=${score.total_score}&open=${encodeURIComponent(score.predicted_open_rate)}&reply=${encodeURIComponent(score.predicted_reply_rate)}`,
      ],
    },
  }
}

function totalScoreColor(score: number): string {
  if (score >= 75) return 'text-green-400'
  if (score >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

function dimColor(score: number, max: number): string {
  const pct = score / max
  if (pct >= 0.75) return 'bg-green-500'
  if (pct >= 0.5) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const data = await getScore(params.id)
  if (!data) notFound()

  const scoreColor = totalScoreColor(data.total_score)
  const shareLabel =
    data.total_score >= 75 ? 'Great Email 🟢' : data.total_score >= 50 ? 'Needs Work 🟡' : 'Weak Email 🔴'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          <span className="text-white font-bold">ColdScore.ai</span>
        </Link>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Grade my email — Free
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        {/* Shared Score Header */}
        <div className="text-center py-10">
          <div className="text-slate-400 text-sm mb-3">Cold email score</div>
          <div className={`text-8xl font-black ${scoreColor} leading-none`}>{data.total_score}</div>
          <div className="text-slate-400 text-xl mt-1">/ 100</div>
          <div className={`text-lg font-semibold mt-2 ${scoreColor}`}>{shareLabel}</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Predicted Open Rate', value: data.predicted_open_rate, icon: TrendingUp },
            { label: 'Predicted Reply Rate', value: data.predicted_reply_rate, icon: Share2 },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 text-center">
              <s.icon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-400">{s.value}</div>
              <div className="text-slate-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Score Breakdown */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold text-base mb-4">Score Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(data.dimensions).map(([key, dim]) => {
              const pct = Math.round((dim.score / dim.max) * 100)
              const barColor = dimColor(dim.score, dim.max)
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 text-sm">{DIMENSION_LABELS[key]}</span>
                    <span className="text-slate-400 text-sm font-medium">{dim.score}/{dim.max}</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-bar-fill ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-900/60 to-slate-800/60 border border-blue-700/40 rounded-2xl p-6 text-center">
          <h3 className="text-white font-bold text-lg mb-2">How does your cold email score?</h3>
          <p className="text-slate-400 text-sm mb-4">
            Free AI scoring across 6 dimensions + predicted open & reply rates + rewrite suggestions.
            No Chrome extension. No signup required.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-base transition-colors"
          >
            <Zap className="w-5 h-5" />
            Grade my email — Free
          </Link>
          <p className="text-slate-500 text-xs mt-3">5 free grades/day · No extension needed</p>
        </div>
      </div>
    </div>
  )
}
