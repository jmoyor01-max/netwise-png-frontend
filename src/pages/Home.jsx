import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'
import ScamAlert from '../components/ScamAlert'

export default function Home() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [lang, setLang] = useState('en')
  const navigate = useNavigate()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { navigate('/login'); return }
      setUser(data.user)
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
      if (profile?.role === 'admin') setIsAdmin(true)
    }
    getUser()
  }, [])

  const modules = [
    { num: '01', icon: '🎣', title: lang === 'en' ? 'What is phishing?' : 'Wanem phishing?', desc: lang === 'en' ? 'Learn how attackers trick you with fake emails and messages.' : 'Lainim olsem ol attackers i giamanim yu.' },
    { num: '02', icon: '🔑', title: lang === 'en' ? 'Password hygiene' : 'Lukautim password', desc: lang === 'en' ? 'Create strong passwords and keep your accounts secure.' : 'Mekim strong passwords na lukautim ol akaunts.' },
    { num: '03', icon: '⚠️', title: lang === 'en' ? 'PNG online scams' : 'Ol scam long PNG', desc: lang === 'en' ? 'Real scam examples reported across Papua New Guinea.' : 'Ol tru skam long Papua Niugini.' },
  ]

  const stats = [
    { num: '6', label: lang === 'en' ? 'Free modules' : 'Fri moduls' },
    { num: '24', label: lang === 'en' ? 'Quiz questions' : 'Kwis kwescens' },
    { num: '2', label: lang === 'en' ? 'Languages' : 'Ol tok ples' },
    { num: '100%', label: lang === 'en' ? 'Free forever' : 'Fri oltaim' },
  ]

  return (
    <div style={styles.page}>
      <Navbar lang={lang} setLang={setLang} isAdmin={isAdmin} />

      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <div style={styles.badgeDot}></div>
            {lang === 'en' ? 'Live cybersecurity platform · PNG' : 'Lainim cybersecurity · PNG'}
          </div>
          <h1 style={styles.heroTitle}>
            {lang === 'en' ? <>Stay one step ahead of<br /><span style={styles.highlight}>cyber threats in PNG</span></> : <>Save long ol trabol<br /><span style={styles.highlight}>long internet PNG</span></>}
          </h1>
          <p style={styles.heroSub}>
            {lang === 'en' ? 'Free, interactive cybersecurity education built specifically for Papua New Guinea. Learn to protect yourself from phishing, scams, and online fraud.' : 'Fri, inraktiv cybersecurity edukesen wokim speseli long Papua Niugini. Lainim lukautim yu yet.'}
          </p>
          <div style={styles.heroBtns}>
            <Link to="/modules">
              <button style={styles.btnPrimary}>{lang === 'en' ? 'Start learning free →' : 'Stat lainim fri →'}</button>
            </Link>
            <Link to="/modules">
              <button style={styles.btnGhost}>{lang === 'en' ? 'View all modules' : 'Lukim ol moduls'}</button>
            </Link>
          </div>
        </div>
        <div style={styles.heroAlerts}>
          <ScamAlert lang={lang} />
        </div>
      </div>

      <div style={styles.modulesSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>{lang === 'en' ? 'Learning modules' : 'Ol modul bilong lainim'}</h2>
          <Link to="/modules" style={styles.seeAll}>{lang === 'en' ? 'View all →' : 'Lukim olgeta →'}</Link>
        </div>
        <div style={styles.modulesGrid}>
          {modules.map((mod, i) => (
            <Link to="/modules" key={mod.num} style={{ textDecoration: 'none' }}>
              <div style={{ ...styles.moduleCard, animationDelay: `${i * 0.1}s` }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(226,75,74,0.4)'; e.currentTarget.style.background = 'rgba(226,75,74,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              >
                <div style={styles.moduleCardTop}>
                  <div style={{ ...styles.moduleIcon, animationDelay: `${i * 0.5}s` }}>{mod.icon}</div>
                  <div style={styles.moduleNum}>{mod.num}</div>
                </div>
                <div style={styles.moduleTitle}>{mod.title}</div>
                <div style={styles.moduleDesc}>{mod.desc}</div>
                <div style={styles.moduleLink}>{lang === 'en' ? 'Read module →' : 'Ridim modul →'}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div style={styles.statsBar}>
        {stats.map((s, i) => (
          <div key={i} style={{ ...styles.stat, animationDelay: `${i * 0.1 + 0.5}s` }}>
            <div style={styles.statNum}>{s.num}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  page: { background: '#060a14', minHeight: '100vh' },
  hero: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', padding: '3rem 2rem', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  heroContent: { animation: 'fadeUp 0.6s ease both' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.25)', color: '#E24B4A', fontSize: '11px', padding: '5px 14px', borderRadius: '20px', marginBottom: '1.25rem', fontWeight: '600' },
  badgeDot: { width: '6px', height: '6px', background: '#E24B4A', borderRadius: '50%', animation: 'blink 1.5s ease-in-out infinite' },
  heroTitle: { color: '#fff', fontSize: '38px', fontWeight: '800', lineHeight: '1.15', marginBottom: '1rem', letterSpacing: '-1px' },
  highlight: { background: 'linear-gradient(90deg, #E24B4A, #ff8a65, #E24B4A)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 3s linear infinite' },
  heroSub: { color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: '1.8', maxWidth: '460px', marginBottom: '1.75rem' },
  heroBtns: { display: 'flex', gap: '12px' },
  btnPrimary: { background: '#E24B4A', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', animation: 'glowPulse 3s ease-in-out infinite', transition: 'all 0.2s' },
  btnGhost: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' },
  heroAlerts: { animation: 'slideIn 0.6s 0.2s ease both' },
  modulesSection: { padding: '2.5rem 2rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  sectionTitle: { color: '#fff', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' },
  seeAll: { color: '#E24B4A', fontSize: '13px', fontWeight: '600' },
  modulesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  moduleCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.25s', animation: 'fadeUp 0.6s ease both', position: 'relative', overflow: 'hidden' },
  moduleCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  moduleIcon: { fontSize: '28px', animation: 'float 4s ease-in-out infinite' },
  moduleNum: { fontSize: '32px', fontWeight: '800', color: 'rgba(255,255,255,0.06)', lineHeight: '1' },
  moduleTitle: { color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '8px' },
  moduleDesc: { color: 'rgba(255,255,255,0.4)', fontSize: '12px', lineHeight: '1.7', marginBottom: '1rem' },
  moduleLink: { color: '#E24B4A', fontSize: '12px', fontWeight: '600' },
  statsBar: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid rgba(255,255,255,0.06)' },
  stat: { padding: '1.5rem 2rem', borderRight: '1px solid rgba(255,255,255,0.06)', animation: 'numberCount 0.5s ease both' },
  statNum: { fontSize: '28px', fontWeight: '800', color: '#E24B4A', marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.35)' },
}