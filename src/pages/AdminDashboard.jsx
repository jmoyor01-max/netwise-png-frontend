import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

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
      fetchModules()
      fetchUsers()
    }
    init()
  }, [])

  const fetchModules = async () => {
    const { data } = await supabase.from('modules').select('*')
    setModules(data || [])
  }

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*')
    setUsers(data || [])
  }

  const handleSave = async () => {
    if (!newTitle || !newContent) return
    setLoading(true)
    if (editId) {
      await supabase.from('modules').update({ title: newTitle, content: newContent, language: newLang }).eq('id', editId)
      setEditId(null)
    } else {
      await supabase.from('modules').insert({ title: newTitle, content: newContent, language: newLang })
    }
    setNewTitle('')
    setNewContent('')
    setNewLang('English')
    setLoading(false)
    fetchModules()
  }

  const handleEdit = (mod) => {
    setEditId(mod.id)
    setNewTitle(mod.title)
    setNewContent(mod.content)
    setNewLang(mod.language)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this module?')) return
    await supabase.from('modules').delete().eq('id', id)
    fetchModules()
  }

  const statCards = [
    { num: modules.length, label: 'Total modules', icon: '📚' },
    { num: users.length, label: 'Registered users', icon: '👥' },
    { num: modules.filter(m => m.language === 'Tok Pisin').length, label: 'Tok Pisin modules', icon: '🇵🇬' },
    { num: modules.filter(m => m.language === 'English').length, label: 'English modules', icon: '🌐' },
  ]

  return (
    <div style={styles.page}>
      <Navbar lang={lang} setLang={setLang} isAdmin={true} />

      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <span style={styles.pill}>Administrator</span>
        </div>
      </div>

      <div style={styles.statsGrid}>
        {statCards.map((s, i) => (
          <div key={i} style={{ ...styles.statCard, animationDelay: `${i * 0.1}s` }}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div style={styles.statNum}>{s.num}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>{editId ? '✏️ Edit module' : '➕ Add new module'}</h2>
        <div style={styles.form}>
          <input style={styles.input} placeholder="Module title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <textarea style={styles.textarea} placeholder="Module content" value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} />
          <div style={styles.formRow}>
            <select style={styles.select} value={newLang} onChange={e => setNewLang(e.target.value)}>
              <option>English</option>
              <option>Tok Pisin</option>
            </select>
            <button style={styles.saveBtn} onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : editId ? 'Update module' : 'Add module'}
            </button>
            {editId && <button style={styles.cancelBtn} onClick={() => { setEditId(null); setNewTitle(''); setNewContent('') }}>Cancel</button>}
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📚 All modules ({modules.length})</h2>
        {modules.length === 0 ? (
          <p style={styles.empty}>No modules yet. Add one above!</p>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHead}>
              <span>Title</span>
              <span>Language</span>
              <span>Actions</span>
            </div>
            {modules.map(mod => (
              <div key={mod.id} style={styles.tableRow}>
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

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>👥 Registered users ({users.length})</h2>
        <div style={styles.table}>
          <div style={styles.tableHead}>
            <span>Username</span>
            <span>Email</span>
            <span>Role</span>
          </div>
          {users.map(u => (
            <div key={u.id} style={styles.tableRow}>
              <span style={styles.rowTitle}>{u.username}</span>
              <span style={styles.rowLang}>{u.email}</span>
              <span style={{ ...styles.roleBadge, background: u.role === 'admin' ? 'rgba(226,75,74,0.15)' : 'rgba(255,255,255,0.05)', color: u.role === 'admin' ? '#fca5a5' : 'rgba(255,255,255,0.4)' }}>{u.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { background: '#060a14', minHeight: '100vh' },
  header: { padding: '2rem 2rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  headerContent: { display: 'flex', alignItems: 'center', gap: '1rem', animation: 'fadeUp 0.5s ease both' },
  title: { color: '#fff', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' },
  pill: { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa', fontSize: '11px', padding: '4px 14px', borderRadius: '20px', fontWeight: '700' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '1.5rem 2rem' },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem', animation: 'fadeUp 0.5s ease both' },
  statIcon: { fontSize: '24px', marginBottom: '10px', animation: 'float 4s ease-in-out infinite' },
  statNum: { fontSize: '28px', fontWeight: '800', color: '#E24B4A', marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.35)' },
  section: { padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)' },
  sectionTitle: { color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '1.25rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '700px' },
  formRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  input: { padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', color: '#fff', outline: 'none', fontFamily: 'inherit' },
  textarea: { padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', color: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  select: { padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', color: '#fff', outline: 'none', fontFamily: 'inherit' },
  saveBtn: { background: '#E24B4A', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', animation: 'glowPulse 3s ease-in-out infinite' },
  cancelBtn: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 22px', borderRadius: '8px', fontSize: '13px' },
  empty: { color: 'rgba(255,255,255,0.3)', fontSize: '13px' },
  table: { border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' },
  tableHead: { display: 'grid', gridTemplateColumns: '2fr 1fr 140px', background: 'rgba(255,255,255,0.03)', padding: '10px 16px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 140px', padding: '14px 16px', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', transition: 'background 0.15s' },
  rowTitle: { fontWeight: '600', color: '#fff' },
  rowLang: { color: 'rgba(255,255,255,0.4)', fontSize: '12px' },
  roleBadge: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700', display: 'inline-block' },
  rowActions: { display: 'flex', gap: '8px' },
  editBtn: { fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' },
  deleteBtn: { fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(226,75,74,0.3)', background: 'rgba(226,75,74,0.1)', color: '#fca5a5', cursor: 'pointer' },
}