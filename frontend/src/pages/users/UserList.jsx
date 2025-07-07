const UserList = () => {
  return (
    <div>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: '600', 
        color: 'var(--primary)',
        marginBottom: '1rem'
      }}>
        Gestion des Utilisateurs
      </h1>
      <div className="card">
        <div className="card-content">
          <p>Liste des utilisateurs (Réservé aux admins)</p>
        </div>
      </div>
    </div>
  )
}

export default UserList