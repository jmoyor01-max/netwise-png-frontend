import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
    if (error) { setError(error.message); setLoading(false); return }
    await supabase.from('profiles').insert({ id: data.user.id, username, email, role: 'user' })
    navigate('/home')
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>NETWISE PNG</div>
        <h1 style={styles.tagline}>Start your cybersecurity journey today</h1>
        <p style={styles.sub}>Free modules, quizzes, and real PNG scam examples.</p>
      </div>
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Create an account</h2>
          <p style={styles.subtitle}>It's free — no credit card needed</p>
          {error && <p style={styles.error}>{error}</p>}
          <form onSubmit={handleRegister}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Your display name" />
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="At least 6 characters" />
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p style={styles.footer}>
            Already have an account? <Link to="/login" style={styles.footerLink}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' },
  left: { background: '#2C2C2A', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  brand: { color: '#E24B4A', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '2rem' },
  tagline: { color: '#fff', fontSize: '28px', fontWeight: '600', lineHeight: '1.3', marginBottom: '1rem' },
  sub: { color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7' },
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