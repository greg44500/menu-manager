// src/pages/progressions/ProgressionModal.jsx
import Modal from '../../components/common/Modal';
import ProgressionForm from './ProgressionForm';
import ProgressionFormEdit from './ProgressionFormEdit';
import { useGetProgressionByIdQuery } from '../../store/api/progressionsApi';

const ProgressionModal = ({ isOpen, onClose, progressionData, mode = 'create', onSuccess }) => {
    const { data: refreshedProgression, refetch } = useGetProgressionByIdQuery(progressionData?._id, {
        skip: mode !== 'edit'
    });

    const handleSuccess = async () => {
        if (mode === 'edit' && refetch) {
            const refreshed = await refetch(); // Recharger la progression à jour
            onSuccess?.(refreshed?.data);     // Transmettre les données mises à jour au parent
        } else {
            onSuccess?.();                     // Pour le cas "create"
        }
        onClose?.();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={handleSuccess}
            title={mode === 'edit' ? 'Modifier une progression' : 'Créer une progression'}
        >
            {mode === 'edit' ? (
                <ProgressionFormEdit
                    progression={refreshedProgression || progressionData}
                    onSuccess={handleSuccess}
                    onClose={onClose}
                />
            ) : (
                <ProgressionForm onClose={onClose} onSuccess={onSuccess} />
            )}
        </Modal>
    );
};

export default ProgressionModal;
