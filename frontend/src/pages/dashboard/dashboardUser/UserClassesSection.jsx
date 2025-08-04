// src/pages/dashboard/UserClassesSection.jsx

import { useState } from 'react'
import ClassesTable from '../../classrooms/ClassroomTable'
import ClasseModal from '../../classrooms/ClassroomModal'     // ← à adapter également

/**
 * UserClassesSection
 * ------------------
 * Affiche:
 *  - Un sélecteur pour filtrer les classes assignées au formateur
 *  - Un tableau des classes filtré (lecture seule)
 *  - La modale de détail/édition d’une classe (si besoin)
 * Props:
 *  - classes: Array des classes assignées à l’utilisateur
 */

const UserClassesSection = ({ classes }) => {

  // --- State : classe affichée dans la modale ---
  const [modalClasse, setModalClasse] = useState(null)



  // --- Handler : ouverture/fermeture modale détail ---
  const handleOpenModal = (classe) => setModalClasse(classe)
  const handleCloseModal = () => setModalClasse(null)

  return (
    <>
      {/* --- Tableau des classes filtrées --- */}

      <ClassesTable
        data={classes}
        readOnly
        emptyMessage="Aucune classe à afficher."
        onRowClick={handleOpenModal}
      />


      {/* --- Modale détail classe --- */}
      {modalClasse && (
        <ClasseModal
          isOpen={!!modalClasse}
          onClose={handleCloseModal}
          classeData={modalClasse}
          mode="edit"
        />
      )}
    </>
  )
}

export default UserClassesSection
