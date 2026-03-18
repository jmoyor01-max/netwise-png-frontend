import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Navbar({ lang, setLang, isAdmin }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>NETWISE PNG</div>
      <div style={styles.links}>
        <Link to="/home" style={styles.link}>Home</Link>
        <Link to="/modules" style={styles.link}>Modules</Link>
        {isAdmin && <Link to="/admin" style={styles.link}>Admin</Link>}
        <button
          style={styles.langBtn}
          onClick={() => setLang(lang === 'en' ? 'tp' : 'en')}
        >
          {lang === 'en' ? 'EN' : 'TP'}
        </button>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: '#E24B4A',
    padding: '0 1.5rem',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
    letterSpacing: '-0.5px',
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  link: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '13px',
    textDecoration: 'none',
  },
  langBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  logoutBtn: {
    background: '#fff',
    color: '#E24B4A',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
}