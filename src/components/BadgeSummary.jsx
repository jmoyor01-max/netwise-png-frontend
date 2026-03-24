export default function BadgeSummary({ badges, lang }) {
  const allBadges = [
    { id: 1, icon: '🎣', nameEn: 'Phishing Pro', nameTp: 'Phishing Pro', descEn: 'Completed phishing module', descTp: 'Pinisim phishing modul' },
    { id: 2, icon: '🔑', nameEn: 'Password Guard', nameTp: 'Password Gad', descEn: 'Completed password module', descTp: 'Pinisim password modul' },
    { id: 3, icon: '⚠️', nameEn: 'Scam Spotter', nameTp: 'Skam Spotter', descEn: 'Completed PNG scams module', descTp: 'Pinisim skam modul' },
    { id: 4, icon: '👥', nameEn: 'Social Shield', nameTp: 'Sosol Sild', descEn: 'Completed social engineering module', descTp: 'Pinisim sosol modul' },
    { id: 5, icon: '🌐', nameEn: 'Safe Surfer', nameTp: 'Seif Sefa', descEn: 'Completed safe browsing module', descTp: 'Pinisim brausing modul' },
    { id: 6, icon: '🔒', nameEn: 'Privacy Expert', nameTp: 'Praivasi Expa', descEn: 'Completed privacy module', descTp: 'Pinisim praivasi modul' },
  ]

  const earnedIds = badges.map(b => b.badge_id)

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.title}>{lang === 'en' ? 'Your badges' : 'Ol baj bilong yu'}</div>
        <div style={styles.count}>{earnedIds.length}/{allBadges.length} {lang === 'en' ? 'earned' : 'kisim'}</div>
      </div>
      <div style={styles.grid}>
        {allBadges.map(b => {
          const earned = earnedIds.includes(b.id)
          return (
            <div key={b.id} style={{ ...styles.badge, ...(earned ? styles.badgeEarned : styles.badgeLocked) }}
              title={lang === 'en' ? b.descEn : b.descTp}>
              <div style={{ ...styles.badgeIcon, ...(earned ? {} : styles.badgeIconLocked) }}>{b.icon}</div>
              <div style={{ ...styles.badgeName, color: earned ? '#fff' : 'rgba(255,255,255,0.25)' }}>
                {lang === 'en' ? b.nameEn : b.nameTp}
              </div>
              {earned && <div style={styles.checkmark}>✓</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  wrap: { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.25rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { color: '#fff', fontSize: '14px', fontWeight: '700' },
  count: { background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8', fontSize: '11px', fontWeight: '700', padding: '3px 12px', borderRadius: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  badge: { borderRadius: '12px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' },
  badgeEarned: { background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)' },
  badgeLocked: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' },
  badgeIcon: { fontSize: '22px', animation: 'float 4s ease-in-out infinite' },
  badgeIconLocked: { filter: 'grayscale(100%)', opacity: 0.3 },
  badgeName: { fontSize: '10px', fontWeight: '600', textAlign: 'center', lineHeight: '1.3' },
  checkmark: { position: 'absolute', top: '4px', right: '6px', fontSize: '10px', color: '#38bdf8', fontWeight: '800' },
}