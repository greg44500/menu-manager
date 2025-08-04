// src/pages/dashboard/UserProgressionsSection.jsx

import { useState } from 'react'
import ProgressionTable from '../../progressions/ProgressionTable'
import ProgressionModal from '../../progressions/ProgressionModal'


/**
 * UserProgressionsSection
 * -----------------------
 * Affiche :
 *  - Un sélecteur pour filtrer les progressions assignées
 *  - Un tableau de progressions filtré
 *  - La modale de détail/édition (si besoin)
 * Les actions du tableau (détail, etc.) ouvrent la modale dédiée.
 * Props :
 *  - progressions : Array de progressions assignées à l'utilisateur
 */

const UserProgressionsSection = ({ progressions }) => {

    // --- State : progression affichée dans la modale ---
    const [modalProgression, setModalProgression] = useState(null)

    // --- Handler : ouverture/fermeture modale détail ---
    const handleOpenModal = (progression) => setModalProgression(progression)
    const handleCloseModal = () => setModalProgression(null)

    return (

        <>

            <ProgressionTable
                data={progressions}
                readOnly
                emptyMessage="Aucune progression à afficher."
                onRowClick={handleOpenModal}
            />


            {/* --- Modale détail progression --- */}
            <div>
                {modalProgression && (
                    <ProgressionModal
                        isOpen={!!modalProgression}
                        onClose={handleCloseModal}
                        progressionData={modalProgression}
                        mode="edit"
                    />
                )}
            </div>
        </>
    )
}

export default UserProgressionsSection
