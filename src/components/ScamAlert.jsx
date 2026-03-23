export default function ScamAlert({ lang }) {
  const alerts = [
    {
      icon: '⚠️',
      titleEn: 'BSP Bank scam alert',
      titleTp: 'BSP Bank skam alert',
      textEn: 'Fake SMS messages circulating. Do not click any links. Call BSP on 320 1212.',
      textTp: 'Ol nambis BSP mesej i go raun. No ken kilim links. Ring BSP long 320 1212.',
    },
    {
      icon: '📱',
      titleEn: 'Digicel phishing warning',
      titleTp: 'Digicel phishing woning',
      textEn: 'Fraudulent recharge offers on WhatsApp. Verify on the official Digicel app only.',
      textTp: 'Ol giaman recharge ofas long WhatsApp. Lukim long Digicel app tasol.',
    },
  ]

  return (
    <div style={styles.container}>
      {alerts.map((a, i) => (
        <div
          key={i}
          style={styles.alert}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateX(3px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateX(0)' }}
        >
          <span style={{ fontSize: '18px', flexShrink: 0, animation: 'float 4s ease-in-out infinite' }}>{a.icon}</span>
          <div>
            <div style={styles.title}>{lang === 'en' ? a.titleEn : a.titleTp}</div>
            <div style={styles.text}>{lang === 'en' ? a.textEn : a.textTp}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '10px' },
  alert: {
    display: 'flex', gap: '12px', alignItems: 'flex-start',
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.25s',
  },
  title: { fontSize: '12px', fontWeight: '700', color: '#fff', marginBottom: '3px' },
  text: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' },
}