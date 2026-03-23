import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
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
    { num: '01', icon: '🎣', titleEn: 'What is phishing?', titleTp: 'Wanem phishing?', descEn: 'Learn how attackers trick you with fake emails and messages.', descTp: 'Lainim olsem ol attackers i giamanim yu.' },
    { num: '02', icon: '🔑', titleEn: 'Password hygiene', titleTp: 'Lukautim password', descEn: 'Create strong passwords and keep your accounts secure.', descTp: 'Mekim strong passwords na lukautim ol akaunts.' },
    { num: '03', icon: '⚠️', titleEn: 'PNG online scams', titleTp: 'Ol scam long PNG', descEn: 'Real scam examples reported across Papua New Guinea.', descTp: 'Ol tru skam eksampel long Papua Niugini.' },
  ]

  const stats = [
    { num: '6', labelEn: 'Free modules', labelTp: 'Fri moduls' },
    { num: '24', labelEn: 'Quiz questions', labelTp: 'Kwis kwescens' },
    { num: '2', labelEn: 'Languages', labelTp: 'Ol tok ples' },
    { num: '100%', labelEn: 'Free forever', labelTp: 'Fri oltaim' },
  ]

  return (
    <div style={styles.layout}>
      <Sidebar lang={lang} setLang={setLang} isAdmin={isAdmin} />
      <div style={styles.main}>
        <Topbar title="Home" alertCount={2} />
        <div style={styles.content}>
          <div style={styles.heroGrid}>
            <div style={styles.heroLeft}>
              <div style={styles.eyebrow}>
                <span style={styles.eyebrowLine} />
                {lang === 'en' ? 'Papua New Guinea Cybersecurity' : 'PNG Cybersecurity'}
              </div>
              <h1 style={styles.h1}>
                {lang === 'en' ? <>Protect yourself.<br /><strong style={styles.highlight}>Stay safe online.</strong></> : <>Lukautim yu yet.<br /><strong style={styles.highlight}>Stap seif long net.</strong></>}
              </h1>
              <p style={styles.p}>
                {lang === 'en' ? 'Free interactive cybersecurity education built for Papua New Guinea — in English and Tok Pisin.' : 'Fri inraktiv cybersecurity edukesen wokim long Papua Niugini — long Inglis na Tok Pisin.'}
              </p>
              <div style={styles.btns}>
                <Link to="/modules">
                  <button style={styles.btnPrimary}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    {lang === 'en' ? 'Start learning →' : 'Stat lainim →'}
                  </button>
                </Link>
                <Link to="/modules">
                  <button style={styles.btnGhost}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
                    {lang === 'en' ? 'View modules' : 'Lukim moduls'}
                  </button>
                </Link>
              </div>
              <div style={styles.statsGrid}>
                {stats.map((s, i) => (
                  <div key={i} style={{ ...styles.statCard, animationDelay: `${i * 0.08}s` }}>
                    <div style={styles.statNum}>{s.num}</div>
                    <div style={styles.statLabel}>{lang === 'en' ? s.labelEn : s.labelTp}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.heroRight}>
              <ScamAlert lang={lang} />
            </div>
          </div>

          <div style={styles.modulesSection}>
            <div style={styles.sectionTop}>
              <div>
                <h2 style={styles.sectionTitle}>{lang === 'en' ? 'Learning Modules' : 'Ol Modul bilong Lainim'}</h2>
                <p style={styles.sectionSub}>{lang === 'en' ? 'Interactive lessons built for PNG' : 'Inraktiv lesens wokim long PNG'}</p>
              </div>
              <Link to="/modules" style={styles.seeAll}>{lang === 'en' ? 'View all →' : 'Lukim olgeta →'}</Link>
            </div>
            <div style={styles.modulesGrid}>
              {modules.map((mod, i) => (
                <Link to="/modules" key={mod.num} style={{ textDecoration: 'none' }}>
                  <div style={{ ...styles.modCard, animationDelay: `${i * 0.1}s` }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(14,165,233,0.35)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(14,165,233,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)' }}>
                    <div style={styles.modTop}>
                      <div style={{ fontSize: '28px', animation: `float ${4 + i}s ease-in-out infinite` }}>{mod.icon}</div>
                      <div style={styles.modNum}>{mod.num}</div>
                    </div>
                    <div style={styles.modTitle}>{lang === 'en' ? mod.titleEn : mod.titleTp}</div>
                    <div style={styles.modDesc}>{lang === 'en' ? mod.descEn : mod.descTp}</div>
                    <div style={styles.modFooter}>
                      <span style={styles.modLink}>{lang === 'en' ? 'Read module →' : 'Ridim modul →'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #050d1a 0%, #071524 60%, #050d12 100%)' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  content: { padding: '1.5rem 1.25rem', flex: 1 },
  heroGrid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'start', marginBottom: '2rem' },
  heroLeft: { animation: 'fadeUp 0.6s ease both' },
  eyebrow: { fontSize: '10px', fontWeight: '700', color: 'rgba(14,165,233,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' },
  eyebrowLine: { display: 'inline-block', width: '18px', height: '2px', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)', borderRadius: '2px' },
  h1: { color: '#fff', fontSize: '28px', fontWeight: '800', lineHeight: '1.15', marginBottom: '0.75rem', letterSpacing: '-0.8px' },
  highlight: { background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' },
  p: { color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.7', marginBottom: '1.25rem', maxWidth: '380px' },
  btns: { display: 'flex', gap: '10px', marginBottom: '1.5rem' },
  btnPrimary: { background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 20px rgba(14,165,233,0.35)', transition: 'all 0.25s', animation: 'glowPulse 3s ease-in-out infinite' },
  btnGhost: { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 22px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.25s' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  statCard: { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '10px 12px', animation: 'numberPop 0.5s ease both' },
  statNum: { fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '2px' },
  statLabel: { fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '500' },
  heroRight: { animation: 'slideRight 0.6s 0.2s ease both' },
  modulesSection: {},
  sectionTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' },
  sectionTitle: { color: '#fff', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', marginBottom: '2px' },
  sectionSub: { color: 'rgba(255,255,255,0.3)', fontSize: '12px' },
  seeAll: { color: '#0ea5e9', fontSize: '12px', fontWeight: '600' },
  modulesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' },
  modCard: { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s', animation: 'fadeUp 0.6s ease both', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  modTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  modNum: { fontSize: '30px', fontWeight: '800', color: 'rgba(255,255,255,0.04)', lineHeight: '1' },
  modTitle: { color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-0.2px' },
  modDesc: { color: 'rgba(255,255,255,0.35)', fontSize: '12px', lineHeight: '1.6', marginBottom: '1rem' },
  modFooter: { borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' },
  modLink: { color: '#0ea5e9', fontSize: '12px', fontWeight: '600' },
}