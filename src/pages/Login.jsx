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
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>🛡</div>
          <div>
            <div style={styles.appName}>NetWise PNG</div>
            <div style={styles.appSub}>Papua New Guinea Cybersecurity Platform</div>
          </div>
        </div>
        <div style={styles.divider} />
        <div style={styles.eyebrow}>Sign in to your account</div>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Continue your cybersecurity learning journey</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
              onFocus={e => { e.target.style.borderColor = 'rgba(14,165,233,0.6)'; e.target.style.background = 'rgba(14,165,233,0.05)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              onFocus={e => { e.target.style.borderColor = 'rgba(14,165,233,0.6)'; e.target.style.background = 'rgba(14,165,233,0.05)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }} />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>
        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.footerLink}>Create one free</Link>
        </p>
        <div style={styles.tags}>
          {['6 free modules', 'Interactive quizzes', 'PNG scam alerts', 'EN & Tok Pisin'].map((t, i) => (
            <span key={i} style={styles.tag}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #050d1a 0%, #071524 60%, #050d12 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' },
  orb1: { position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', top: '-150px', left: '-150px', animation: 'orb 14s ease-in-out infinite', pointerEvents: 'none' },
  orb2: { position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,132,199,0.1) 0%, transparent 70%)', bottom: '-100px', right: '-100px', animation: 'orb 18s 2s ease-in-out infinite', pointerEvents: 'none' },
  card: { position: 'relative', zIndex: 2, width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)', animation: 'fadeUp 0.7s ease both' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' },
  logoIcon: { width: '48px', height: '48px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 8px 24px rgba(14,165,233,0.4)', flexShrink: 0, animation: 'glowPulse 3s ease-in-out infinite' },
  appName: { color: '#fff', fontSize: '17px', fontWeight: '700', letterSpacing: '-0.3px' },
  appSub: { color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '2px' },
  divider: { height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 0 1.5rem' },
  eyebrow: { fontSize: '10px', fontWeight: '700', color: 'rgba(14,165,233,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '0.5rem' },
  title: { color: '#fff', fontSize: '22px', fontWeight: '800', marginBottom: '5px', letterSpacing: '-0.3px' },
  subtitle: { color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '1.5rem' },
  error: { background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.25)', color: '#fca5a5', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginBottom: '1rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' },
  input: { width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '14px', color: '#fff', outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit' },
  btn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', marginTop: '0.5rem', transition: 'all 0.25s', cursor: 'pointer', boxShadow: '0 8px 24px rgba(14,165,233,0.35)', animation: 'glowPulse 3s ease-in-out infinite' },
  footer: { textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '1.25rem' },
  footerLink: { color: '#0ea5e9', fontWeight: '600' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '1.5rem', justifyContent: 'center' },
  tag: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)', fontSize: '11px', padding: '4px 12px', borderRadius: '20px' },
}