// frontend/src/pages/dashboard/DashboardSection.jsx
import UserSection from '../../pages/dashboard/UserSection'
import ClassroomSection from '../classrooms/ClassroomSection'

const DashboardSection = ({
  section,
  onOpenUserModal,
  onOpenClassroomModal,
  onEditClassroom
}) => {
  return (
    <>
      {section === 'users' && (
        <UserSection onAddUser={onOpenUserModal} />
      )}

      {section === 'classrooms' && (
        <ClassroomSection
          onOpenModal={onOpenClassroomModal}
          onEditClass={onEditClassroom}
        />
      )}
    </>
  )
}

export default DashboardSection
