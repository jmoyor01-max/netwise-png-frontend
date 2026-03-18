export default function ScamAlert({ lang }) {
  const alerts = [
    {
      icon: '⚠️',
      titleEn: 'Active scam alert — PNG',
      titleTp: 'Skam i kamap — PNG',
      textEn: 'Fake BSP Bank SMS messages are circulating. Do not click any links. Call BSP directly on 320 1212.',
      textTp: 'Ol nambis BSP mesej i go raun. No ken kilim links. Ring BSP stret long 320 1212.',
      color: '#A32D2D',
      bg: '#FCEBEB',
      border: '#E24B4A',
    },
    {
      icon: '📱',
      titleEn: 'Digicel phishing warning',
      titleTp: 'Digicel phishing woning',
      textEn: 'Fraudulent recharge offers via WhatsApp. Verify all promotions on the official Digicel app only.',
      textTp: 'Ol giaman recharge ofas long WhatsApp. Lukim ol promosons long Digicel app tasol.',
      color: '#633806',
      bg: '#FAEEDA',
      border: '#BA7517',
    },
  ]

  return (
    <div style={styles.container}>
      {alerts.map((alert, i) => (
        <div key={i} style={{ ...styles.alert, background: alert.bg, borderLeft: `3px solid ${alert.border}` }}>
          <span style={styles.icon}>{alert.icon}</span>
          <div>
            <div style={{ ...styles.title, color: alert.color }}>
              {lang === 'en' ? alert.titleEn : alert.titleTp}
            </div>
            <div style={{ ...styles.text, color: alert.color }}>
              {lang === 'en' ? alert.textEn : alert.textTp}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  alert: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    padding: '10px 12px',
    borderRadius: '8px',
  },
  icon: { fontSize: '16px', flexShrink: 0, marginTop: '1px' },
  title: { fontSize: '12px', fontWeight: '600', marginBottom: '2px' },
  text: { fontSize: '11px', lineHeight: '1.5' },
}