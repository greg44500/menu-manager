const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)',
      padding: '2rem'
    }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div className="card-content">
          <h1 style={{ 
            fontSize: '3rem', 
            color: 'var(--primary)',
            marginBottom: '1rem'
          }}>
            404
          </h1>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            Page introuvable
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            La page que vous recherchez n'existe pas.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/dashboard'}
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound