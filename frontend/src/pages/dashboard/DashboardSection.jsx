// src/components/dashboard/DashboardSection.jsx
import UserSection from '../../pages/dashboard/UserSection'
// import ProgressionSection from '../progressions/ProgressionSection'
// import ClassroomSection from '../classrooms/ClassroomSection'
// import MenuSection from '../menus/MenuSection'

/**
 * Affiche dynamiquement la section correspondant
 * à la statcard sélectionnée dans le dashboard.
 */
const DashboardSection = ({ section, onOpenUserModal }) => {
  switch (section) {
    case 'users':
      return <UserSection onAddUser={onOpenUserModal} />

    case 'progressions':
      return (
        <div className="text-sm text-text-muted p-4 border rounded-md">
          [ProgressionSection à implémenter ici]
        </div>
      )

    case 'classrooms':
      return (
        <div className="text-sm text-text-muted p-4 border rounded-md">
          [ClassroomSection à implémenter ici]
        </div>
      )

    case 'menus':
      return (
        <div className="text-sm text-text-muted p-4 border rounded-md">
          [MenuSection à implémenter ici]
        </div>
      )

    default:
      return null
  }
}

export default DashboardSection
