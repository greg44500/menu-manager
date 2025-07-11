import Modal from '../../components/common/Modal';
import UserForm from '../../pages/users/UserForm';
import UserEditForm from '../../pages/users/UserEditForm';

const UserModal = ({ mode = 'create', isOpen, onClose, userData, onSuccess }) => {
  const isEdit = mode === 'edit';

  return (
    <Modal
      title={isEdit ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
      isOpen={isOpen}
      onClose={onClose}
    >
      {isEdit ? (
        <UserEditForm
          user={userData}
          onClose={onClose}
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
        />
      ) : (
        <UserForm
          mode={mode}
          initialValues={null}
          onCancel={onClose}
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
        />
      )}
    </Modal>
  );
};

export default UserModal;
