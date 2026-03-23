import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Sidebar({ lang, setLang, isAdmin }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const navItems = [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/modules', icon: '📚', label: 'Modules' },
    { path: '/quizzes', icon: '🧠', label: 'Quizzes' },
    { path: '/progress', icon: '📊', label: 'Progress' },
    ...(isAdmin ? [{ path: '/admin', icon: '⚙️', label: 'Admin', badge: 'You' }] : []),
  ]

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoWrap}>
        <div style={styles.logoIcon}>🛡</div>
        <div style={styles.logoText}>NetWise PNG</div>
        <div style={styles.logoSub}>Cybersecurity Platform</div>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.navItem,
              ...(isActive(item.path) ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={{
              ...styles.navLabel,
              ...(isActive(item.path) ? styles.navLabelActive : {}),
            }}>
              {item.label}
            </span>
            {item.badge && <span style={styles.navBadge}>{item.badge}</span>}
          </Link>
        ))}
      </nav>

      <div style={styles.bottom}>
        <div style={styles.langToggle}>
          <div
            style={{ ...styles.langOpt, ...(lang === 'en' ? styles.langOptActive : {}) }}
            onClick={() => setLang('en')}
          >
            EN
          </div>
          <div
            style={{ ...styles.langOpt, ...(lang === 'tp' ? styles.langOptActive : {}) }}
            onClick={() => setLang('tp')}
          >
            TP
          </div>
        </div>
        <div
          style={styles.logoutBtn}
          onClick={handleLogout}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '13px' }}>🚪</span>
          <span style={styles.logoutLabel}>Logout</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '160px',
    minHeight: '100vh',
    background: 'rgba(14,165,233,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(14,165,233,0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem 0.75rem',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  logoWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    boxShadow: '0 6px 18px rgba(14,165,233,0.4)',
    animation: 'glowPulse 3s ease-in-out infinite',
  },
  logoText: {
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
    textAlign: 'center',
  },
  logoSub: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: '9px',
    textAlign: 'center',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: '3px' },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '9px 10px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textDecoration: 'none',
  },
  navItemActive: {
    background: 'rgba(14,165,233,0.1)',
    border: '1px solid rgba(14,165,233,0.18)',
  },
  navIcon: { fontSize: '14px', flexShrink: 0 },
  navLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.35)',
  },
  navLabelActive: {
    color: '#38bdf8',
    fontWeight: '600',
  },
  navBadge: {
    marginLeft: 'auto',
    background: 'rgba(14,165,233,0.15)',
    color: '#38bdf8',
    fontSize: '9px',
    fontWeight: '700',
    padding: '1px 6px',
    borderRadius: '10px',
  },
  bottom: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  langToggle: {
    display: 'flex',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '4px',
  },
  langOpt: {
    flex: 1,
    padding: '6px 0',
    fontSize: '10px',
    fontWeight: '700',
    textAlign: 'center',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.3)',
    transition: 'all 0.2s',
  },
  langOptActive: {
    background: 'rgba(14,165,233,0.15)',
    color: '#38bdf8',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  logoutLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.3)',
  },
}