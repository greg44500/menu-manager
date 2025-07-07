const Dashboard = () => {
  return (
    <div>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: '600', 
        color: 'var(--primary)',
        marginBottom: '1rem'
      }}>
        Dashboard
      </h1>
      <div className="card">
        <div className="card-content">
          <p>Bienvenue sur votre tableau de bord !</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard