'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Loader2, Zap, BarChart2, RefreshCw, Share2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user } = useUser()
  const [email, setEmail] = useState('')
  const [recipient, setRecipient] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), recipient: recipient.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setError(
            "You've used your 5 free grades today. Upgrade to Pro for unlimited grading — just $9/month."
          )
        } else {
          setError(data.error || 'Something went wrong. Please try again.')
        }
        return
      }

      router.push(`/results/${data.id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-400" />
          <span className="text-white font-bold text-xl">ColdScore.ai</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="text-slate-300 hover:text-white text-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-slate-300 hover:text-white text-sm">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Pro — $9/mo
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-6">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Free · No extension needed · 5 grades/day
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Know if your cold email is good{' '}
          <span className="text-blue-400">before you hit send.</span>
        </h1>
        <p className="text-slate-400 text-lg mb-10">
          Paste your email below. AI scores it across 6 dimensions, predicts your open & reply rates,
          and rewrites weak sections — in under 10 seconds.
        </p>

        {/* Score Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 text-left">
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Paste your cold email *
            </label>
            <textarea
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Subject: Quick question about [Company]

Hi [Name],

I noticed you're using [Tool] at [Company]. We help [similar companies] achieve [outcome] in [timeframe].

Would it make sense to have a 15-min call this week?

Best,
[Your name]"
              rows={10}
              className="w-full bg-slate-900/80 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Who are you emailing? <span className="text-slate-500 font-normal">(optional — improves scoring)</span>
            </label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. SaaS CEO, VP of Sales, HR Director at a 200-person startup"
              className="w-full bg-slate-900/80 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-300 text-sm">
              {error}{' '}
              {error.includes('Upgrade') && (
                <Link href="/sign-up" className="underline font-medium">
                  Upgrade now →
                </Link>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3.5 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Grading your email…
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Grade My Email — Free
              </>
            )}
          </button>
          <p className="text-center text-slate-500 text-xs mt-3">
            5 free grades per day · No signup required · Results in ~8 seconds
          </p>
        </form>
      </div>

      {/* Feature strip */}
      <div className="max-w-3xl mx-auto px-6 pb-16 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: BarChart2, label: '6-Dimension Score', sub: 'Personalization, Subject, CTA...' },
            { icon: Zap, label: 'Predicted Rates', sub: 'Open rate + reply rate' },
            { icon: RefreshCw, label: 'AI Rewrite', sub: 'Score 90+ version of your email' },
            { icon: Share2, label: 'Shareable Card', sub: 'Post your score on LinkedIn' },
          ].map((f) => (
            <div key={f.label} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
              <f.icon className="w-5 h-5 text-blue-400 mb-2" />
              <div className="text-white text-sm font-medium">{f.label}</div>
              <div className="text-slate-500 text-xs mt-0.5">{f.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing section */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-center text-2xl font-bold text-white mb-2">Simple pricing</h2>
        <p className="text-center text-slate-400 text-sm mb-8">
          Cheaper than Lavender. No Chrome extension. Works anywhere.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Free',
              price: '$0',
              period: '/month',
              highlight: false,
              features: [
                '5 email grades/day',
                'Full 6-dimension score',
                'Predicted open & reply rate',
                'Shareable score URL',
              ],
              cta: 'Start for free',
              href: '/',
            },
            {
              name: 'Pro',
              price: '$9',
              period: '/month',
              highlight: true,
              badge: 'Most Popular',
              features: [
                'Unlimited grades',
                'AI rewrite suggestions',
                'Score history',
                'Shareable score cards',
                'PDF export',
              ],
              cta: 'Start Pro — $9/mo',
              href: '/sign-up?plan=pro',
            },
            {
              name: 'Team',
              price: '$29',
              period: '/month',
              highlight: false,
              features: [
                'Everything in Pro',
                'Up to 10 team seats',
                'Manager dashboard',
                'Team benchmarks',
                'CSV export',
                'Team invite link',
              ],
              cta: 'Start Team — $29/mo',
              href: '/sign-up?plan=team',
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 border ${
                plan.highlight
                  ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-900/30'
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <div className={`text-sm font-medium mb-1 ${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>
                {plan.name}
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-blue-100' : 'text-slate-300'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${plan.highlight ? 'bg-blue-500 text-white' : 'bg-slate-700 text-blue-400'}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-500 text-xs mt-6">
          vs. Lavender.ai — $29/mo minimum + Chrome extension required. ColdScore works anywhere, costs less.
        </p>
      </div>
    </div>
  )
}
