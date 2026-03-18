import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

export default function Modules() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [lang, setLang] = useState('en')
  const [modules, setModules] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { navigate('/login'); return }
      setUser(data.user)
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
      if (profile?.role === 'admin') setIsAdmin(true)
      const { data: mods } = await supabase.from('modules').select('*')
      setModules(mods || [])
    }
    init()
  }, [])

  const icons = ['🎣', '🔑', '⚠️', '👥', '🌐', '🔒']

  return (
    <div>
      <Navbar lang={lang} setLang={setLang} isAdmin={isAdmin} />
      <div style={styles.header}>
        <h1 style={styles.title}>{lang === 'en' ? 'Learning Modules' : 'Ol Modul bilong Lainim'}</h1>
        <p style={styles.sub}>{lang === 'en' ? 'Choose a module to start learning' : 'Makim wanpela modul na stat lainim'}</p>
      </div>
      {modules.length === 0 ? (
        <div style={styles.empty}>
          <p>{lang === 'en' ? 'No modules available yet. Check back soon!' : 'Nogat modul yet. Kam bek bihain!'}</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {modules.map((mod, i) => (
            <div key={mod.id} style={styles.card}>
              <div style={styles.cardIcon}>{icons[i % icons.length]}</div>
              <div style={styles.cardNum}>0{i + 1}</div>
              <div style={styles.cardTitle}>{mod.title}</div>
              <div style={styles.cardContent}>{mod.content?.substring(0, 100)}...</div>
              <div style={styles.cardFooter}>
                <span style={styles.cardLang}>{mod.language}</span>
                <button style={styles.readBtn}>{lang === 'en' ? 'Read →' : 'Ridim →'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  header: { background: '#E24B4A', padding: '2rem 1.5rem' },
  title: { color: '#fff', fontSize: '26px', fontWeight: '600', marginBottom: '6px' },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: '13px' },
  empty: { padding: '3rem', textAlign: 'center', color: '#666', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#f0f0f0', borderTop: '1px solid #f0f0f0' },
  card: { background: '#fff', padding: '1.5rem' },
  cardIcon: { fontSize: '28px', marginBottom: '8px' },
  cardNum: { fontSize: '28px', fontWeight: '700', color: '#f0f0f0', marginBottom: '4px' },
  cardTitle: { fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' },
  cardContent: { fontSize: '12px', color: '#666', lineHeight: '1.7', marginBottom: '1rem' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardLang: { fontSize: '11px', background: '#FCEBEB', color: '#A32D2D', padding: '3px 10px', borderRadius: '20px' },
  readBtn: { fontSize: '12px', background: '#E24B4A', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px' },
}