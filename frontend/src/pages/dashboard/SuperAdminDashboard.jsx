// frontend/src/pages/dashboard/SuperAdminDashboard.jsx
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetAllUsersQuery } from '../../store/api/usersApi'
// import { useGetAllClassroomsQuery } from '../../store/api/classroomsApi'
import { useGetDashboardStatsQuery } from '../../store/api/dashboardApi'
import StatCard from '../../components/common/StatCard'
import DashboardSection from '../../pages/dashboard/DashboardSection'
import UserModal from '../../pages/users/UserModal'
import ClassroomModal from '../../pages/classrooms/ClassroomModal'
import {
  Users,
  School,
  BarChart2,
  Utensils,
  Hourglass,
  AlertCircle,
  RotateCcw
} from 'lucide-react'

const SuperAdminDashboard = () => {
  const [activeSection, setActiveSection] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showClassroomModal, setShowClassroomModal] = useState(false)
  const [editingClassroom, setEditingClassroom] = useState(null)

  const { user: currentUser } = useSelector(state => state.auth)

  const usersQuery = useGetAllUsersQuery(undefined, {
    skip: !showUserModal,
    refetchOnMountOrArgChange: true
  })

  // const classroomsQuery = useGetAllClassroomsQuery(undefined, {
  //   skip: !showClassroomModal,
  //   refetchOnMountOrArgChange: true,
  // })

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsIsError,
    refetch
  } = useGetDashboardStatsQuery()

  const usersData = usersQuery?.data;
  const usersLoading = usersQuery?.isLoading;
  const usersError = usersQuery?.error;

  if (statsLoading) {
    return (
      <div style={{
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        fontSize: '1.25rem',
        color: 'var(--text-secondary)'
      }}>
        <Hourglass size={24} className="animate-spin" />
        Chargement des statistiques...
      </div>
    )
  }

  if (statsIsError) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        fontSize: '1.25rem',
        color: 'var(--error)',
        backgroundColor: 'var(--error-bg)',
        borderRadius: '0.5rem',
        border: '1px solid var(--error)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem'
      }}>
        <AlertCircle size={24} />
        <div>
          <div>❌ Erreur lors du chargement du tableau de bord</div>
          <button
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
            onClick={() => refetch()}
          >
            <RotateCcw /> Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '600',
        color: 'var(--primary)',
        marginBottom: '2rem'
      }}>
        Tableau de Bord Administrateur
      </h1>

      {/* 🟦 STATISTIQUES GÉNÉRALES */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Statistiques Générales
          </h2>
        </div>
        <div className="card-content">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <StatCard
              title="Utilisateurs"
              count={stats?.usersCount || 0}
              icon={<Users size={24} />}
              onClick={() => setActiveSection('users')}
              clickable
              variant="primary"
              loading={statsLoading}
            />
            <StatCard
              title="Classes"
              count={stats?.classroomsCount || 0}
              icon={<School size={24} />}
              onClick={() => setActiveSection('classrooms')}
              clickable
              variant="info"
            />
            <StatCard
              title="Progressions"
              count={stats?.progressionsCount || 0}
              icon={<BarChart2 size={24} />}
              onClick={() => setActiveSection('progressions')}
              clickable
              variant="success"
            />
            <StatCard
              title="Services"
              count={stats?.menusCount || 0}
              icon={<Utensils size={24} />}
              onClick={() => setActiveSection('services')}
              clickable
              variant="warning"
            />
          </div>
        </div>
      </div>

      {/* 🧩 SECTION DYNAMIQUE AFFICHÉE SELON LA STATCARD */}
      {activeSection && (
        <div className="mt-6">
          <DashboardSection
            section={activeSection}
            onOpenUserModal={() => setShowUserModal(true)}
            onOpenClassroomModal={() => {
              setEditingClassroom(null);
              setShowClassroomModal(true);
            }}
            onEditClassroom={(classroom) => {
              setEditingClassroom(classroom);
              setShowClassroomModal(true);
            }}
          />
        </div>
      )}

      {/* ⚡ MODALE AJOUT UTILISATEUR */}
      {showUserModal && (
        <UserModal
          isOpen={true}
          mode="create"
          onClose={() => setShowUserModal(false)}
          onSuccess={() => {
            setShowUserModal(false);
            refetch();
          }}
        />
      )}

      {/* ⚡ MODALE AJOUT/ÉDITION CLASSE */}
      {showClassroomModal && (
        <ClassroomModal
          isOpen
          onClose={() => {
            setShowClassroomModal(false);
            setEditingClassroom(null);
          }}
          mode={editingClassroom ? 'edit' : 'create'}
          classroom={editingClassroom}
          onSuccess={() => {
            setShowClassroomModal(false);
            setEditingClassroom(null);
            refetch();
          }}
        />
      )}

      {/* 🔍 INFOS DE DEBUG */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            🔍 Debug Information
          </h2>
        </div>
        <div className="card-content">
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--primary-pale)',
            borderRadius: '0.375rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            <p><strong>Stats Loading:</strong> {statsLoading ? 'true' : 'false'}</p>
            <p><strong>Stats Error:</strong> {statsIsError ? 'true' : 'false'}</p>
            <p><strong>Users Count:</strong> {stats?.usersCount}</p>
            <p><strong>Classrooms Count:</strong> {stats?.classroomsCount}</p>
            <p><strong>Progressions Count:</strong> {stats?.progressionsCount}</p>
            <p><strong>Menus Count:</strong> {stats?.menusCount}</p>
            <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />
            <p><strong>Modal Open:</strong> {showUserModal ? 'true' : 'false'}</p>
            <p><strong>Users Loading:</strong> {usersLoading ? 'true' : 'false'}</p>
            <p><strong>Users Error:</strong> {usersError?.data?.message || 'null'}</p>
            <p><strong>Users Data Length:</strong> {usersData?.users?.length || 0}</p>
            <p><strong>Current User:</strong> {currentUser?.firstname} {currentUser?.lastname}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
