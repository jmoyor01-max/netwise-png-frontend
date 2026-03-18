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
      <div style={styles.left}>
        <div style={styles.brand}>NETWISE PNG</div>
        <h1 style={styles.tagline}>Cybersecurity awareness for Papua New Guinea</h1>
        <p style={styles.sub}>Free, interactive, and built locally.</p>
      </div>
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to continue learning</p>
          {error && <p style={styles.error}>{error}</p>}
          <form onSubmit={handleLogin}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p style={styles.footer}>
            Don't have an account? <Link to="/register" style={styles.footerLink}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' },
  left: { background: '#E24B4A', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  brand: { color: '#fff', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '2rem' },
  tagline: { color: '#fff', fontSize: '28px', fontWeight: '600', lineHeight: '1.3', marginBottom: '1rem' },
  sub: { color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.7' },
  right: { background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  card: { background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '380px' },
  title: { fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' },
  subtitle: { fontSize: '13px', color: '#666', marginBottom: '1.5rem' },
  error: { color: '#E24B4A', fontSize: '13px', marginBottom: '1rem', padding: '8px 12px', background: '#FCEBEB', borderRadius: '6px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '500', color: '#444', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', border: '0.5px solid #ddd', borderRadius: '6px', fontSize: '14px', marginBottom: '1rem', outline: 'none' },
  btn: { width: '100%', padding: '11px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  footer: { textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '1.25rem' },
  footerLink: { color: '#E24B4A', fontWeight: '500' },
}