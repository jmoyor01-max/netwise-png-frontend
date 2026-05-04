import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

const ICONS = ['🎣', '🔑', '⚠️', '👥', '🌐', '🔒']
const COLORS = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#14b8a6', '#ec4899']

export default function Modules() {
  const [isAdmin, setIsAdmin]       = useState(false)
  const [lang, setLang]             = useState('en')
  const [modules, setModules]       = useState([])
  const [sectionCounts, setSectionCounts] = useState({})
  const [progressMap, setProgressMap]     = useState({})
  const navigate = useNavigate()

  useEffect(function() {
    async function init() {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) { navigate('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', auth.user.id).maybeSingle()
      if (profile && profile.role === 'admin') setIsAdmin(true)

      const { data: mods } = await supabase.from('modules').select('*').order('id')
      setModules(mods || [])

      // Section counts per module
      const { data: secs } = await supabase
        .from('module_sections').select('module_id')
      const counts = {}
      ;(secs || []).forEach(function(s) {
        counts[s.module_id] = (counts[s.module_id] || 0) + 1
      })
      setSectionCounts(counts)

      // User progress
      const { data: prog } = await supabase
        .from('progress').select('*').eq('user_id', auth.user.id)
      const map = {}
      ;(prog || []).forEach(function(r) { map[r.module_id] = r })
      setProgressMap(map)
    }
    init()
  }, [])

  return (
    <div style={styles.layout}>
      <Sidebar lang={lang} setLang={setLang} isAdmin={isAdmin} />
      <div style={styles.main}>
        <Topbar title="Modules" alertCount={2} />
        <div style={styles.content}>
          <div style={styles.header}>
            <div style={styles.eyebrow}>
              <span style={styles.eyebrowLine} />
              {lang === 'en' ? 'Free cybersecurity education · PNG' : 'Fri cybersecurity edukesen · PNG'}
            </div>
            <h1 style={styles.title}>{lang === 'en' ? 'Learning Modules' : 'Ol Modul bilong Lainim'}</h1>
            <p style={styles.sub}>{lang === 'en' ? 'Read each module, pass the quiz, and earn your badge.' : 'Ridim wanpela modul, paspas kwis, na kisim baj.'}</p>
          </div>

          {modules.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
              <div style={styles.emptyTitle}>{lang === 'en' ? 'No modules yet' : 'Nogat modul yet'}</div>
            </div>
          ) : (
            <div style={styles.grid}>
              {modules.map(function(mod, i) {
                const prog     = progressMap[mod.id] || {}
                const read     = prog.module_read  || false
                const passed   = prog.quiz_passed  || false
                const earned   = prog.badge_earned || false
                const secCount = sectionCounts[mod.id] || 0
                const estMins  = secCount * 5
                const accentColor = COLORS[i % COLORS.length]

                return (
                  <div
                    key={mod.id}
                    style={{ ...styles.card, animationDelay: (i * 0.08) + 's' }}
                    onMouseEnter={function(e) {
                      e.currentTarget.style.transform   = 'translateY(-6px)'
                      e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)'
                      e.currentTarget.style.boxShadow   = '0 20px 50px rgba(14,165,233,0.1)'
                    }}
                    onMouseLeave={function(e) {
                      e.currentTarget.style.transform   = 'translateY(0)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                      e.currentTarget.style.boxShadow   = '0 8px 32px rgba(0,0,0,0.2)'
                    }}
                  >
                    {/* Accent top bar */}
                    <div style={{ height: '3px', background: accentColor, borderRadius: '18px 18px 0 0', margin: '-1.5rem -1.5rem 1.25rem -1.5rem' }} />

                    <div style={styles.cardTop}>
                      <div style={{ fontSize: '28px' }}>{ICONS[i % ICONS.length]}</div>
                      <div style={styles.cardNum}>0{i + 1}</div>
                    </div>

                    <div style={styles.cardTitle}>{mod.title}</div>
                    <div style={styles.cardDesc}>{mod.content}</div>

                    {/* Stats row */}
                    <div style={styles.cardStats}>
                      {secCount > 0 && (
                        <span style={styles.statPill}>📄 {secCount} sections</span>
                      )}
                      {estMins > 0 && (
                        <span style={styles.statPill}>⏱ ~{estMins} min</span>
                      )}
                      <span style={styles.langPill}>{mod.language}</span>
                    </div>

                    {/* Progress bar */}
                    <div style={styles.progressTrack}>
                      <div style={{
                        ...styles.progressFill,
                        width: earned ? '100%' : passed ? '66%' : read ? '33%' : '0%',
                        background: earned
                          ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                          : 'linear-gradient(90deg,' + accentColor + ',#38bdf8)',
                      }} />
                    </div>

                    <div style={styles.cardFooter}>
                      {/* Status */}
                      <span style={earned
                        ? { ...styles.badge, color: '#4ade80', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }
                        : passed
                          ? { ...styles.badge, color: accentColor, background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }
                          : read
                            ? { ...styles.badge, color: '#94a3b8', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)' }
                            : { ...styles.badge, color: 'rgba(255,255,255,0.2)' }
                      }>
                        {earned ? '🏅 Earned' : passed ? '✓ Passed' : read ? '📖 Read' : '— Not started'}
                      </span>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          style={styles.readBtn}
                          onClick={function() { navigate('/module/' + mod.id) }}
                          onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                          onMouseLeave={function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                        >
                          {read ? '📖 Review' : lang === 'en' ? 'Read →' : 'Ridim →'}
                        </button>
                        <button
                          style={{ ...styles.quizBtn, borderColor: accentColor + '40', color: accentColor }}
                          onClick={function() { navigate('/quiz/' + mod.id) }}
                          onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(14,165,233,0.15)' }}
                          onMouseLeave={function(e) { e.currentTarget.style.background = 'rgba(14,165,233,0.06)' }}
                        >
                          {lang === 'en' ? 'Quiz 🧠' : 'Kwis 🧠'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  layout:      { display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg,#050d1a 0%,#071524 60%,#050d12 100%)' },
  main:        { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  content:     { padding: '1.5rem 1.25rem', flex: 1 },
  header:      { marginBottom: '1.75rem', animation: 'fadeUp 0.6s ease both' },
  eyebrow:     { fontSize: '10px', fontWeight: '700', color: 'rgba(14,165,233,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' },
  eyebrowLine: { display: 'inline-block', width: '18px', height: '2px', background: 'linear-gradient(90deg,#0ea5e9,#38bdf8)', borderRadius: '2px' },
  title:       { color: '#fff', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.8px', marginBottom: '6px' },
  sub:         { color: 'rgba(255,255,255,0.35)', fontSize: '13px' },
  empty:       { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' },
  emptyTitle:  { color: '#fff', fontSize: '18px', fontWeight: '700' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' },
  card:        { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.5rem', transition: 'all 0.3s', animation: 'fadeUp 0.6s ease both', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  cardNum:     { fontSize: '30px', fontWeight: '800', color: 'rgba(255,255,255,0.04)', lineHeight: '1' },
  cardTitle:   { color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.2px' },
  cardDesc:    { color: 'rgba(255,255,255,0.35)', fontSize: '12px', lineHeight: '1.7', marginBottom: '1rem' },
  cardStats:   { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' },
  statPill:    { fontSize: '10px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '3px 9px', borderRadius: '20px' },
  langPill:    { fontSize: '10px', color: '#38bdf8', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', padding: '3px 9px', borderRadius: '20px', fontWeight: '600' },
  progressTrack: { height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1rem' },
  progressFill:  { height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' },
  cardFooter:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' },
  badge:       { fontSize: '10px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },
  readBtn:     { fontSize: '11px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' },
  quizBtn:     { fontSize: '11px', background: 'rgba(14,165,233,0.06)', border: '1px solid', padding: '6px 12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' },
}