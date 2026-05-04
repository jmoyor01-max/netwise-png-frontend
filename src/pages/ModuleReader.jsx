import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

const CALLOUT = {
  info:    { icon: 'ℹ️', bg: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.25)',  color: '#38bdf8' },
  tip:     { icon: '💡', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   color: '#4ade80' },
  warning: { icon: '⚠️', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)',  color: '#fb923c' },
  danger:  { icon: '🚨', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   color: '#f87171' },
}

export default function ModuleReader() {
  const { moduleId } = useParams()
  const navigate     = useNavigate()
  const parsedId     = parseInt(moduleId)

  const [lang, setLang]         = useState('en')
  const [isAdmin, setIsAdmin]   = useState(false)
  const [mod, setMod]           = useState(null)
  const [sections, setSections] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [viewed, setViewed]     = useState(new Set([0]))
  const [moduleRead, setModuleRead] = useState(false)
  const [quizPassed, setQuizPassed] = useState(false)
  const [user, setUser]         = useState(null)
  const [saving, setSaving]     = useState(false)
  const [loading, setLoading]   = useState(true)

  useEffect(function() {
    async function init() {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) { navigate('/login'); return }
      setUser(auth.user)

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', auth.user.id).maybeSingle()
      if (profile && profile.role === 'admin') setIsAdmin(true)

      const { data: modData } = await supabase
        .from('modules').select('*').eq('id', parsedId).maybeSingle()
      if (!modData) { navigate('/modules'); return }
      setMod(modData)

      const { data: secs } = await supabase
        .from('module_sections').select('*')
        .eq('module_id', parsedId).order('order_index')
      setSections(secs || [])

      const { data: prog } = await supabase
        .from('progress').select('*')
        .eq('user_id', auth.user.id).eq('module_id', parsedId).maybeSingle()
      if (prog) {
        setModuleRead(prog.module_read || false)
        setQuizPassed(prog.quiz_passed || false)
      }

      setLoading(false)
    }
    init()
  }, [parsedId])

  useEffect(function() {
    setViewed(function(prev) {
      const next = new Set(prev)
      next.add(currentIdx)
      return next
    })
  }, [currentIdx])

  const allViewed = sections.length > 0 && viewed.size >= sections.length

  async function handleMarkRead() {
    if (!user) return
    setSaving(true)
    const { data: existing } = await supabase
      .from('progress').select('id')
      .eq('user_id', user.id).eq('module_id', parsedId).maybeSingle()
    if (existing) {
      await supabase.from('progress').update({ module_read: true }).eq('id', existing.id)
    } else {
      await supabase.from('progress').insert({
        user_id: user.id, module_id: parsedId,
        module_read: true, quiz_passed: false, badge_earned: false,
      })
    }
    setModuleRead(true)
    setSaving(false)
  }

  if (loading) return (
    <div style={styles.loadPage}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📖</div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Loading module...</div>
    </div>
  )

  const section  = sections[currentIdx] || {}
  const callout  = section.callout_type ? CALLOUT[section.callout_type] : null
  const progress = sections.length > 0 ? (viewed.size / sections.length) * 100 : 0

  let keyTerms = []
  try { keyTerms = JSON.parse(section.key_terms || '[]') } catch(e) {}

  return (
    <div style={styles.layout}>
      <Sidebar lang={lang} setLang={setLang} isAdmin={isAdmin} />
      <div style={styles.main}>
        <Topbar title={mod ? mod.title : 'Module'} alertCount={2} />
        <div style={styles.body}>

          {/* ── LEFT SECTION NAVIGATOR ── */}
          <div style={styles.nav}>
            <div style={styles.navTop}>
              <div style={styles.navModTitle}>{mod && mod.title}</div>
              <div style={styles.navMeta}>{sections.length} sections</div>
              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressFill, width: progress + '%' }} />
              </div>
              <div style={styles.progressLabel}>{viewed.size} of {sections.length} viewed</div>
            </div>

            <div style={styles.navList}>
              {sections.map(function(sec, i) {
                const isViewed  = viewed.has(i)
                const isCurrent = i === currentIdx
                return (
                  <div
                    key={sec.id}
                    style={isCurrent
                      ? { ...styles.navItem, ...styles.navItemActive }
                      : styles.navItem}
                    onClick={function() { setCurrentIdx(i) }}
                  >
                    <div style={{
                      ...styles.navDot,
                      background: isViewed ? '#22c55e' : isCurrent ? '#0ea5e9' : 'rgba(255,255,255,0.08)',
                      border: '2px solid ' + (isViewed ? '#22c55e' : isCurrent ? '#0ea5e9' : 'rgba(255,255,255,0.12)'),
                    }}>
                      {isViewed ? '✓' : i + 1}
                    </div>
                    <div style={{
                      ...styles.navItemLabel,
                      color: isCurrent ? '#fff' : isViewed ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)',
                    }}>
                      {sec.title}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={styles.navFooter}>
              <div style={moduleRead
                ? { ...styles.statusChip, ...styles.statusDone }
                : styles.statusChip}>
                {moduleRead ? '✓ Module Read' : '○ Not Read Yet'}
              </div>
              <div style={quizPassed
                ? { ...styles.statusChip, ...styles.statusDone }
                : styles.statusChip}>
                {quizPassed ? '✓ Quiz Passed' : '○ Quiz Pending'}
              </div>
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div style={styles.contentScroll}>
            <div style={styles.contentInner}>

              <div style={styles.sectionMeta}>
                {String(currentIdx + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
              </div>
              <h1 style={styles.sectionTitle}>{section.title}</h1>

              <div style={styles.bodyText}>
                {(section.body || '').split('\n\n').map(function(para, i) {
                  return <p key={i} style={styles.para}>{para}</p>
                })}
              </div>

              {callout && section.callout_text && (
                <div style={{
                  ...styles.calloutBox,
                  background: callout.bg,
                  border: '1px solid ' + callout.border,
                }}>
                  <span style={styles.calloutIcon}>{callout.icon}</span>
                  <span style={{ ...styles.calloutText, color: callout.color }}>
                    {section.callout_text}
                  </span>
                </div>
              )}

              {keyTerms.length > 0 && (
                <div style={styles.keyTermsWrap}>
                  <div style={styles.keyTermsHeading}>📖 Key Terms</div>
                  <div style={styles.keyTermsGrid}>
                    {keyTerms.map(function(kt, i) {
                      return (
                        <div key={i} style={styles.keyTermCard}>
                          <div style={styles.termName}>{kt.term}</div>
                          <div style={styles.termDef}>{kt.definition}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Navigation bar */}
              <div style={styles.navBar}>
                <button
                  style={{ ...styles.navBarBtn, opacity: currentIdx === 0 ? 0.35 : 1 }}
                  disabled={currentIdx === 0}
                  onClick={function() { setCurrentIdx(function(i) { return Math.max(0, i - 1) }) }}
                >
                  ← Previous
                </button>

                <div style={styles.navBarCenter}>
                  {allViewed && !moduleRead && (
                    <button style={styles.markReadBtn} onClick={handleMarkRead} disabled={saving}>
                      {saving ? 'Saving...' : '✓ Mark Module as Read'}
                    </button>
                  )}
                  {moduleRead && (
                    <button style={styles.takeQuizBtn} onClick={function() { navigate('/quiz/' + parsedId) }}>
                      Take Quiz →
                    </button>
                  )}
                </div>

                <button
                  style={{ ...styles.navBarBtn, opacity: currentIdx === sections.length - 1 ? 0.35 : 1 }}
                  disabled={currentIdx === sections.length - 1}
                  onClick={function() { setCurrentIdx(function(i) { return Math.min(sections.length - 1, i + 1) }) }}
                >
                  Next →
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

const styles = {
  layout:    { display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg,#050d1a 0%,#071524 60%,#050d12 100%)' },
  main:      { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  loadPage:  { minHeight: '100vh', background: 'linear-gradient(135deg,#050d1a,#071524)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  body:      { flex: 1, display: 'flex', overflow: 'hidden' },

  // Left nav
  nav:           { width: '230px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '1.25rem 0.875rem' },
  navTop:        { marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  navModTitle:   { color: '#fff', fontSize: '12px', fontWeight: '700', lineHeight: '1.4', marginBottom: '4px' },
  navMeta:       { color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '10px' },
  progressTrack: { height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' },
  progressFill:  { height: '100%', background: 'linear-gradient(90deg,#0ea5e9,#38bdf8)', borderRadius: '3px', transition: 'width 0.4s ease' },
  progressLabel: { fontSize: '10px', color: 'rgba(255,255,255,0.25)' },

  navList:       { display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 },
  navItem:       { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '9px 8px', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.2s' },
  navItemActive: { background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.12)' },
  navDot:        { width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '800', flexShrink: 0, color: '#fff', transition: 'all 0.3s' },
  navItemLabel:  { fontSize: '11px', fontWeight: '500', lineHeight: '1.4', transition: 'color 0.2s' },

  navFooter:   { marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '5px' },
  statusChip:  { fontSize: '10px', padding: '5px 10px', borderRadius: '6px', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' },
  statusDone:  { color: '#4ade80', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' },

  // Content
  contentScroll: { flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' },
  contentInner:  { maxWidth: '720px', margin: '0 auto' },

  sectionMeta:  { fontSize: '11px', color: 'rgba(14,165,233,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' },
  sectionTitle: { color: '#fff', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.6px', lineHeight: '1.25', marginBottom: '2rem' },

  bodyText: { marginBottom: '2rem' },
  para:     { color: 'rgba(255,255,255,0.62)', fontSize: '14px', lineHeight: '1.9', marginBottom: '1.25rem' },

  calloutBox:  { display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px 20px', borderRadius: '14px', marginBottom: '2rem' },
  calloutIcon: { fontSize: '20px', flexShrink: 0, marginTop: '1px' },
  calloutText: { fontSize: '13px', lineHeight: '1.7', fontWeight: '500' },

  keyTermsWrap:    { marginBottom: '2rem' },
  keyTermsHeading: { color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' },
  keyTermsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' },
  keyTermCard:     { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '12px 14px' },
  termName:        { color: '#38bdf8', fontSize: '12px', fontWeight: '700', marginBottom: '4px' },
  termDef:         { color: 'rgba(255,255,255,0.4)', fontSize: '11px', lineHeight: '1.6' },

  navBar:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '2rem' },
  navBarCenter:  { display: 'flex', gap: '10px' },
  navBarBtn:     { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' },
  markReadBtn:   { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)', padding: '10px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  takeQuizBtn:   { background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(14,165,233,0.35)' },
}