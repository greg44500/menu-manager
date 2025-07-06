
function App() {


  return (
     <div className="min-h-screen bg-background p-8">
      <h1 className="text-primary text-4xl font-bold mb-6">
        Test Thème Terracotta
      </h1>
      
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="modal-title">Composants de test</h2>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="flex gap-4">
              <button className="btn btn-primary">Bouton Principal</button>
              <button className="btn btn-secondary">Bouton Secondaire</button>
              <button className="btn btn-ghost">Bouton Ghost</button>
            </div>
            
            <div className="flex gap-2">
              <span className="badge badge-success">Succès</span>
              <span className="badge badge-warning">Attention</span>
              <span className="badge badge-error">Erreur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
