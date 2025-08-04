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
 * Affiche la liste et la gestion des progressions pour la session active.
 * - Récupère l'id de session active via Redux.
 * - Rafraîchit la table automatiquement après chaque mutation grâce à RTK Query (refetch).
 * - Suppression totale du refreshKey (ancienne méthode).
 */

const ProgressionSection = () => {
    // --- ETATS UI LOCAUX ---
    const [isModalOpen, setIsModalOpen] = useState(false);         // Contrôle de la modale (création/édition)
    const [modalMode, setModalMode] = useState('create');          // Mode actuel de la modale (création ou édition)
    const [selectedProgression, setSelectedProgression] = useState(null); // Progression sélectionnée pour édition
    const [progressionToAssign, setProgressionToAssign] = useState(null); // Pour la modale d’assignation de formateurs

    // --- RÉCUPÉRATION SESSION ACTIVE ---
    const activeCalendarId = useSelector(state => state.calendarSession.activeCalendarId);

    // --- QUERY LISTE PROGRESSIONS (RTK QUERY) ---
    // On récupère uniquement la fonction refetch pour recharger la table à la demande après chaque mutation
    const { refetch } = useGetAllProgressionsQuery(activeCalendarId);

    // --- HANDLERS UI (ouverture/fermeture modales) ---
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

    const handleOpenAssignTeachersModal = (progression) => {
        setProgressionToAssign(progression);
    };

    const handleCloseAssignTeachersModal = () => {
        setProgressionToAssign(null);
    };

    // --- RENDU PRINCIPAL ---
    return (
        <div>
            <div className="card theme-transition">
                {/* --- EN-TÊTE DU TABLEAU --- */}
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

                {/* --- TABLEAU DES PROGRESSIONS FILTRÉES PAR SESSION --- */}
                <div className="card-content">
                    <ProgressionTable
                        calendarId={activeCalendarId} // ← L’id de session active est passé à la table
                        onEdit={handleEditProgression}
                        onAssignTeachers={handleOpenAssignTeachersModal}
                    />
                </div>

                {/* --- MODALE ASSIGNATION FORMATEURS --- */}
                {progressionToAssign && (
                    <AssignTeachersModal
                        isOpen={!!progressionToAssign}
                        progressionId={progressionToAssign._id}
                        onClose={handleCloseAssignTeachersModal}
                        // Après assignation, on rafraîchit la table (RTK Query)
                        onSuccess={() => {
                            refetch();
                            handleCloseAssignTeachersModal();
                        }}
                    />
                )}

                {/* --- MODALE CRÉATION/EDITION PROGRESSION --- */}
                <ProgressionModal
                    isOpen={isModalOpen}
                    mode={modalMode}
                    progressionData={selectedProgression}
                    onClose={() => setIsModalOpen(false)}
                    // Après création ou édition, on rafraîchit la table (RTK Query)
                    onSuccess={() => {
                        refetch();
                        setIsModalOpen(false);
                    }}
                    calendarId={activeCalendarId}
                />
            </div>
        </div>
    );
};

export default ProgressionSection;
