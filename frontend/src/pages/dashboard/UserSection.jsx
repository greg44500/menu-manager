// src/components/users/UserSection.jsx
import UserTable from '../../pages/users/UserTable'
import { Plus } from 'lucide-react'

/**
 * Section affichée dynamiquement dans le dashboard Super Admin
 * quand la statcard "Utilisateurs" est cliquée.
 */
const UserSection = ({ onAddUser }) => {
  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div className="card-header">
        <div className='card-header-position'>
          {/* Titre à gauche */}
          <h2 className='card-header-title'>
            Liste des utilisateurs
          </h2>

          {/* Bouton à droite */}
          <button
            onClick={onAddUser}
            className="btn btn-primary card-header-btn"
          >
            <Plus size={16} />
            Ajouter un utilisateur
          </button>
        </div>
      </div>

      <div className="card-content">
        <UserTable />
      </div>
    </div>
  )
}

export default UserSection