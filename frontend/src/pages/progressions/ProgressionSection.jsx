import { useState } from 'react';
import { Plus } from 'lucide-react';
import ProgressionTable from './ProgressionTable';
import ProgressionModal from './ProgressionModal';

const ProgressionSection = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedProgression, setSelectedProgression] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0)

    const handleOpenModal = () => {
        setModalMode('create');
        setSelectedProgression(null);
        setIsModalOpen(true);
    };

    const handleEditProgression = (progression) => {
        setModalMode('edit');
        setSelectedProgression(progression);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        setRefreshKey(prev => prev + 1); // ← Rafraîchir la table
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <div className="card theme-transition">
                <div className="card-header">
                    <div className='card-header-position'
                    >
                        <h2 className="card-header-title">
                            Liste des progressions
                        </h2>

                        <button
                            onClick={handleOpenModal}
                            className="btn btn-primary card-header-btn "

                        >
                            <Plus size={16} />
                            Ajouter une progression
                        </button>
                    </div>
                </div>

                <div className="card-content">
                    <ProgressionTable onEdit={handleEditProgression} refreshTrigger={refreshKey} />
                </div>

                <ProgressionModal
                    isOpen={isModalOpen}
                    mode={modalMode}
                    progressionData={selectedProgression}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            </div>
        </div>
    );
};

export default ProgressionSection;
