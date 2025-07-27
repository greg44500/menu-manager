// frontend/src/pages/dashboard/DashboardSection.jsx

import UserSection from '../../pages/dashboard/UserSection'
import ClassroomSection from '../classrooms/ClassroomSection'
import ProgressionSection from '../progressions/ProgressionSection'
import ServiceSection from '../services/ServiceSection'

/**
 * DASHBOARD SECTION ROUTER
 * ------------------------
 * - Affiche dynamiquement la section du dashboard selon la prop `section`.
 * - Passe les handlers nécessaires à chaque sous-section pour les actions modales.
 * - 100% découplé: chaque section gère son propre contexte/interactions.
 * - Prêt pour extension future (ex: ajouter d'autres sections).
 */
const DashboardSection = ({
  section,                // (string) : section active du dashboard ('users', 'classrooms', 'progressions', 'services', etc)
  onOpenUserModal,        // (function) : callback pour ouvrir la modale d'ajout d'utilisateur
  onOpenClassroomModal,   // (function) : callback pour ouvrir la modale d'ajout de classe
  onEditClassroom,        // (function) : callback pour éditer une classe
}) => {
  return (
    <>
      {/* ---- SECTION UTILISATEURS ---- */}
      {section === 'users' && (
        <UserSection onAddUser={onOpenUserModal} />
      )}

      {/* ---- SECTION CLASSES ---- */}
      {section === 'classrooms' && (
        <ClassroomSection
          onOpenModal={onOpenClassroomModal}
          onEditClass={onEditClassroom}
        />
      )}

      {/* ---- SECTION PROGRESSIONS ---- */}
      {section === 'progressions' && (
        <ProgressionSection onOpenModal={() => {}} />
        // Remarque: si besoin, passer des props personnalisés ici
      )}

      {/* ---- SECTION SERVICES ---- */}
      {section === 'services' && (
        <ServiceSection onOpenModal={() => {}} />
        // Idem: ajoute d'autres callbacks selon besoins
      )}
    </>
  )
}

export default DashboardSection
