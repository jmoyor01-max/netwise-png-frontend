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
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
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
    await supabase.from('modules').delete().eq('id', id)
    fetchModules()
  }

  return (
    <div>
      <Navbar lang={lang} setLang={setLang} isAdmin={true} />
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <span style={styles.pill}>Administrator</span>
      </div>
      <div style={styles.statsRow}>
        {[
          { num: modules.length, label: 'Total modules' },
          { num: users.length, label: 'Registered users' },
          { num: modules.filter(m => m.language === 'Tok Pisin').length, label: 'Tok Pisin modules' },
          { num: modules.filter(m => m.language === 'English').length, label: 'English modules' },
        ].map((s, i) => (
          <div key={i} style={styles.statCard}>
            <div style={styles.statNum}>{s.num}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>{editId ? 'Edit module' : 'Add new module'}</h2>
        <input style={styles.input} placeholder="Module title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
        <textarea style={styles.textarea} placeholder="Module content" value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} />
        <select style={styles.select} value={newLang} onChange={e => setNewLang(e.target.value)}>
          <option>English</option>
          <option>Tok Pisin</option>
        </select>
        <button style={styles.saveBtn} onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : editId ? 'Update module' : 'Add module'}
        </button>
        {editId && <button style={styles.cancelBtn} onClick={() => { setEditId(null); setNewTitle(''); setNewContent('') }}>Cancel</button>}
      </div>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>All modules</h2>
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
        <h2 style={styles.sectionTitle}>Registered users ({users.length})</h2>
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
              <span style={{ ...styles.rowLang, color: u.role === 'admin' ? '#A32D2D' : '#185FA5' }}>{u.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  header: { background: '#2C2C2A', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: '18px', fontWeight: '600' },
  pill: { background: '#3C3489', color: '#CECBF6', fontSize: '11px', padding: '4px 12px', borderRadius: '20px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '1.25rem 1.5rem' },
  statCard: { background: '#f5f5f5', borderRadius: '8px', padding: '1rem' },
  statNum: { fontSize: '24px', fontWeight: '700', color: '#1a1a1a' },
  statLabel: { fontSize: '12px', color: '#666', marginTop: '4px' },
  section: { padding: '1.25rem 1.5rem', borderTop: '0.5px solid #f0f0f0' },
  sectionTitle: { fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: '1rem' },
  input: { width: '100%', padding: '10px 12px', border: '0.5px solid #ddd', borderRadius: '6px', fontSize: '14px', marginBottom: '10px', outline: 'none', display: 'block' },
  textarea: { width: '100%', padding: '10px 12px', border: '0.5px solid #ddd', borderRadius: '6px', fontSize: '14px', marginBottom: '10px', outline: 'none', resize: 'vertical', display: 'block', fontFamily: 'inherit' },
  select: { padding: '10px 12px', border: '0.5px solid #ddd', borderRadius: '6px', fontSize: '14px', marginBottom: '10px', outline: 'none', marginRight: '10px' },
  saveBtn: { background: '#E24B4A', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', marginRight: '8px' },
  cancelBtn: { background: '#f0f0f0', color: '#666', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px' },
  empty: { color: '#999', fontSize: '13px' },
  table: { border: '0.5px solid #f0f0f0', borderRadius: '8px', overflow: 'hidden' },
  tableHead: { display: 'grid', gridTemplateColumns: '2fr 1fr 120px', background: '#f5f5f5', padding: '8px 12px', fontSize: '12px', color: '#666', borderBottom: '0.5px solid #f0f0f0' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 120px', padding: '10px 12px', fontSize: '13px', borderBottom: '0.5px solid #f0f0f0', alignItems: 'center' },
  rowTitle: { fontWeight: '500', color: '#1a1a1a' },
  rowLang: { color: '#666', fontSize: '12px' },
  rowActions: { display: 'flex', gap: '6px' },
  editBtn: { fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '0.5px solid #ddd', background: '#fff', color: '#444', cursor: 'pointer' },
  deleteBtn: { fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '0.5px solid #F7C1C1', background: '#FCEBEB', color: '#A32D2D', cursor: 'pointer' },
}