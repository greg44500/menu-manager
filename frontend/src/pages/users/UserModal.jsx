// src/components/users/UserModal.jsx
import Modal from '../../components/common/Modal'
import UserForm from '../../pages/users/UserForm'

/**
 * Modale affichant uniquement le formulaire de création ou modification.
 */
const UserModal = ({ mode = 'create', userData = null, onClose, onSuccess, isOpen = true }) => {
  const isEdit = mode === 'edit'

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {isEdit ? 'MODIFIER LES PROPRIETES UTILISATEUR' : 'AJOUTER UN UTILISATEUR'}
        </h2>

        <UserForm
          mode={mode}
          initialValues={isEdit ? userData : null}
          onCancel={onClose}
          onSuccess={() => {
            onSuccess?.()
            onClose()
          }}
        />
      </div>
    </Modal>
  )
}

export default UserModal