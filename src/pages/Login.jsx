import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    navigate('/home')
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.top}>
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}>🛡</div>
          </div>
          <h1 style={styles.appName}>NetWise PNG</h1>
          <p style={styles.appTag}>Papua New Guinea Cybersecurity Platform</p>
        </div>

        <div style={styles.divider} />

        <h2 style={styles.title}>Sign in to your account</h2>
        <p style={styles.subtitle}>Welcome back — continue your learning journey</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              onFocus={e => e.target.style.borderColor = 'rgba(226,75,74,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              onFocus={e => e.target.style.borderColor = 'rgba(226,75,74,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
          <button
            style={styles.btn}
            type="submit"
            disabled={loading}
            onMouseEnter={e => e.target.style.background = '#c73b3a'}
            onMouseLeave={e => e.target.style.background = '#E24B4A'}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.footerLink}>Create one free</Link>
        </p>

        <div style={styles.features}>
          {['6 free modules', 'Interactive quizzes', 'PNG scam alerts', 'English & Tok Pisin'].map((f, i) => (
            <div key={i} style={styles.featureTag}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#060a14',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '2.5rem',
    animation: 'fadeUp 0.6s ease both',
  },
  top: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  logoWrap: {
    width: '56px',
    height: '56px',
    background: '#E24B4A',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    marginBottom: '1rem',
    animation: 'glowPulse 3s ease-in-out infinite',
  },
  appName: {
    color: '#fff',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    marginBottom: '4px',
  },
  appTag: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '12px',
    textAlign: 'center',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
    marginBottom: '1.75rem',
  },
  title: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '6px',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '13px',
    marginBottom: '1.5rem',
  },
  error: {
    background: 'rgba(226,75,74,0.1)',
    border: '1px solid rgba(226,75,74,0.3)',
    color: '#fca5a5',
    fontSize: '13px',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0' },
  fieldGroup: { marginBottom: '1rem' },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: '7px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: '#E24B4A',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    marginTop: '0.5rem',
    transition: 'all 0.2s',
    cursor: 'pointer',
    animation: 'glowPulse 3s ease-in-out infinite',
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.3)',
    marginTop: '1.25rem',
  },
  footerLink: {
    color: '#E24B4A',
    fontWeight: '600',
  },
  features: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '1.5rem',
    justifyContent: 'center',
  },
  featureTag: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.35)',
    fontSize: '11px',
    padding: '4px 12px',
    borderRadius: '20px',
  },
}