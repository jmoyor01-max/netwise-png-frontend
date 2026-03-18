import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Navbar({ lang, setLang, isAdmin }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🛡</div>
        <span style={styles.logoText}>NetWise PNG</span>
      </div>
      <div style={styles.links}>
        <Link to="/home" style={{ ...styles.link, ...(isActive('/home') ? styles.linkActive : {}) }}>Home</Link>
        <Link to="/modules" style={{ ...styles.link, ...(isActive('/modules') ? styles.linkActive : {}) }}>Modules</Link>
        {isAdmin && <Link to="/admin" style={{ ...styles.link, ...(isActive('/admin') ? styles.linkActive : {}) }}>Admin</Link>}
        <button style={styles.langBtn} onClick={() => setLang(lang === 'en' ? 'tp' : 'en')}>
          {lang === 'en' ? 'EN' : 'TP'}
        </button>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: 'rgba(6,10,20,0.95)',
    borderBottom: '1px solid rgba(226,75,74,0.2)',
    padding: '0 2rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '34px',
    height: '34px',
    background: '#E24B4A',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    animation: 'glowPulse 3s ease-in-out infinite',
  },
  logoText: {
    color: '#fff',
    fontSize: '17px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  links: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  link: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '13px',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  linkActive: {
    color: '#fff',
    background: 'rgba(226,75,74,0.15)',
  },
  langBtn: {
    background: 'rgba(226,75,74,0.15)',
    color: '#E24B4A',
    border: '1px solid rgba(226,75,74,0.3)',
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    transition: 'all 0.2s',
  },
  logoutBtn: {
    background: '#E24B4A',
    color: '#fff',
    border: 'none',
    padding: '7px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    animation: 'glowPulse 3s ease-in-out infinite',
    transition: 'all 0.2s',
  },
}