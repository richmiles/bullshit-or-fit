import { useEffect, useMemo, useState } from 'react'

const DEFAULT_CONFIG = {
  enabled: true,
  cta: 'Request Early Access',
  headline: 'Verify resume claims before you waste interview cycles',
  subheadline:
    'Bullshit or Fit cross-checks credentials, employment claims, and public footprint evidence so you can screen with confidence.',
}

const CONFIRM_STATES = {
  idle: null,
  loading: 'Confirming your request...',
  confirmed: 'You are confirmed. We will follow up shortly.',
  error: 'Confirmation failed. Please request another confirmation email.',
}

export function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    website: '',
  })
  const [status, setStatus] = useState('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resendMessage, setResendMessage] = useState('')
  const [confirmState, setConfirmState] = useState('idle')

  useEffect(() => {
    fetch('/api/landing-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json) return
        setConfig((prev) => ({
          ...prev,
          ...json,
        }))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('confirm')
    if (!token) return

    setConfirmState('loading')
    fetch(`/api/leads/confirm?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('confirm_failed')
        return res.json()
      })
      .then(() => setConfirmState('confirmed'))
      .catch(() => setConfirmState('error'))
  }, [])

  async function onSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setStatusMessage('')

    try {
      const response = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source_url: window.location.href,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setStatus('error')
        setStatusMessage(data?.detail || data?.message || 'Submission failed.')
        return
      }

      setStatus('success')
      setStatusMessage(data?.message || 'Submission accepted. Check your email to confirm.')
      setForm({ name: '', email: '', company: '', message: '', website: '' })
      setResendEmail((prev) => prev || form.email)
    } catch {
      setStatus('error')
      setStatusMessage('Submission failed due to a network error.')
    }
  }

  async function onResend(event) {
    event.preventDefault()
    setResendMessage('')
    if (!resendEmail) return

    const response = await fetch('/api/leads/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resendEmail }),
    })

    if (!response.ok) {
      setResendMessage('Could not resend confirmation. Try again in a minute.')
      return
    }

    const data = await response.json().catch(() => ({}))
    setResendMessage(data?.message || 'If found, a confirmation email was sent.')
  }

  const confirmMessage = useMemo(() => CONFIRM_STATES[confirmState], [confirmState])

  return (
    <div className="page">
      <header className="hero">
        <div className="badge">Hiring Signal Intelligence</div>
        <h1>{config.headline}</h1>
        <p>{config.subheadline}</p>
        <a className="cta" href="#lead-form">{config.cta}</a>
      </header>

      {confirmMessage && <section className={`notice ${confirmState}`}>{confirmMessage}</section>}

      <main>
        <section className="section">
          <h2>The Problem</h2>
          <p>
            Interviews are expensive. Fake titles, inflated credentials, and fabricated employers slip through before you detect risk.
          </p>
        </section>

        <section className="section">
          <h2>The Solution</h2>
          <p>
            Bullshit or Fit cross-references resume claims against public records, domain intelligence, and verifiable web footprint data.
          </p>
          <ul>
            <li>Credential + employer plausibility checks</li>
            <li>Evidence trace with confidence score</li>
            <li>Clear pass/fail recommendation for screening</li>
          </ul>
        </section>

        <section className="section steps">
          <h2>How It Works</h2>
          <ol>
            <li>Submit candidate profile and claim set.</li>
            <li>We run multi-source verification checks.</li>
            <li>You receive a decision brief before interview scheduling.</li>
          </ol>
        </section>

        <section className="section trust">
          <h2>Built for Responsible Hiring</h2>
          <p>
            Bullshit or Fit provides screening intelligence, not employment decisions. Human review stays in control.
          </p>
        </section>

        <section id="lead-form" className="section form-section">
          <h2>Get Early Access</h2>
          <form onSubmit={onSubmit} className="lead-form">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </label>
            <label>
              Work Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </label>
            <label>
              Company
              <input
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              />
            </label>
            <label>
              What role are you hiring for?
              <textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={4}
              />
            </label>
            <label className="honeypot" aria-hidden="true">
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              />
            </label>
            <button type="submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Submitting...' : 'Request Access'}
            </button>
          </form>
          {statusMessage && <p className={`status ${status}`}>{statusMessage}</p>}

          <form onSubmit={onResend} className="resend-form">
            <h3>Need another confirmation email?</h3>
            <input
              type="email"
              placeholder="you@company.com"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              required
            />
            <button type="submit">Resend confirmation</button>
          </form>
          {resendMessage && <p className="status info">{resendMessage}</p>}
        </section>
      </main>

      <footer>
        <a href="/privacy.html">Privacy</a>
        <a href="/terms.html">Terms</a>
        <span>Verification support only. Final hiring decisions require human review.</span>
      </footer>
    </div>
  )
}
