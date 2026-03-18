export default function ScamAlert({ lang }) {
  const alerts = [
    {
      icon: '⚠️',
      titleEn: 'Active scam alert — PNG',
      titleTp: 'Skam i kamap — PNG',
      textEn: 'Fake BSP Bank SMS messages are circulating. Do not click any links. Call BSP directly on 320 1212.',
      textTp: 'Ol nambis BSP mesej i go raun. No ken kilim links. Ring BSP stret long 320 1212.',
    },
    {
      icon: '📱',
      titleEn: 'Digicel phishing warning',
      titleTp: 'Digicel phishing woning',
      textEn: 'Fraudulent recharge offers via WhatsApp. Verify all promotions on the official Digicel app only.',
      textTp: 'Ol giaman recharge ofas long WhatsApp. Lukim ol promosons long Digicel app tasol.',
    },
  ]

  return (
    <div style={styles.container}>
      {alerts.map((alert, i) => (
        <div key={i} style={{ ...styles.alert, animationDelay: `${i * 0.2}s` }}>
          <span style={styles.icon}>{alert.icon}</span>
          <div>
            <div style={styles.title}>{lang === 'en' ? alert.titleEn : alert.titleTp}</div>
            <div style={styles.text}>{lang === 'en' ? alert.textEn : alert.textTp}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '10px' },
  alert: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    padding: '12px 14px',
    background: 'rgba(226,75,74,0.08)',
    border: '1px solid rgba(226,75,74,0.2)',
    borderRadius: '10px',
    animation: 'slideIn 0.5s ease both',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  icon: { fontSize: '18px', flexShrink: 0, animation: 'float 3s ease-in-out infinite' },
  title: { fontSize: '12px', fontWeight: '700', color: '#fca5a5', marginBottom: '3px' },
  text: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' },
}