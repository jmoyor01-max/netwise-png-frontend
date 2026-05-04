import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [lang, setLang]           = useState('en')
  const [modules, setModules]     = useState([])
  const [sections, setSections]   = useState([])
  const [users, setUsers]         = useState([])
  const [quizCount, setQuizCount] = useState(0)
  const [badgeCount, setBadgeCount] = useState(0)
  const [selectedMod, setSelectedMod] = useState(null)
  const [tab, setTab]             = useState('modules')  // 'modules' | 'sections' | 'users'
  const [form, setForm]           = useState(null)       // null | 'addSection' | 'editSection'
  const [formData, setFormData]   = useState({})
  const [saving, setSaving]       = useState(false)

  useEffect(function() {
    async function init() {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) { navigate('/login'); return }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', auth.user.id).maybeSingle()
      if (!profile || profile.role !== 'admin') { navigate('/home'); return }
      await loadAll()
    }
    init()
  }, [])

  async function loadAll() {
    const { data: mods }  = await supabase.from('modules').select('*').order('id')
    const { data: secs }  = await supabase.from('module_sections').select('*').order('order_index')
    const { data: profs } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    const { data: prog }  = await supabase.from('progress').select('module_id, quiz_passed, badge_earned')
    const { data: quizzes } = await supabase.from('quizzes').select('id')
    setModules(mods || [])
    setSections(secs || [])
    setUsers(profs || [])
    setQuizCount((quizzes || []).length)
    setBadgeCount((prog || []).filter(function(p) { return p.badge_earned }).length)
  }

  function sectionsForMod(modId) {
    return sections.filter(function(s) { return s.module_id === modId })
      .sort(function(a, b) { return a.order_index - b.order_index })
  }

  function openAddSection(mod) {
    setSelectedMod(mod)
    setFormData({ module_id: mod.id, order_index: sectionsForMod(mod.id).length + 1, title: '', body: '', callout_type: '', callout_text: '', key_terms: '[]' })
    setForm('addSection')
  }

  function openEditSection(sec) {
    setFormData({ ...sec, key_terms: typeof sec.key_terms === 'string' ? sec.key_terms : JSON.stringify(sec.key_terms) })
    setForm('editSection')
  }

  async function saveSection() {
    setSaving(true)
    let payload = {
      module_id:    formData.module_id,
      order_index:  parseInt(formData.order_index) || 1,
      title:        formData.title,
      body:         formData.body,
      callout_type: formData.callout_type || null,
      callout_text: formData.callout_text || null,
      key_terms:    JSON.parse(formData.key_terms || '[]'),
    }
    if (form === 'editSection') {
      await supabase.from('module_sections').update(payload).eq('id', formData.id)
    } else {
      await supabase.from('module_sections').insert(payload)
    }
    await loadAll()
    setSaving(false)
    setForm(null)
  }

  async function deleteSection(id) {
    if (!window.confirm('Delete this section?')) return
    await supabase.from('module_sections').delete().eq('id', id)
    await loadAll()
  }

  async function deleteModule(id) {
    if (!window.confirm('Delete this module and all its sections and quizzes?')) return
    await supabase.from('modules').delete().eq('id', id)
    await loadAll()
  }

  const stats = [
    { label: 'Total Users',   value: users.length,  color: '#0ea5e9' },
    { label: 'Modules',       value: modules.length, color: '#22c55e' },
    { label: 'Quiz Questions', value: quizCount,     color: '#f97316' },
    { label: 'Badges Awarded', value: badgeCount,    color: '#a855f7' },
  ]

  return (
    <div style={styles.layout}>
      <Sidebar lang={lang} setLang={setLang} isAdmin={true} />
      <div style={styles.main}>
        <Topbar title="Admin Dashboard" alertCount={0} />
        <div style={styles.content}>

          {/* Admin badge */}
          <div style={styles.adminBadge}>🔐 Administrator Mode</div>

          {/* Stats row */}
          <div style={styles.statsRow}>
            {stats.map(function(s, i) {
              return (
                <div key={i} style={styles.statCard}>
                  <div style={{ ...styles.statVal, color: s.color }}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              )
            })}
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            {['modules', 'sections', 'users'].map(function(t) {
              return (
                <button
                  key={t}
                  style={tab === t ? { ...styles.tab, ...styles.tabActive } : styles.tab}
                  onClick={function() { setTab(t) }}
                >
                  {t === 'modules' ? '📚 Modules' : t === 'sections' ? '📄 Sections' : '👥 Users'}
                </button>
              )
            })}
          </div>

          {/* ── MODULES TAB ── */}
          {tab === 'modules' && (
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div style={styles.panelTitle}>Manage Modules</div>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['ID', 'Title', 'Content Preview', 'Sections', 'Actions'].map(function(h) {
                      return <th key={h} style={styles.th}>{h}</th>
                    })}
                  </tr>
                </thead>
                <tbody>
                  {modules.map(function(mod, i) {
                    return (
                      <tr key={mod.id} style={i % 2 === 0 ? styles.tr : { ...styles.tr, background: 'rgba(255,255,255,0.02)' }}>
                        <td style={styles.td}>{mod.id}</td>
                        <td style={{ ...styles.td, fontWeight: '600', color: '#fff' }}>{mod.title}</td>
                        <td style={{ ...styles.td, color: 'rgba(255,255,255,0.35)', maxWidth: '280px' }}>{(mod.content || '').substring(0, 80)}...</td>
                        <td style={styles.td}>{sectionsForMod(mod.id).length}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button style={styles.btnBlue} onClick={function() { setSelectedMod(mod); setTab('sections') }}>Sections</button>
                            <button style={styles.btnRed} onClick={function() { deleteModule(mod.id) }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── SECTIONS TAB ── */}
          {tab === 'sections' && (
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>
                    {selectedMod ? 'Sections — ' + selectedMod.title : 'Select a module to manage sections'}
                  </div>
                  {!selectedMod && (
                    <div style={styles.panelSub}>Go to the Modules tab and click "Sections" on a module.</div>
                  )}
                </div>
                {selectedMod && (
                  <button style={styles.btnGreen} onClick={function() { openAddSection(selectedMod) }}>
                    + Add Section
                  </button>
                )}
              </div>

              {/* Module selector */}
              <div style={styles.modSelector}>
                {modules.map(function(mod) {
                  return (
                    <button
                      key={mod.id}
                      style={selectedMod && selectedMod.id === mod.id
                        ? { ...styles.modChip, ...styles.modChipActive }
                        : styles.modChip}
                      onClick={function() { setSelectedMod(mod) }}
                    >
                      {mod.title}
                    </button>
                  )
                })}
              </div>

              {selectedMod && sectionsForMod(selectedMod.id).map(function(sec, i) {
                return (
                  <div key={sec.id} style={styles.sectionRow}>
                    <div style={styles.secOrder}>{sec.order_index}</div>
                    <div style={styles.secBody}>
                      <div style={styles.secTitle}>{sec.title}</div>
                      <div style={styles.secPreview}>{sec.body.substring(0, 120)}...</div>
                      {sec.callout_type && (
                        <div style={styles.secCallout}>
                          {sec.callout_type.toUpperCase()}: {(sec.callout_text || '').substring(0, 80)}...
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button style={styles.btnBlue} onClick={function() { openEditSection(sec) }}>Edit</button>
                      <button style={styles.btnRed} onClick={function() { deleteSection(sec.id) }}>Delete</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── USERS TAB ── */}
          {tab === 'users' && (
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div style={styles.panelTitle}>User Accounts ({users.length})</div>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Email', 'Name', 'Role', 'Joined'].map(function(h) {
                      return <th key={h} style={styles.th}>{h}</th>
                    })}
                  </tr>
                </thead>
                <tbody>
                  {users.map(function(u, i) {
                    return (
                      <tr key={u.id} style={i % 2 === 0 ? styles.tr : { ...styles.tr, background: 'rgba(255,255,255,0.02)' }}>
                        <td style={{ ...styles.td, color: '#38bdf8' }}>{u.email}</td>
                        <td style={{ ...styles.td, color: '#fff' }}>{u.full_name || '—'}</td>
                        <td style={styles.td}>
                          <span style={u.role === 'admin'
                            ? { ...styles.rolePill, background: 'rgba(249,115,22,0.12)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.25)' }
                            : styles.rolePill}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td style={styles.td}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* ── SECTION FORM MODAL ── */}
      {form && (
        <div style={styles.modalOverlay} onClick={function(e) { if (e.target === e.currentTarget) setForm(null) }}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>
              {form === 'addSection' ? 'Add Section' : 'Edit Section'}
            </div>

            {[
              { key: 'title', label: 'Section Title', type: 'input' },
              { key: 'order_index', label: 'Order Index', type: 'input' },
              { key: 'body', label: 'Body Content (separate paragraphs with a blank line)', type: 'textarea', rows: 8 },
              { key: 'callout_type', label: 'Callout Type (info / tip / warning / danger)', type: 'input' },
              { key: 'callout_text', label: 'Callout Text', type: 'textarea', rows: 2 },
              { key: 'key_terms', label: 'Key Terms (JSON array)', type: 'textarea', rows: 3 },
            ].map(function(field) {
              return (
                <div key={field.key} style={styles.formGroup}>
                  <label style={styles.formLabel}>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      style={{ ...styles.formInput, height: (field.rows * 22) + 'px' }}
                      value={formData[field.key] || ''}
                      onChange={function(e) { setFormData(function(prev) { const n = { ...prev }; n[field.key] = e.target.value; return n }) }}
                    />
                  ) : (
                    <input
                      style={styles.formInput}
                      value={formData[field.key] || ''}
                      onChange={function(e) { setFormData(function(prev) { const n = { ...prev }; n[field.key] = e.target.value; return n }) }}
                    />
                  )}
                </div>
              )
            })}

            <div style={styles.formBtns}>
              <button style={styles.btnGreen} onClick={saveSection} disabled={saving}>
                {saving ? 'Saving...' : 'Save Section'}
              </button>
              <button style={styles.btnGhost} onClick={function() { setForm(null) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

const styles = {
  layout:   { display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg,#050d1a 0%,#071524 60%,#050d12 100%)' },
  main:     { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  content:  { padding: '1.25rem 1.25rem', flex: 1 },

  adminBadge: { display: 'inline-block', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#fb923c', fontSize: '11px', fontWeight: '700', padding: '4px 14px', borderRadius: '20px', marginBottom: '1rem' },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' },
  statCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px', textAlign: 'center' },
  statVal:  { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
  statLabel:{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: '500' },

  tabs:     { display: 'flex', gap: '6px', marginBottom: '1.25rem' },
  tab:      { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', padding: '8px 18px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  tabActive:{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', color: '#38bdf8' },

  panel:       { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  panelTitle:  { color: '#fff', fontSize: '14px', fontWeight: '700' },
  panelSub:    { color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '4px' },

  table: { width: '100%', borderCollapse: 'collapse' },
  th:    { color: '#38bdf8', fontSize: '11px', fontWeight: '700', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  tr:    { transition: 'background 0.2s' },
  td:    { fontSize: '12px', color: 'rgba(255,255,255,0.55)', padding: '11px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' },

  modSelector: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' },
  modChip:     { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  modChipActive:{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', color: '#38bdf8' },

  sectionRow:  { display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', marginBottom: '8px' },
  secOrder:    { width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.25)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', flexShrink: 0 },
  secBody:     { flex: 1, minWidth: 0 },
  secTitle:    { color: '#fff', fontSize: '13px', fontWeight: '700', marginBottom: '4px' },
  secPreview:  { color: 'rgba(255,255,255,0.35)', fontSize: '11px', lineHeight: '1.5', marginBottom: '4px' },
  secCallout:  { fontSize: '10px', color: '#fb923c', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)', padding: '3px 10px', borderRadius: '6px', display: 'inline-block' },

  rolePill: { fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' },

  btnBlue:  { background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.25)', padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  btnGreen: { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  btnRed:   { background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' },
  modal:        { background: '#0c1a2e', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle:   { color: '#fff', fontSize: '18px', fontWeight: '800', marginBottom: '1.5rem' },
  formGroup:    { marginBottom: '1rem' },
  formLabel:    { display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
  formInput:    { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none' },
  formBtns:     { display: 'flex', gap: '10px', marginTop: '1.5rem' },
}