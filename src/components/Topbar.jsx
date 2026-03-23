export default function Topbar({ title, alertCount = 2 }) {
  return (
    <div style={styles.topbar}>
      <span style={styles.breadcrumb}>
        NetWise PNG / <span style={styles.breadcrumbActive}>{title}</span>
      </span>
      {alertCount > 0 && (
        <div style={styles.alertBadge}>
          <div style={styles.alertDot} />
          {alertCount} live alert{alertCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

const styles = {
  topbar: {
    height: '44px',
    background: 'rgba(255,255,255,0.02)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 1.25rem',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  breadcrumb: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.3)',
  },
  breadcrumbActive: {
    color: '#38bdf8',
  },
  alertBadge: {
    background: 'rgba(226,75,74,0.1)',
    border: '1px solid rgba(226,75,74,0.2)',
    color: 'rgba(255,130,130,0.8)',
    fontSize: '10px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  alertDot: {
    width: '4px',
    height: '4px',
    background: '#E24B4A',
    borderRadius: '50%',
    animation: 'blink 1.5s ease-in-out infinite',
  },
}