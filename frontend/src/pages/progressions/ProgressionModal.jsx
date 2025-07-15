// src/pages/progressions/ProgressionModal.jsx
import Modal from '../../components/common/Modal';
import ProgressionForm from './ProgressionForm';
import ProgressionFormEdit from './ProgressionFormEdit';

const ProgressionModal = ({ isOpen, onClose, progressionData, mode = 'create', onSuccess }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'edit' ? 'Modifier une progression' : 'Créer une progression'}
        >
            {mode === 'edit' ? (
                <ProgressionFormEdit progression={progressionData} onSuccess={onSuccess} />
            ) : (
                <ProgressionForm onClose={onClose} onSuccess={onSuccess} />
            )}
        </Modal>
    );
};

export default ProgressionModal;