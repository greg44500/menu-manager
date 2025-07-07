const UserProfile = () => {
  return (
    <div>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: '600', 
        color: 'var(--primary)',
        marginBottom: '1rem'
      }}>
        Mon Profil
      </h1>
      <div className="card">
        <div className="card-content">
          <p>Paramètres du profil utilisateur...</p>
        </div>
      </div>
    </div>
  )
}

export default UserProfile