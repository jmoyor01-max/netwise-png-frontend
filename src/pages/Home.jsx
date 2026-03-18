import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'
import ScamAlert from '../components/ScamAlert'

export default function Home() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [lang, setLang] = useState('en')
  const navigate = useNavigate()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { navigate('/login'); return }
      setUser(data.user)
      const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', data.user.id)
  .maybeSingle()
console.log('Profile role:', profile?.role)
if (profile?.role === 'admin') setIsAdmin(true)
    }
    getUser()
  }, [])

  const modules = [
    { num: '01', title: lang === 'en' ? 'What is phishing?' : 'Wanem phishing?', desc: lang === 'en' ? 'Learn how attackers trick you into giving up your information.' : 'Lainim olsem ol attackers i giamanim yu long givim infomesen.' },
    { num: '02', title: lang === 'en' ? 'Password hygiene' : 'Lukautim password', desc: lang === 'en' ? 'Create strong passwords and keep your accounts secure.' : 'Mekim strong passwords na lukautim ol akaunts bilong yu.' },
    { num: '03', title: lang === 'en' ? 'PNG online scams' : 'Ol scam long PNG', desc: lang === 'en' ? 'Real scam examples reported in Papua New Guinea.' : 'Ol tru skam eksampel long Papua Niugini.' },
  ]

  return (
    <div>
      <Navbar lang={lang} setLang={setLang} isAdmin={isAdmin} />
      <div style={styles.hero}>
        <div style={styles.heroLeft}>
          <h1 style={styles.heroTitle}>
            {lang === 'en' ? 'Know the threats.\nStay safe online.' : 'Save long ol trabol.\nStap seif long internet.'}
          </h1>
          <p style={styles.heroSub}>
            {lang === 'en'
              ? 'Cybersecurity awareness for every Papua New Guinean — free, simple, and built locally.'
              : 'Cybersecurity save bilong olgeta Papua Niugini — fri, isi, na wokim hia.'}
          </p>
          <Link to="/modules">
            <button style={styles.heroBtn}>
              {lang === 'en' ? 'Start for free' : 'Stat nau fri'}
            </button>
          </Link>
        </div>
        <div style={styles.heroRight}>
          <ScamAlert lang={lang} />
        </div>
      </div>

      <div style={styles.modules}>
        {modules.map((mod) => (
          <div key={mod.num} style={styles.modCard}>
            <div style={styles.modNum}>{mod.num}</div>
            <div style={styles.modTitle}>{mod.title}</div>
            <div style={styles.modDesc}>{mod.desc}</div>
            <Link to="/modules" style={styles.modLink}>
              {lang === 'en' ? 'Read module →' : 'Ridim modul →'}
            </Link>
          </div>
        ))}
      </div>

      <div style={styles.stats}>
        {[
          { num: '6', label: lang === 'en' ? 'Free modules' : 'Fri moduls' },
          { num: '24', label: lang === 'en' ? 'Quiz questions' : 'Kwis kwescens' },
          { num: '2', label: lang === 'en' ? 'Languages' : 'Ol tok ples' },
          { num: 'Free', label: lang === 'en' ? 'Always' : 'Oltaim' },
        ].map((s, i) => (
          <div key={i} style={styles.stat}>
            <div style={styles.statNum}>{s.num}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  hero: { display: 'grid', gridTemplateColumns: '1fr 1fr' },
  heroLeft: { background: '#E24B4A', padding: '2rem 1.5rem' },
  heroTitle: { color: '#fff', fontSize: '28px', fontWeight: '600', lineHeight: '1.25', marginBottom: '0.75rem', whiteSpace: 'pre-line' },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: '1.7', marginBottom: '1.25rem', maxWidth: '360px' },
  heroBtn: { background: '#fff', color: '#E24B4A', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' },
  heroRight: { background: '#fff', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px', borderBottom: '0.5px solid #f0f0f0' },
  modules: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '0.5px solid #f0f0f0' },
  modCard: { padding: '1.25rem', borderRight: '0.5px solid #f0f0f0' },
  modNum: { fontSize: '28px', fontWeight: '600', color: '#f0f0f0', marginBottom: '4px' },
  modTitle: { fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px' },
  modDesc: { fontSize: '11px', color: '#666', lineHeight: '1.6' },
  modLink: { fontSize: '11px', color: '#E24B4A', marginTop: '8px', display: 'block' },
  stats: { display: 'flex', background: '#2C2C2A' },
  stat: { flex: 1, padding: '1rem 1.25rem', borderRight: '1px solid #3a3a38' },
  statNum: { fontSize: '22px', fontWeight: '600', color: '#fff' },
  statLabel: { fontSize: '11px', color: '#888780', marginTop: '2px' },
}