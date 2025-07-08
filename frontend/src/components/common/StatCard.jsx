// frontend/src/components/common/StatCard.jsx

const StatCard = ({ title, count, icon }) => {
  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-md)',
      transition: 'all 0.2s ease'
    }}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = 'var(--shadow-lg)'
        e.target.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = 'var(--shadow-md)'
        e.target.style.transform = 'translateY(0)'
      }}
    >
      <div>
        <h3 style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          fontWeight: '500',
          letterSpacing: '0.05em',
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '2rem',
          fontWeight: '700',
          margin: 0,
          color: 'var(--text-primary)',
          lineHeight: 1
        }}>
          {count}
        </p>
      </div>
      <div style={{
        fontSize: '2.5rem',
        color: 'var(--primary)',
        opacity: 0.3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
    </div>
  )
}

export default StatCard