// frontend/src/components/users/UsersList.jsx
import { useState } from 'react'
import { 
  Eye, 
  Edit, 
  Trash2, 
  UserPlus, 
  Crown, 
  Shield, 
  User, 
  Wifi, 
  WifiOff, 
  AlertCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react'

/**
 * 🎯 TABLEAU DES UTILISATEURS POUR LA MODALE
 * 
 * POURQUOI adapté spécialement ?
 * - Basé sur ton UserTable existant
 * - Champs conformes à ton backend (firstname, lastname, specialization, etc.)
 * - Actions intégrées pour navigation modale
 * - Badges et statuts visuels
 * - Variables CSS + Tailwind
 */

const UsersList = ({
  users = [],
  currentUser = null,
  isLoading = false,
  error = null,
  onRefresh = () => {},
  onCreateClick = () => {},
  onEditClick = () => {},
  onDeleteUser = () => {}
}) => {

  console.log('🎯 UsersList rendu avec:', { 
    usersCount: users.length, 
    isLoading, 
    error: error?.data?.message 
  })

  // 🎯 ÉTATS LOCAUX POUR FILTRES
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // 🎯 FILTRAGE DES UTILISATEURS
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

  // 🎯 UTILITAIRES POUR BADGES
  const getRoleIcon = (role) => {
    switch (role) {
      case 'superAdmin': return <Crown size={14} className="text-[var(--error)]" />
      case 'manager': return <Shield size={14} className="text-[var(--warning)]" />
      case 'user': return <User size={14} className="text-[var(--info)]" />
      default: return <User size={14} className="text-[var(--text-muted)]" />
    }
  }

  const getRoleLabel = (role) => {
    const labels = {
      'superAdmin': 'Super Admin',
      'manager': 'Manager', 
      'user': 'Formateur'
    }
    return labels[role] || role
  }

  const getRoleBadge = (role) => {
    const configs = {
      'superAdmin': 'bg-[var(--error-bg)] text-[var(--error)] border-[var(--error)]',
      'manager': 'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]',
      'user': 'bg-[var(--info-bg)] text-[var(--info)] border-[var(--info)]'
    }
    const config = configs[role] || configs.user
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${config}`}>
        {getRoleIcon(role)}
        {getRoleLabel(role)}
      </span>
    )
  }

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
        isActive 
          ? 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]' 
          : 'bg-[var(--error-bg)] text-[var(--error)] border-[var(--error)]'
      }`}>
        {isActive ? <Wifi size={12} /> : <WifiOff size={12} />}
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    )
  }

  const getSpecializationBadge = (specialization) => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
        specialization === 'cuisine' 
          ? 'bg-orange-50 text-orange-700 border-orange-200' 
          : 'bg-purple-50 text-purple-700 border-purple-200'
      }`}>
        {specialization === 'cuisine' ? '👨‍🍳' : '🍽️'}
        {specialization === 'cuisine' ? 'Cuisine' : 'Service'}
      </span>
    )
  }

  const isCurrentUser = (user) => {
    return currentUser && user._id === currentUser.id
  }

  // 🎯 HANDLERS
  const handleDeleteClick = (user) => {
    if (isCurrentUser(user)) {
      alert('Vous ne pouvez pas vous supprimer vous-même !')
      return
    }
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${user.firstname} ${user.lastname} ?`)) {
      onDeleteUser(user._id)
    }
  }

  // 🎯 ÉTAT DE CHARGEMENT
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <RefreshCw size={24} className="animate-spin" />
          <span>Chargement des utilisateurs...</span>
        </div>
      </div>
    )
  }

  // 🎯 GESTION DES ERREURS
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="flex items-center gap-3 text-[var(--error)]">
          <AlertCircle size={24} />
          <span>Erreur lors du chargement</span>
        </div>
        <p className="text-[var(--text-muted)] text-center">
          {error.data?.message || 'Impossible de charger les utilisateurs'}
        </p>
        <button 
          onClick={onRefresh}
          className="btn btn-primary btn-sm"
        >
          <RefreshCw size={16} />
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* 🎯 HEADER AVEC ACTIONS ET FILTRES */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* BOUTON CRÉATION ET STATS */}
        <div className="flex items-center gap-4">
          <button
            onClick={onCreateClick}
            className="btn btn-primary flex items-center gap-2"
          >
            <UserPlus size={18} />
            Nouvel utilisateur
          </button>
          
          <div className="text-sm text-[var(--text-muted)]">
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} affiché{filteredUsers.length > 1 ? 's' : ''}
            {filteredUsers.length !== users.length && (
              <span> sur {users.length} total</span>
            )}
          </div>
        </div>

        {/* BOUTON REFRESH */}
        <button
          onClick={onRefresh}
          className="btn btn-ghost btn-sm flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>

      {/* 🎯 FILTRES ET RECHERCHE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)]">
        
        {/* RECHERCHE */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Rechercher (nom, email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 text-[var(--text-primary)] bg-[var(--surface)] border-[var(--border)] focus:border-[var(--primary)]"
          />
        </div>

        {/* FILTRE RÔLE */}
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input pl-10 text-[var(--text-primary)] bg-[var(--surface)] border-[var(--border)] focus:border-[var(--primary)]"
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
            className="input text-[var(--text-primary)] bg-[var(--surface)] border-[var(--border)] focus:border-[var(--primary)]"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      {/* 🎯 TABLEAU DES UTILISATEURS */}
      <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                <th className="text-left p-4 font-medium text-[var(--text-secondary)]">
                  Utilisateur
                </th>
                <th className="text-left p-4 font-medium text-[var(--text-secondary)]">
                  Email
                </th>
                <th className="text-left p-4 font-medium text-[var(--text-secondary)]">
                  Rôle
                </th>
                <th className="text-left p-4 font-medium text-[var(--text-secondary)]">
                  Spécialisation
                </th>
                <th className="text-left p-4 font-medium text-[var(--text-secondary)]">
                  Statut
                </th>
                <th className="text-right p-4 font-medium text-[var(--text-secondary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-12 text-[var(--text-muted)]">
                    {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                      ? 'Aucun utilisateur ne correspond aux filtres'
                      : 'Aucun utilisateur trouvé'
                    }
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user._id || index}
                    className={`border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors ${
                      isCurrentUser(user) ? 'bg-[var(--primary-pale)]' : ''
                    }`}
                  >
                    {/* NOM PRÉNOM */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-semibold">
                          {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                            {user.firstname} {user.lastname}
                            {isCurrentUser(user) && (
                              <span className="bg-[var(--primary)] text-white px-2 py-0.5 rounded text-xs font-semibold">
                                VOUS
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-[var(--text-muted)]">
                            Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="p-4">
                      <span className="text-[var(--text-primary)]">{user.email}</span>
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

                    {/* ACTIONS */}
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* VOIR */}
                        <button
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--info)] hover:bg-[var(--info-bg)] rounded-md transition-colors"
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>

                        {/* MODIFIER */}
                        <button
                          onClick={() => onEditClick(user)}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--warning)] hover:bg-[var(--warning-bg)] rounded-md transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>

                        {/* SUPPRIMER */}
                        {!isCurrentUser(user) && (
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] rounded-md transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🎯 FOOTER AVEC STATISTIQUES */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)]">
        <div className="text-sm text-[var(--text-muted)]">
          <span className="font-medium text-[var(--success)]">
            {users.filter(u => u.isActive).length}
          </span> utilisateur(s) actif(s) sur{' '}
          <span className="font-medium text-[var(--text-primary)]">
            {users.length}
          </span> total
        </div>
        
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <span>Dernière mise à jour :</span>
          <span className="font-medium text-[var(--text-primary)]">
            {new Date().toLocaleTimeString('fr-FR')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default UsersList