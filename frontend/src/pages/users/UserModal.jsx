// frontend/src/components/users/UserModal.jsx
import { useState } from 'react'
import Modal from '../common/Modal'
import UsersList from './UserList'
import UserForm from './UserForm'
import { ArrowLeft, Users, UserPlus, Edit } from 'lucide-react'

/**
 * 🎯 MODALE MULTI-MODE POUR GESTION UTILISATEURS
 * 
 * POURQUOI cette approche ?
 * - UNE seule modale = Performance optimale
 * - Navigation fluide = UX moderne (comme les apps mobiles)
 * - Code centralisé = Maintenance facile
 * - Animations cohérentes = Expérience premium
 * 
 * MODES DISPONIBLES :
 * - 'list'   : Tableau des utilisateurs
 * - 'create' : Formulaire création
 * - 'edit'   : Formulaire édition
 */

const UserModal = ({
  isOpen,
  onClose,
  // Props pour les données
  usersData = [],
  currentUser = null,
  isLoading = false,
  error = null,
  onRefresh = () => { },
  // Props pour les callbacks
  onUserCreated = () => { },
  onUserUpdated = () => { },
  onUserDeleted = () => { }
}) => {

  // 🎯 ÉTAT LOCAL POUR GÉRER LES MODES
  const [modalState, setModalState] = useState({
    mode: 'list', // 'list' | 'create' | 'edit'
    selectedUser: null,
    previousMode: null // Pour navigation intelligente
  })

  console.log('🎯 UserModal state:', modalState, 'usersData length:', usersData.length)

  // 🎯 HANDLERS POUR NAVIGATION ENTRE MODES
  const switchToCreateMode = () => {
    console.log('🔄 Switch to CREATE mode - AVANT:', modalState)
    setModalState({
      mode: 'create',
      selectedUser: null,
      previousMode: 'list'
    })
    console.log('🔄 Switch to CREATE mode - APRÈS')
  }

  const switchToEditMode = (user) => {
    console.log('🔄 Switch to EDIT mode for user:', user.firstname, user.lastname)
    setModalState({
      mode: 'edit',
      selectedUser: user,
      previousMode: 'list'
    })
  }

  const switchToListMode = () => {
    console.log('🔄 Switch to LIST mode')
    setModalState({
      mode: 'list',
      selectedUser: null,
      previousMode: null
    })
  }

  // 🎯 HANDLER FERMETURE MODALE
  const handleClose = () => {
    console.log('🔄 Close modal and reset state')
    // Reset du state quand on ferme
    setModalState({
      mode: 'list',
      selectedUser: null,
      previousMode: null
    })
    onClose()
  }

  // 🎯 HANDLERS POUR ACTIONS CRUD
  const handleUserCreated = (newUser) => {
    console.log('✅ User created:', newUser)
    onUserCreated(newUser)
    onRefresh() // Refresh la liste
    switchToListMode() // Retour à la liste avec animation
  }

  const handleUserUpdated = (updatedUser) => {
    console.log('✅ User updated:', updatedUser)
    onUserUpdated(updatedUser)
    onRefresh() // Refresh la liste
    switchToListMode() // Retour à la liste
  }

  const handleUserDeleted = (deletedUserId) => {
    console.log('✅ User deleted:', deletedUserId)
    onUserDeleted(deletedUserId)
    onRefresh() // Refresh la liste
    // Reste en mode liste
  }

  // 🎯 CONFIGURATION DYNAMIQUE SELON LE MODE
  const getModalConfig = () => {
    switch (modalState.mode) {
      case 'list':
        return {
          title: `Gestion des Utilisateurs`,
          subtitle: `${usersData.length} utilisateur${usersData.length > 1 ? 's' : ''}`,
          size: 'xl',
          icon: <Users size={24} style={{ color: 'var(--primary)' }} />,
          showBackButton: false
        }

      case 'create':
        return {
          title: '➕ Créer un Nouvel Utilisateur',
          subtitle: 'Ajout d\'un nouveau membre à l\'équipe',
          size: 'lg',
          icon: <UserPlus size={24} style={{ color: 'var(--success)' }} />,
          showBackButton: true
        }

      case 'edit':
        return {
          title: '✏️ Modifier l\'Utilisateur',
          subtitle: `${modalState.selectedUser?.firstname} ${modalState.selectedUser?.lastname}`,
          size: 'lg',
          icon: <Edit size={24} style={{ color: 'var(--warning)' }} />,
          showBackButton: true
        }

      default:
        return {
          title: 'Gestion des Utilisateurs',
          subtitle: '',
          size: 'lg',
          icon: <Users size={24} />,
          showBackButton: false
        }
    }
  }

  const config = getModalConfig()

  // 🎯 RENDU CONDITIONNEL DU CONTENU
  const renderModalContent = () => {
    switch (modalState.mode) {
      case 'list':
        return (
          <UsersList
            users={usersData}
            currentUser={currentUser}
            isLoading={isLoading}
            error={error}
            onRefresh={onRefresh}
            onCreateClick={switchToCreateMode}  // ← Callback pour création
            onEditClick={switchToEditMode}      // ← Callback pour édition  
            onDeleteUser={handleUserDeleted}    // ← Callback pour suppression
          />
        )

      case 'create':
        return (
          <UserForm
            mode="create"
            onSuccess={handleUserCreated}
            onCancel={switchToListMode}
          />
        )

      case 'edit':
        return (
          <UserForm
            mode="edit"
            user={modalState.selectedUser}
            onSuccess={handleUserUpdated}
            onCancel={switchToListMode}
          />
        )

      default:
        return (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--error)'
          }}>
            ❌ Mode non reconnu : {modalState.mode}
          </div>
        )
    }
  }

  // 🎯 RENDU FINAL AVEC TAILWIND + VARIABLES CSS
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={config.size}
      closeOnOverlay={modalState.mode === 'list'}
      closeOnEscape={true}
    >
      {/* 🎯 HEADER PERSONNALISÉ AVEC NAVIGATION */}
      <div className="flex items-center justify-between px-6 pt-6 pb-0 mb-6 border-b border-[var(--border)]">
        {/* TITRE AVEC ICÔNE */}
        <div className="flex items-center gap-3 flex-1">
          {config.icon}
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] m-0">
              {config.title}
            </h2>
            {config.subtitle && (
              <p className="text-sm text-[var(--text-muted)] mt-1 m-0">
                {config.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center gap-3">
          {/* BOUTON RETOUR */}
          {config.showBackButton && (
            <button
              onClick={switchToListMode}
              className="btn btn-ghost btn-sm flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft size={16} />
              Retour à la liste
            </button>
          )}

          {/* BOUTON FERMER */}
          <button
            onClick={handleClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] rounded-md transition-all duration-200 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 🎯 CONTENU DYNAMIQUE */}
      <div
        className="px-6 pb-6"
        style={{
          minHeight: modalState.mode === 'list' ? '400px' : '300px'
        }}
      >
        {renderModalContent()}
      </div>
    </Modal>
  )
}

export default UserModal