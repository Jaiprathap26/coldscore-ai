import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const score = searchParams.get('score') || '74'
  const openRate = searchParams.get('open') || '28%'
  const replyRate = searchParams.get('reply') || '6%'

  const scoreNum = parseInt(score, 10)
  const color =
    scoreNum >= 75 ? '#22c55e' : scoreNum >= 50 ? '#eab308' : '#ef4444'
  const label =
    scoreNum >= 75 ? 'Great Email 🟢' : scoreNum >= 50 ? 'Needs Work 🟡' : 'Weak Email 🔴'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ color: '#94a3b8', fontSize: '20px', marginBottom: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          ColdScore.ai
        </div>
        <div style={{ color: color, fontSize: '120px', fontWeight: '900', lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ color: '#ffffff', fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
          / 100
        </div>
        <div style={{ color: color, fontSize: '22px', fontWeight: '600', marginBottom: '32px' }}>
          {label}
        </div>
        <div style={{ display: 'flex', gap: '48px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#60a5fa', fontSize: '36px', fontWeight: '800' }}>{openRate}</div>
            <div style={{ color: '#94a3b8', fontSize: '16px' }}>Predicted Open Rate</div>
          </div>
          <div style={{ width: '1px', background: '#334155' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#60a5fa', fontSize: '36px', fontWeight: '800' }}>{replyRate}</div>
            <div style={{ color: '#94a3b8', fontSize: '16px' }}>Predicted Reply Rate</div>
          </div>
        </div>
        <div style={{ color: '#475569', fontSize: '16px', marginTop: '40px' }}>
          coldscoreai.com — Free AI cold email scorer
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
