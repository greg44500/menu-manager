import Modal from '../../components/common/Modal';
import ClassroomForm from '../classrooms/ClassroomForm';
import ClassroomFormEdit from '../classrooms/ClassroomFormEdit';

const ClassroomModal = ({ isOpen, onClose, classroom, mode = 'create', onSuccess }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'edit' ? 'Modifier une classe' : 'Créer une classe'}>
            {mode === 'edit' ? (
                <ClassroomFormEdit classroom={classroom} onSuccess={onSuccess} onClose={onClose} />
            ) : (
                <ClassroomForm onClose={onClose} onSuccess={onSuccess} />
            )}
        </Modal>
    );
};

export default ClassroomModal;
