import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

const ALL_BADGES = [
  { id: 1, icon: '🎣', nameEn: 'Phishing Pro', nameTp: 'Phishing Pro', descEn: 'Read the phishing module AND pass its quiz', descTp: 'Ridim phishing modul na pasim kwis', color: 'rgba(226,75,74,0.15)', border: 'rgba(226,75,74,0.3)', glow: 'rgba(226,75,74,0.2)' },
  { id: 2, icon: '🔑', nameEn: 'Password Guard', nameTp: 'Password Gad', descEn: 'Read the password module AND pass its quiz', descTp: 'Ridim password modul na pasim kwis', color: 'rgba(14,165,233,0.15)', border: 'rgba(14,165,233,0.3)', glow: 'rgba(14,165,233,0.2)' },
  { id: 3, icon: '⚠️', nameEn: 'Scam Spotter', nameTp: 'Skam Spotter', descEn: 'Read the PNG scams module AND pass its quiz', descTp: 'Ridim skam modul na pasim kwis', color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.2)' },
  { id: 4, icon: '👥', nameEn: 'Social Shield', nameTp: 'Sosol Sild', descEn: 'Read the social engineering module AND pass its quiz', descTp: 'Ridim sosol modul na pasim kwis', color: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', glow: 'rgba(139,92,246,0.2)' },
  { id: 5, icon: '🌐', nameEn: 'Safe Surfer', nameTp: 'Seif Sefa', descEn: 'Read the safe browsing module AND pass its quiz', descTp: 'Ridim brausing modul na pasim kwis', color: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', glow: 'rgba(16,185,129,0.2)' },
  { id: 6, icon: '🔒', nameEn: 'Privacy Expert', nameTp: 'Praivasi Expa', descEn: 'Read the privacy module AND pass its quiz', descTp: 'Ridim praivasi modul na pasim kwis', color: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.3)', glow: 'rgba(236,72,153,0.2)' },
]

export default function Badges() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [lang, setLang] = useState('en')
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { navigate('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
      if (profile?.role === 'admin') setIsAdmin(true)
      const { data: progress } = await supabase.from('progress').select('*').eq('user_id', data.user.id).eq('badge_earned', true)
      setBadges(progress || [])
      setLoading(false)
    }
    init()
  }, [])

  const earnedIds = badges.map(b => b.badge_id)
  const earned = ALL_BADGES.filter(b => earnedIds.includes(b.id))
  const locked = ALL_BADGES.filter(b => !earnedIds.includes(b.id))

  return (
    <div style={styles.layout}>
      <Sidebar lang={lang} setLang={setLang} isAdmin={isAdmin} />
      <div style={styles.main}>
        <Topbar title="Badges" alertCount={0} />
        <div style={styles.content}>
          <div style={styles.header}>
            <div style={styles.eyebrow}><span style={styles.eyebrowLine} />{lang === 'en' ? 'Your achievements' : 'Ol acivement bilong yu'}</div>
            <h1 style={styles.title}>{lang === 'en' ? 'Badges' : 'Ol Baj'}</h1>
            <p style={styles.sub}>{lang === 'en' ? 'Earn badges by reading modules and passing quizzes' : 'Kisim baj long ridim moduls na pasim kwis'}</p>
          </div>

          <div style={styles.progressCard}>
            <div style={styles.progressHeader}>
              <span style={styles.progressLabel}>{lang === 'en' ? 'Overall progress' : 'Olgeta progress'}</span>
              <span style={styles.progressCount}>{earned.length} / {ALL_BADGES.length} {lang === 'en' ? 'badges earned' : 'baj kisim'}</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${(earned.length / ALL_BADGES.length) * 100}%` }} />
            </div>
            <div style={styles.progressTip}>
              {earned.length === ALL_BADGES.length
                ? (lang === 'en' ? '🎉 You have earned all badges! Congratulations!' : '🎉 Yu kisim olgeta baj! Gutpela tru!')
                : (lang === 'en' ? `Complete ${ALL_BADGES.length - earned.length} more module(s) and quiz(zes) to earn all badges` : `Pinisim ${ALL_BADGES.length - earned.length} moa modul na kwis long kisim olgeta baj`)}
            </div>
          </div>

          {earned.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>🏆 {lang === 'en' ? `Earned badges (${earned.length})` : `Ol baj yu kisim (${earned.length})`}</h2>
              <div style={styles.badgesGrid}>
                {earned.map(b => (
                  <div key={b.id} style={{ ...styles.badgeCard, background: b.color, border: `1px solid ${b.border}`, boxShadow: `0 8px 32px ${b.glow}` }}>
                    <div style={styles.badgeIconWrap}>
                      <span style={styles.badgeIcon}>{b.icon}</span>
                      <div style={styles.earnedCheck}>✓</div>
                    </div>
                    <div style={styles.badgeName}>{lang === 'en' ? b.nameEn : b.nameTp}</div>
                    <div style={styles.badgeDesc}>{lang === 'en' ? b.descEn : b.descTp}</div>
                    <div style={styles.earnedPill}>{lang === 'en' ? 'Earned' : 'Kisim'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>🔒 {lang === 'en' ? `Locked badges (${locked.length})` : `Ol baj lok (${locked.length})`}</h2>
            <div style={styles.badgesGrid}>
              {locked.map(b => (
                <div key={b.id} style={styles.badgeCardLocked}>
                  <div style={styles.badgeIconWrap}>
                    <span style={{ ...styles.badgeIcon, filter: 'grayscale(100%)', opacity: 0.3 }}>{b.icon}</span>
                  </div>
                  <div style={styles.badgeNameLocked}>{lang === 'en' ? b.nameEn : b.nameTp}</div>
                  <div style={styles.badgeDescLocked}>{lang === 'en' ? b.descEn : b.descTp}</div>
                  <div style={styles.lockedPill}>🔒 {lang === 'en' ? 'Locked' : 'Lok'}</div>
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
  header: { marginBottom: '1.5rem', animation: 'fadeUp 0.6s ease both' },
  eyebrow: { fontSize: '10px', fontWeight: '700', color: 'rgba(14,165,233,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' },
  eyebrowLine: { display: 'inline-block', width: '18px', height: '2px', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)', borderRadius: '2px' },
  title: { color: '#fff', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.8px', marginBottom: '6px' },
  sub: { color: 'rgba(255,255,255,0.35)', fontSize: '13px' },
  progressCard: { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', animation: 'fadeUp 0.5s 0.1s ease both' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  progressLabel: { color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600' },
  progressCount: { background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8', fontSize: '11px', fontWeight: '700', padding: '3px 12px', borderRadius: '20px' },
  progressBar: { height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)', borderRadius: '8px', transition: 'width 1s ease' },
  progressTip: { color: 'rgba(255,255,255,0.35)', fontSize: '12px' },
  section: { marginBottom: '1.5rem' },
  sectionTitle: { color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '1rem' },
  badgesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' },
  badgeCard: { borderRadius: '18px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.3s', animation: 'fadeUp 0.5s ease both', position: 'relative' },
  badgeCardLocked: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', animation: 'fadeUp 0.5s ease both' },
  badgeIconWrap: { position: 'relative', marginBottom: '4px' },
  badgeIcon: { fontSize: '40px', animation: 'float 4s ease-in-out infinite', display: 'block' },
  earnedCheck: { position: 'absolute', top: '-4px', right: '-8px', background: '#0ea5e9', color: '#fff', fontSize: '10px', fontWeight: '800', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badgeName: { color: '#fff', fontSize: '14px', fontWeight: '800', textAlign: 'center', letterSpacing: '-0.2px' },
  badgeNameLocked: { color: 'rgba(255,255,255,0.2)', fontSize: '14px', fontWeight: '700', textAlign: 'center' },
  badgeDesc: { color: 'rgba(255,255,255,0.5)', fontSize: '11px', textAlign: 'center', lineHeight: '1.5' },
  badgeDescLocked: { color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', lineHeight: '1.5' },
  earnedPill: { background: 'rgba(14,165,233,0.2)', border: '1px solid rgba(14,165,233,0.3)', color: '#38bdf8', fontSize: '11px', fontWeight: '700', padding: '3px 14px', borderRadius: '20px', marginTop: '4px' },
  lockedPill: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: '600', padding: '3px 14px', borderRadius: '20px', marginTop: '4px' },
}