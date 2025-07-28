import { useState } from 'react';
import { Plus } from 'lucide-react';
import ProgressionTable from './ProgressionTable';
import ProgressionModal from './ProgressionModal';
import AssignTeachersModal from './AssignTeachersModal';
import { useGetAllProgressionsQuery } from '../../store/api/progressionsApi';
import { useSelector } from 'react-redux';

/**
 * SECTION PROGRESSIONS
 * ---------------------
 * Affiche le tableau des progressions pour la session active (calendarId).
 * - Utilise le Redux store pour récupérer la session sélectionnée.
 * - Passe le calendarId à ProgressionTable pour qu'il utilise le hook RTK Query filtré côté backend.
 */
const ProgressionSection = () => {
    // --- ETATS UI LOCAUX ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedProgression, setSelectedProgression] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // --- RÉCUPÉRATION DE LA SESSION ACTIVE ---
    // Récupère l'id de la session (calendarId) sélectionnée dans le store Redux (persisté par le SessionSelector global)
    const activeCalendarId = useSelector(state => state.calendarSession.activeCalendarId);
    const [progressionToAssign, setProgressionToAssign] = useState(null);
    const { refetch } = useGetAllProgressionsQuery(activeCalendarId);
    console.log("ActiveCalendarId", activeCalendarId)
    // --- HANDLERS UI (modal création/édition) ---
    const handleOpenModal = () => {
        setModalMode('create');
        setSelectedProgression(null);
        setIsModalOpen(true);
    };

    const handleOpenAssignTeachersModal = (progression) => {
        setProgressionToAssign(progression);
    };

    const handleCloseAssignTeachersModal = () => {
        setProgressionToAssign(null);
    };

    const handleEditProgression = (progression) => {
        setModalMode('edit');
        setSelectedProgression(progression);
        setIsModalOpen(true);
    };

    // --- HANDLER DE SUCCÈS (refresh) ---
    const handleSuccess = () => {
        setIsModalOpen(false);
        setRefreshKey(prev => prev + 1); // Permet de rafraîchir la table si besoin
    };

    // --- RENDU PRINCIPAL ---
    return (
        <div style={{ marginBottom: '2rem' }}>
            <div className="card theme-transition">
                <div className="card-header">
                    <div className='card-header-position'>
                        <h2 className="card-header-title">
                            Liste des progressions
                        </h2>
                        <button
                            onClick={handleOpenModal}
                            className="btn btn-primary card-header-btn"
                        >
                            <Plus size={16} />
                            Ajouter une progression
                        </button>
                    </div>
                </div>

                {/* TABLEAU DES PROGRESSIONS FILTRÉES PAR SESSION */}
                <div className="card-content">
                    <ProgressionTable
                        calendarId={activeCalendarId} // ← On passe le calendarId ici (important)
                        onEdit={handleEditProgression}
                        refreshTrigger={refreshKey}
                        onAssignTeachers={handleOpenAssignTeachersModal}
                    />
                </div>
                {progressionToAssign && (
                    <AssignTeachersModal
                        isOpen={!!progressionToAssign}
                        progressionId={progressionToAssign._id}
                        onClose={handleCloseAssignTeachersModal}
                        onSuccess={() => {
                            refetch(); // RTK Query refetch de la liste des progressions
                            handleCloseAssignTeachersModal();
                        }}
                    />
                )}

                {/* MODALE CRÉATION/EDITION */}
                <ProgressionModal
                    isOpen={isModalOpen}
                    mode={modalMode}
                    progressionData={selectedProgression}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                    calendarId={activeCalendarId} // ← Passe aussi à la modale (pour la création)
                />
            </div>
        </div>
    );
};

export default ProgressionSection;
