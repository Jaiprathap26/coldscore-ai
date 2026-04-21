import { SignUp } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { plan?: string }
}) {
  // After sign-up, redirect to checkout if plan is specified
  const afterUrl =
    searchParams.plan === 'pro' || searchParams.plan === 'team'
      ? `/api/stripe/checkout?plan=${searchParams.plan}`
      : '/'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        {searchParams.plan && (
          <div className="mb-4 text-blue-300 text-sm">
            Creating your account — then we'll set up{' '}
            <strong>{searchParams.plan === 'pro' ? 'Pro ($9/mo)' : 'Team ($29/mo)'}</strong>
          </div>
        )}
        <SignUp redirectUrl={afterUrl} />
      </div>
    </div>
  )
}
