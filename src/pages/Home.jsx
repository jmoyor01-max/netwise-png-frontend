import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import ScamAlert from '../components/ScamAlert'
import BadgeSummary from '../components/BadgeSummary'

const MODULE_ICONS = ['🎣', '🔑', '⚠️', '👥', '🌐', '🔒']

export default function Home() {
  const [user, setUser]           = useState(null)
  const [isAdmin, setIsAdmin]     = useState(false)
  const [lang, setLang]           = useState('en')
  const [badges, setBadges]       = useState([])
  const [allModules, setAllModules] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) { navigate('/login'); return }
      setUser(authData.user)

      // Profile (admin check)
      const { data: profile } = await supabase
        .from('profiles').select('role')
        .eq('id', authData.user.id).maybeSingle()
      if (profile?.role === 'admin') setIsAdmin(true)

      // All modules
      const { data: mods } = await supabase
        .from('modules').select('id, title').order('id')
      setAllModules(mods || [])

      // All progress rows for this user
      const { data: prog } = await supabase
        .from('progress').select('*')
        .eq('user_id', authData.user.id)

      // Build a map: module_id → progress row
      const map = {}
      ;(prog || []).forEach(row => { map[row.module_id] = row })
      setProgressMap(map)

      // Badges earned
      setBadges((prog || []).filter(r => r.badge_earned))
    }
    init()
  }, [])

  const previewModules = [
    { num: '01', icon: '🎣', titleEn: 'What is phishing?',    titleTp: 'Wanem phishing?',      descEn: 'Learn how attackers trick you with fake emails and messages.', descTp: 'Lainim olsem ol attackers i giamanim yu.' },
    { num: '02', icon: '🔑', titleEn: 'Password hygiene',     titleTp: 'Lukautim password',    descEn: 'Create strong passwords and keep your accounts secure.',       descTp: 'Mekim strong passwords na lukautim ol akaunts.' },
    { num: '03', icon: '⚠️', titleEn: 'PNG online scams',    titleTp: 'Ol scam long PNG',     descEn: 'Real scam examples reported across Papua New Guinea.',         descTp: 'Ol tru skam eksampel long Papua Niugini.' },
  ]

  const stats = [
    { num: '6',    labelEn: 'Free modules',    labelTp: 'Fri moduls' },
    { num: '24',   labelEn: 'Quiz questions',  labelTp: 'Kwis kwescens' },
    { num: '2',    labelEn: 'Languages',       labelTp: 'Ol tok ples' },
    { num: '100%', labelEn: 'Free forever',    labelTp: 'Fri oltaim' },
  ]

  const badgeCount  = badges.length
  const overallPct  = allModules.length
    ? Math.round((badgeCount / allModules.length) * 100)
    : 0

  return (
    <div style={styles.layout}>
      <Sidebar lang={lang} setLang={setLang} isAdmin={isAdmin} />
      <div style={styles.main}>
        <Topbar title="Home" alertCount={2} />
        <div style={styles.content}>

          {/* ── HERO ── */}
          <div style={styles.heroGrid}>
            <div style={styles.heroLeft}>
              <div style={styles.eyebrow}>
                <span style={styles.eyebrowLine} />
                {lang === 'en' ? 'Papua New Guinea Cybersecurity' : 'PNG Cybersecurity'}
              </div>
              <h1 style={styles.h1}>
                {lang === 'en'
                  ? <> Protect yourself.<br /><strong style={styles.highlight}>Stay safe online.</strong></>
                  : <> Lukautim yu yet.<br /><strong style={styles.highlight}>Stap seif long net.</strong></>}
              </h1>
              <p style={styles.p}>
                {lang === 'en'
                  ? 'Free interactive cybersecurity education built for Papua New Guinea — in English and Tok Pisin.'
                  : 'Fri inraktiv cybersecurity edukesen wokim long Papua Niugini — long Inglis na Tok Pisin.'}
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

          {/* ── BADGE SUMMARY ── */}
          <div style={{ marginBottom: '2rem' }}>
            <BadgeSummary badges={badges} lang={lang} />
          </div>

          {/* ── MY PROGRESS ── */}
          {allModules.length > 0 && (
            <div style={styles.progressSection}>
              <div style={styles.sectionTop}>
                <div>
                  <h2 style={styles.sectionTitle}>
                    {lang === 'en' ? 'My Progress' : 'Progres Bilong Mi'}
                  </h2>
                  <p style={styles.sectionSub}>
                    {lang === 'en'
                      ? `${badgeCount} of ${allModules.length} badges earned`
                      : `${badgeCount} long ${allModules.length} baj yu kisim pinis`}
                  </p>
                </div>
                {/* Overall bar */}
                <div style={styles.overallWrap}>
                  <div style={styles.overallLabel}>{overallPct}% {lang === 'en' ? 'complete' : 'pinis'}</div>
                  <div style={styles.overallTrack}>
                    <div style={{ ...styles.overallFill, width: `${overallPct}%` }} />
                  </div>
                </div>
              </div>

              <div style={styles.progressList}>
                {allModules.map((mod, i) => {
                  const p        = progressMap[mod.id] || {}
                  const read     = p.module_read   || false
                  const passed   = p.quiz_passed   || false
                  const score    = p.quiz_score    ?? null
                  const earned   = p.badge_earned  || false

                  return (
                    <div key={mod.id} style={styles.progressRow}>
                      {/* Icon */}
                      <div style={styles.progIcon}>{MODULE_ICONS[i] || '📘'}</div>

                      {/* Title + bars */}
                      <div style={styles.progMid}>
                        <div style={styles.progTitle}>{mod.title}</div>
                        <div style={styles.progBars}>
                          {/* Read bar */}
                          <div style={styles.progBarWrap}>
                            <span style={styles.progBarLabel}>
                              {lang === 'en' ? 'Read' : 'Ridim'}
                            </span>
                            <div style={styles.barTrack}>
                              <div style={{
                                ...styles.barFill,
                                width: read ? '100%' : '0%',
                                background: read
                                  ? 'linear-gradient(90deg,#0ea5e9,#38bdf8)'
                                  : 'transparent',
                              }} />
                            </div>
                          </div>
                          {/* Quiz bar */}
                          <div style={styles.progBarWrap}>
                            <span style={styles.progBarLabel}>
                              {lang === 'en' ? 'Quiz' : 'Kwis'}
                            </span>
                            <div style={styles.barTrack}>
                              <div style={{
                                ...styles.barFill,
                                width: score !== null ? `${score}%` : '0%',
                                background: passed
                                  ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                                  : score !== null
                                    ? 'linear-gradient(90deg,#f97316,#ea580c)'
                                    : 'transparent',
                              }} />
                            </div>
                            {score !== null && (
                              <span style={{ ...styles.progBarLabel, minWidth: '30px', textAlign: 'right', color: passed ? '#22c55e' : '#f97316' }}>
                                {score}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status pill */}
                      <div style={styles.progRight}>
                        {earned ? (
                          <span style={styles.pillEarned}>🏅 {lang === 'en' ? 'Earned' : 'Kisim'}</span>
                        ) : passed ? (
                          <span style={styles.pillPassed}>✓ {lang === 'en' ? 'Passed' : 'Pas'}</span>
                        ) : read ? (
                          <span style={styles.pillRead}>📖 {lang === 'en' ? 'Read' : 'Ridim'}</span>
                        ) : (
                          <span style={styles.pillNone}>— {lang === 'en' ? 'Not started' : 'No stat yet'}</span>
                        )}
                        <Link to={`/quiz/${mod.id}`} style={styles.progQuizLink}>
                          {lang === 'en' ? 'Quiz →' : 'Kwis →'}
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── LEARNING MODULES PREVIEW ── */}
          <div style={styles.modulesSection}>
            <div style={styles.sectionTop}>
              <div>
                <h2 style={styles.sectionTitle}>{lang === 'en' ? 'Learning Modules' : 'Ol Modul bilong Lainim'}</h2>
                <p style={styles.sectionSub}>{lang === 'en' ? 'Interactive lessons built for PNG' : 'Inraktiv lesens wokim long PNG'}</p>
              </div>
              <Link to="/modules" style={styles.seeAll}>{lang === 'en' ? 'View all →' : 'Lukim olgeta →'}</Link>
            </div>
            <div style={styles.modulesGrid}>
              {previewModules.map((mod, i) => (
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
  layout:     { display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #050d1a 0%, #071524 60%, #050d12 100%)' },
  main:       { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  content:    { padding: '1.5rem 1.25rem', flex: 1 },

  // Hero
  heroGrid:   { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'start', marginBottom: '2rem' },
  heroLeft:   { animation: 'fadeUp 0.6s ease both' },
  eyebrow:    { fontSize: '10px', fontWeight: '700', color: 'rgba(14,165,233,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' },
  eyebrowLine:{ display: 'inline-block', width: '18px', height: '2px', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)', borderRadius: '2px' },
  h1:         { color: '#fff', fontSize: '28px', fontWeight: '800', lineHeight: '1.15', marginBottom: '0.75rem', letterSpacing: '-0.8px' },
  highlight:  { background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' },
  p:          { color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.7', marginBottom: '1.25rem', maxWidth: '380px' },
  btns:       { display: 'flex', gap: '10px', marginBottom: '1.5rem' },
  btnPrimary: { background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 20px rgba(14,165,233,0.35)', transition: 'all 0.25s', animation: 'glowPulse 3s ease-in-out infinite' },
  btnGhost:   { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 22px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.25s' },
  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  statCard:   { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '10px 12px', animation: 'numberPop 0.5s ease both' },
  statNum:    { fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '2px' },
  statLabel:  { fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '500' },
  heroRight:  { animation: 'slideRight 0.6s 0.2s ease both' },

  // Progress section
  progressSection: { marginBottom: '2.5rem', animation: 'fadeUp 0.6s 0.1s ease both' },
  overallWrap:  { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', minWidth: '160px' },
  overallLabel: { fontSize: '11px', color: '#38bdf8', fontWeight: '700' },
  overallTrack: { width: '160px', height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', overflow: 'hidden' },
  overallFill:  { height: '100%', background: 'linear-gradient(90deg,#0ea5e9,#38bdf8)', borderRadius: '6px', transition: 'width 0.6s ease' },

  progressList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  progressRow:  { display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '12px 16px', transition: 'border-color 0.2s' },
  progIcon:     { fontSize: '22px', flexShrink: 0, width: '32px', textAlign: 'center' },
  progMid:      { flex: 1, minWidth: 0 },
  progTitle:    { color: '#fff', fontSize: '13px', fontWeight: '600', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  progBars:     { display: 'flex', flexDirection: 'column', gap: '4px' },
  progBarWrap:  { display: 'flex', alignItems: 'center', gap: '8px' },
  progBarLabel: { fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: '600', textTransform: 'uppercase', minWidth: '28px' },
  barTrack:     { flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' },

  progRight:    { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 },
  pillEarned:   { fontSize: '10px', fontWeight: '700', color: '#38bdf8', background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.2)', padding: '3px 10px', borderRadius: '20px' },
  pillPassed:   { fontSize: '10px', fontWeight: '700', color: '#22c55e', background: 'rgba(34,197,94,0.1)',  border: '1px solid rgba(34,197,94,0.2)',  padding: '3px 10px', borderRadius: '20px' },
  pillRead:     { fontSize: '10px', fontWeight: '700', color: '#94a3b8', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', padding: '3px 10px', borderRadius: '20px' },
  pillNone:     { fontSize: '10px', fontWeight: '500', color: 'rgba(255,255,255,0.2)', padding: '3px 10px' },
  progQuizLink: { fontSize: '10px', color: '#0ea5e9', fontWeight: '600', textDecoration: 'none' },

  // Modules preview
  modulesSection: {},
  sectionTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' },
  sectionTitle: { color: '#fff', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', marginBottom: '2px' },
  sectionSub:   { color: 'rgba(255,255,255,0.3)', fontSize: '12px' },
  seeAll:       { color: '#0ea5e9', fontSize: '12px', fontWeight: '600' },
  modulesGrid:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' },
  modCard:      { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s', animation: 'fadeUp 0.6s ease both', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  modTop:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  modNum:       { fontSize: '30px', fontWeight: '800', color: 'rgba(255,255,255,0.04)', lineHeight: '1' },
  modTitle:     { color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-0.2px' },
  modDesc:      { color: 'rgba(255,255,255,0.35)', fontSize: '12px', lineHeight: '1.6', marginBottom: '1rem' },
  modFooter:    { borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' },
  modLink:      { color: '#0ea5e9', fontSize: '12px', fontWeight: '600' },
}