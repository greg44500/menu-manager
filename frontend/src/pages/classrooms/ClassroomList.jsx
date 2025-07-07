const ClassroomList = () => {
  return (
    <div>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: '600', 
        color: 'var(--primary)',
        marginBottom: '1rem'
      }}>
        Gestion des Classes
      </h1>
      <div className="card">
        <div className="card-content">
          <p>Liste des classes à venir...</p>
        </div>
      </div>
    </div>
  )
}

export default ClassroomList