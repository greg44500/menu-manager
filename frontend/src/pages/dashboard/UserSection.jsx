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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Titre à gauche */}
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Liste des utilisateurs
          </h2>

          {/* Bouton à droite */}
          <button
            onClick={onAddUser}
            className="btn btn-primary"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
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