import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

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
            <p style={styles.sub}>{lang === 'en' ? 'Choose a module and start learning at your own pace.' : 'Makim wanpela modul na stat lainim.'}</p>
          </div>
          {modules.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: '48px', animation: 'float 3s ease-in-out infinite', marginBottom: '12px' }}>📚</div>
              <div style={styles.emptyTitle}>{lang === 'en' ? 'No modules yet' : 'Nogat modul yet'}</div>
              <div style={styles.emptySub}>{lang === 'en' ? 'Check back soon — content is coming!' : 'Kam bek bihain!'}</div>
            </div>
          ) : (
            <div style={styles.grid}>
              {modules.map((mod, i) => (
                <div key={mod.id} style={{ ...styles.card, animationDelay: `${i * 0.08}s` }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(14,165,233,0.35)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(14,165,233,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)' }}>
                  <div style={styles.cardTop}>
                    <div style={{ fontSize: '28px', animation: `float ${4 + i * 0.5}s ease-in-out infinite` }}>{icons[i % icons.length]}</div>
                    <div style={styles.cardNum}>0{i + 1}</div>
                  </div>
                  <div style={styles.cardTitle}>{mod.title}</div>
                  <div style={styles.cardContent}>{mod.content?.substring(0, 120)}...</div>
                  <div style={styles.cardFooter}>
                    <span style={styles.langTag}>{mod.language}</span>
                    <button style={styles.readBtn}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                      {lang === 'en' ? 'Read →' : 'Ridim →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #050d1a 0%, #071524 60%, #050d12 100%)' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  content: { padding: '1.5rem 1.25rem', flex: 1 },
  header: { marginBottom: '1.5rem', animation: 'fadeUp 0.6s ease both' },
  eyebrow: { fontSize: '10px', fontWeight: '700', color: 'rgba(14,165,233,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' },
  eyebrowLine: { display: 'inline-block', width: '18px', height: '2px', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)', borderRadius: '2px' },
  title: { color: '#fff', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.8px', marginBottom: '6px' },
  sub: { color: 'rgba(255,255,255,0.35)', fontSize: '13px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' },
  emptyTitle: { color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '6px' },
  emptySub: { color: 'rgba(255,255,255,0.3)', fontSize: '13px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  card: { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s', animation: 'fadeUp 0.6s ease both', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  cardNum: { fontSize: '30px', fontWeight: '800', color: 'rgba(255,255,255,0.04)', lineHeight: '1' },
  cardTitle: { color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.2px' },
  cardContent: { color: 'rgba(255,255,255,0.35)', fontSize: '12px', lineHeight: '1.7', marginBottom: '1.25rem' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' },
  langTag: { fontSize: '10px', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' },
  readBtn: { fontSize: '12px', background: 'transparent', color: '#0ea5e9', border: 'none', fontWeight: '700', transition: 'transform 0.2s', cursor: 'pointer' },
}