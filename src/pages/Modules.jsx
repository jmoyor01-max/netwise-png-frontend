import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

export default function Modules() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [lang, setLang] = useState('en')
  const [modules, setModules] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { navigate('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
      if (profile?.role === 'admin') setIsAdmin(true)
      const { data: mods } = await supabase.from('modules').select('*')
      setModules(mods || [])
    }
    init()
  }, [])

  const icons = ['🎣', '🔑', '⚠️', '👥', '🌐', '🔒']

  return (
    <div style={styles.page}>
      <Navbar lang={lang} setLang={setLang} isAdmin={isAdmin} />
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.badge}>
            <div style={styles.badgeDot}></div>
            {lang === 'en' ? 'Free cybersecurity education' : 'Fri cybersecurity edukesen'}
          </div>
          <h1 style={styles.title}>{lang === 'en' ? 'Learning Modules' : 'Ol Modul bilong Lainim'}</h1>
          <p style={styles.sub}>{lang === 'en' ? 'Choose a module below and start learning at your own pace.' : 'Makim wanpela modul na stat lainim.'}</p>
        </div>
      </div>
      {modules.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📚</div>
          <p style={styles.emptyText}>{lang === 'en' ? 'No modules available yet. Check back soon!' : 'Nogat modul yet. Kam bek bihain!'}</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {modules.map((mod, i) => (
            <div key={mod.id} style={{ ...styles.card, animationDelay: `${i * 0.1}s` }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(226,75,74,0.4)'; e.currentTarget.style.background = 'rgba(226,75,74,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
            >
              <div style={styles.cardTop}>
                <div style={{ ...styles.cardIcon, animationDelay: `${i * 0.5}s` }}>{icons[i % icons.length]}</div>
                <div style={styles.cardNum}>0{i + 1}</div>
              </div>
              <div style={styles.cardTitle}>{mod.title}</div>
              <div style={styles.cardContent}>{mod.content?.substring(0, 120)}...</div>
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
  page: { background: '#060a14', minHeight: '100vh' },
  header: { padding: '3rem 2rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  headerContent: { animation: 'fadeUp 0.6s ease both' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.25)', color: '#E24B4A', fontSize: '11px', padding: '5px 14px', borderRadius: '20px', marginBottom: '1rem', fontWeight: '600' },
  badgeDot: { width: '6px', height: '6px', background: '#E24B4A', borderRadius: '50%', animation: 'blink 1.5s ease-in-out infinite' },
  title: { color: '#fff', fontSize: '32px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-1px' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: '14px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', gap: '1rem' },
  emptyIcon: { fontSize: '48px', animation: 'float 3s ease-in-out infinite' },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '2rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.25s', animation: 'fadeUp 0.6s ease both' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  cardIcon: { fontSize: '28px', animation: 'float 4s ease-in-out infinite' },
  cardNum: { fontSize: '32px', fontWeight: '800', color: 'rgba(255,255,255,0.06)', lineHeight: '1' },
  cardTitle: { color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '8px' },
  cardContent: { color: 'rgba(255,255,255,0.4)', fontSize: '12px', lineHeight: '1.7', marginBottom: '1.25rem' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardLang: { fontSize: '11px', background: 'rgba(226,75,74,0.1)', color: '#E24B4A', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' },
  readBtn: { fontSize: '12px', background: '#E24B4A', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontWeight: '600', transition: 'all 0.2s' },
}