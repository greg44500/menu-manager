// frontend/src/components/users/UserTable.jsx
import { useState } from 'react'
import {
  useGetAllUsersQuery,
  useDeleteUserMutation
} from '../../store/api/usersApi'
import UserModal from '../users/UserModal'

/**
 * TABLEAU DES UTILISATEURS
 * 
 * FONCTIONNALITÉS :
 * - Affichage de tous les utilisateurs
 * - Actions : Voir, Modifier, Supprimer
 * - Filtrage par rôle et statut
 * - Recherche par nom/email
 * - Responsive design
 * - Confirmation de suppression
 */

const UserTable = () => {
  // ÉTATS LOCAUX
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [userToDelete, setUserToDelete] = useState(null)

  // RTK QUERY HOOKS
  const {
    data: usersData,
    isLoading,
    error,
    refetch
  } = useGetAllUsersQuery()

  const [deleteUser, {
    isLoading: isDeleting
  }] = useDeleteUserMutation()

  // DONNÉES UTILISATEURS
  const users = usersData?.data || []

  // FILTRAGE ET RECHERCHE
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' ? user.isActive : !user.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  // HANDLERS
  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleViewUser = (user) => {
    // TODO: Implémenter vue détail ou modale de consultation
    console.log('Voir utilisateur:', user)
  }

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    try {
      await deleteUser(userToDelete._id).unwrap()
      setUserToDelete(null)
      // Le cache se rafraîchit automatiquement grâce à invalidatesTags
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleModalSuccess = () => {
    // Le cache se rafraîchit automatiquement
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  // BADGES DE STATUT
  const getRoleBadge = (role) => {
    const roleConfig = {
      superAdmin: { label: 'Super Admin', class: 'badge-error' },
      manager: { label: 'Manager', class: 'badge-warning' },
      user: { label: 'Formateur', class: 'badge-info' }
    }
    const config = roleConfig[role] || roleConfig.user
    return (
      <span className={`badge ${config.class}`}>
        {config.label}
      </span>
    )
  }

  const getStatusBadge = (isActive) => (
    <span className={`badge ${isActive ? 'badge-success' : 'badge-error'}`}>
      {isActive ? 'Actif' : 'Inactif'}
    </span>
  )

  const getSpecializationBadge = (specialization) => (
    <span className={`badge badge-primary`}>
      {specialization === 'cuisine' ? 'Cuisine' : 'Service'}
    </span>
  )

  const getPasswordBadge = (isTemporary) => (
    isTemporary ? (
      <span className="badge badge-warning">Temporaire</span>
    ) : (
      <span className="badge badge-success">Défini</span>
    )
  )

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3" style={{ color: 'var(--text-muted)' }}>
          Chargement des utilisateurs...
        </span>
      </div>
    )
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="alert alert-error">
        <p className="font-medium">Erreur lors du chargement des utilisateurs</p>
        <p>{error.data?.message || 'Erreur inconnue'}</p>
        <button
          onClick={refetch}
          className="btn btn-sm btn-secondary mt-2"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* HEADER AVEC CONTRÔLES */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* TITRE ET BOUTON CRÉATION */}
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Gestion des Utilisateurs
          </h2>
          <button
            onClick={handleCreateUser}
            className="btn btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouvel utilisateur
          </button>
        </div>

        {/* STATS RAPIDES */}
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {filteredUsers.length} / {users.length} utilisateurs
        </div>
      </div>

      {/* FILTRES ET RECHERCHE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RECHERCHE */}
        <div>
          <input
            type="text"
            placeholder="Rechercher (nom, email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>

        {/* FILTRE RÔLE */}
        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input"
          >
            <option value="all">Tous les rôles</option>
            <option value="superAdmin">Super Admins</option>
            <option value="manager">Managers</option>
            <option value="user">Formateurs</option>
          </select>
        </div>

        {/* FILTRE STATUT */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>

        {/* BOUTON RESET FILTRES */}
        <div>
          <button
            onClick={() => {
              setSearchTerm('')
              setFilterRole('all')
              setFilterStatus('all')
            }}
            className="btn btn-ghost w-full"
          >
            Réinitialiser filtres
          </button>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left p-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Utilisateur
                </th>
                <th className="text-left p-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Email
                </th>
                <th className="text-left p-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Rôle
                </th>
                <th className="text-left p-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Spécialisation
                </th>
                <th className="text-left p-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Statut
                </th>
                <th className="text-left p-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Mot de passe
                </th>
                <th className="text-right p-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8" style={{ color: 'var(--text-muted)' }}>
                    {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                      ? 'Aucun utilisateur ne correspond aux filtres'
                      : 'Aucun utilisateur trouvé'
                    }
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b hover:bg-surface-hover transition-colors"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {/* NOM PRÉNOM */}
                    <td className="p-4">
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {user.firstname} {user.lastname}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="p-4">
                      <span style={{ color: 'var(--text-primary)' }}>{user.email}</span>
                    </td>

                    {/* RÔLE */}
                    <td className="p-4">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* SPÉCIALISATION */}
                    <td className="p-4">
                      {getSpecializationBadge(user.specialization)}
                    </td>

                    {/* STATUT */}
                    <td className="p-4">
                      {getStatusBadge(user.isActive)}
                    </td>

                    {/* MOT DE PASSE */}
                    <td className="p-4">
                      {getPasswordBadge(user.isTemporaryPassword)}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* VOIR */}
                        <button
                          onClick={() => handleViewUser(user)}
                          className="btn btn-sm btn-ghost"
                          title="Voir les détails"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* MODIFIER */}
                        <button
                          onClick={() => handleEditUser(user)}
                          className="btn btn-sm btn-ghost"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* SUPPRIMER */}
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="btn btn-sm btn-ghost hover:text-error"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE UTILISATEUR */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSuccess={handleModalSuccess}
      />

      {/* MODALE CONFIRMATION SUPPRESSION */}
      {userToDelete && (
        <Modal
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          title="Confirmer la suppression"
          size="sm"
        >
          <div className="space-y-4">
            <p style={{ color: 'var(--text-primary)' }}>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <strong>{userToDelete.firstname} {userToDelete.lastname}</strong> ?
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Cette action est irréversible.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="btn btn-secondary"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className={`btn btn-danger ${isDeleting ? 'btn-loading' : ''}`}
                disabled={isDeleting}
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default UserTable