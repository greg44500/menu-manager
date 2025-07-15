// frontend/src/pages/dashboard/DashboardSection.jsx
import UserSection from '../../pages/dashboard/UserSection'
import ClassroomSection from '../classrooms/ClassroomSection'
import ProgressionSection from '../progressions/ProgressionSection'

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

      {section === 'progressions' && (
        <ProgressionSection onOpenModal={() => { }} />
      )}
    </>
  )
}

export default DashboardSection
