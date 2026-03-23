import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function AdminDashboard() {
  const [lang, setLang] = useState('en')
  const [modules, setModules] = useState([])
  const [users, setUsers] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newLang, setNewLang] = useState('English')
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { navigate('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
      if (profile?.role !== 'admin') { navigate('/home'); return }
      fetchModules(); fetchUsers()
    }
    init()
  }, [])

  const fetchModules = async () => { const { data } = await supabase.from('modules').select('*'); setModules(data || []) }
  const fetchUsers = async () => { const { data } = await supabase.from('profiles').select('*'); setUsers(data || []) }

  const handleSave = async () => {
    if (!newTitle || !newContent) return
    setLoading(true)
    if (editId) {
      await supabase.from('modules').update({ title: newTitle, content: newContent, language: newLang }).eq('id', editId)
      setEditId(null)
    } else {
      await supabase.from('modules').insert({ title: newTitle, content: newContent, language: newLang })
    }
    setNewTitle(''); setNewContent(''); setNewLang('English')
    setLoading(false); fetchModules()
  }

  const handleEdit = (mod) => { setEditId(mod.id); setNewTitle(mod.title); setNewContent(mod.content); setNewLang(mod.language) }
  const handleDelete = async (id) => { if (!window.confirm('Delete this module?')) return; await supabase.from('modules').delete().eq('id', id); fetchModules() }

  const focusInput = e => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; e.target.style.background = 'rgba(14,165,233,0.04)' }
  const blurInput = e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }

  const stats = [
    { icon: '📚', num: modules.length, label: 'Total modules' },
    { icon: '👥', num: users.length, label: 'Registered users' },
    { icon: '🇵🇬', num: modules.filter(m => m.language === 'Tok Pisin').length, label: 'Tok Pisin' },
    { icon: '🌐', num: modules.filter(m => m.language === 'English').length, label: 'English' },
  ]

  return (
    <div style={styles.layout}>
      <Sidebar lang={lang} setLang={setLang} isAdmin={true} />
      <div style={styles.main}>
        <Topbar title="Admin" alertCount={0} />
        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.eyebrow}><span style={styles.eyebrowLine} /> Content Management</div>
              <h1 style={styles.title}>Admin Dashboard</h1>
              <p style={styles.sub}>Manage modules, users and platform content</p>
            </div>
            <span style={styles.adminPill}>Administrator</span>
          </div>

          <div style={styles.statsGrid}>
            {stats.map((s, i) => (
              <div key={i} style={{ ...styles.statCard, animationDelay: `${i * 0.08}s` }}>
                <div style={{ fontSize: '22px', marginBottom: '8px', animation: 'float 4s ease-in-out infinite' }}>{s.icon}</div>
                <div style={styles.statNum}>{s.num}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>{editId ? '✏️ Edit Module' : '➕ Add New Module'}</h2>
            <div style={styles.formCard}>
              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Module Title</label>
                  <input style={styles.input} placeholder="Enter module title" value={newTitle} onChange={e => setNewTitle(e.target.value)} onFocus={focusInput} onBlur={blurInput} />
                </div>
                <div>
                  <label style={styles.label}>Language</label>
                  <select style={styles.select} value={newLang} onChange={e => setNewLang(e.target.value)}>
                    <option>English</option>
                    <option>Tok Pisin</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={styles.label}>Module Content</label>
                <textarea style={styles.textarea} placeholder="Enter module content..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div style={styles.formActions}>
                <button style={styles.saveBtn} onClick={handleSave} disabled={loading}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  {loading ? 'Saving...' : editId ? 'Update module' : 'Add module'}
                </button>
                {editId && <button style={styles.cancelBtn} onClick={() => { setEditId(null); setNewTitle(''); setNewContent('') }}>Cancel</button>}
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📚 All Modules ({modules.length})</h2>
            {modules.length === 0 ? (
              <p style={styles.emptyState}>No modules yet. Add one above!</p>
            ) : (
              <div style={styles.tableCard}>
                <div style={styles.tableHead}>
                  <span>Title</span>
                  <span>Language</span>
                  <span>Actions</span>
                </div>
                {modules.map((mod, i) => (
                  <div key={mod.id} style={{ ...styles.tableRow, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <span style={styles.rowTitle}>{mod.title}</span>
                    <span style={styles.rowLang}>{mod.language}</span>
                    <div style={styles.rowActions}>
                      <button style={styles.editBtn} onClick={() => handleEdit(mod)}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(mod.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ ...styles.section, paddingBottom: '3rem' }}>
            <h2 style={styles.sectionTitle}>👥 Registered Users ({users.length})</h2>
            <div style={styles.tableCard}>
              <div style={{ ...styles.tableHead, gridTemplateColumns: '1fr 1.5fr 0.5fr' }}>
                <span>Username</span>
                <span>Email</span>
                <span>Role</span>
              </div>
              {users.map((u, i) => (
                <div key={u.id} style={{ ...styles.tableRow, gridTemplateColumns: '1fr 1.5fr 0.5fr', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <span style={styles.rowTitle}>{u.username}</span>
                  <span style={styles.rowLang}>{u.email}</span>
                  <span style={{ ...styles.roleBadge, background: u.role === 'admin' ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.05)', color: u.role === 'admin' ? '#38bdf8' : 'rgba(255,255,255,0.4)', border: u.role === 'admin' ? '1px solid rgba(14,165,233,0.25)' : '1px solid rgba(255,255,255,0.08)' }}>
                    {u.role}
                  </span>
                </div>
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
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', animation: 'fadeUp 0.5s ease both' },
  eyebrow: { fontSize: '10px', fontWeight: '700', color: 'rgba(14,165,233,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '0.5rem' },
  eyebrowLine: { display: 'inline-block', width: '16px', height: '2px', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)', borderRadius: '2px' },
  title: { color: '#fff', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px' },
  sub: { color: 'rgba(255,255,255,0.3)', fontSize: '13px' },
  adminPill: { background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8', fontSize: '11px', fontWeight: '600', padding: '5px 16px', borderRadius: '20px', marginTop: '4px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' },
  statCard: { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1rem 1.25rem', animation: 'numberPop 0.5s ease both' },
  statNum: { fontSize: '26px', fontWeight: '800', background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '2px' },
  statLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: '500' },
  section: { marginBottom: '1.5rem' },
  sectionTitle: { color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '1rem', letterSpacing: '-0.2px' },
  formCard: { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' },
  formRow: { display: 'flex', gap: '12px', alignItems: 'flex-end' },
  label: { display: 'block', fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.35)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' },
  input: { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '13px', color: '#fff', outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit' },
  textarea: { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '13px', color: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'all 0.2s' },
  select: { padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '13px', color: '#fff', outline: 'none', fontFamily: 'inherit', minWidth: '130px' },
  formActions: { display: 'flex', gap: '10px' },
  saveBtn: { background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 4px 16px rgba(14,165,233,0.3)' },
  cancelBtn: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', padding: '11px 22px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' },
  emptyState: { color: 'rgba(255,255,255,0.3)', fontSize: '13px' },
  tableCard: { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' },
  tableHead: { display: 'grid', gridTemplateColumns: '2fr 1fr 130px', background: 'rgba(255,255,255,0.03)', padding: '10px 18px', fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 130px', padding: '12px 18px', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', transition: 'background 0.15s' },
  rowTitle: { fontWeight: '600', color: '#fff' },
  rowLang: { color: 'rgba(255,255,255,0.35)', fontSize: '12px' },
  roleBadge: { fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700', display: 'inline-block', textAlign: 'center' },
  rowActions: { display: 'flex', gap: '6px' },
  editBtn: { fontSize: '11px', padding: '5px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' },
  deleteBtn: { fontSize: '11px', padding: '5px 12px', borderRadius: '7px', border: '1px solid rgba(14,165,233,0.2)', background: 'rgba(14,165,233,0.06)', color: '#38bdf8', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' },
}