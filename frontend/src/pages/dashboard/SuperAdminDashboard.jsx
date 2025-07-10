// frontend/src/pages/dashboard/SuperAdminDashboard.jsx
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats } from '../../store/slices/dashboardSlice'
import { useGetAllUsersQuery } from '../../store/api/usersApi'
import StatCard from '../../components/common/StatCard'
import DashboardSection from '../../pages/dashboard/DashboardSection'
import UserModal from '../../pages/users/UserModal'
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

  const dispatch = useDispatch()
  const {
    usersCount,
    classroomsCount,
    progressionsCount,
    menusCount,
    loading: statsLoading,
    error: statsError
  } = useSelector(state => state.dashboard)

  const usersQuery = useGetAllUsersQuery(undefined, {
    skip: !showUserModal,
    refetchOnMountOrArgChange: true
  })
  const usersData = usersQuery?.data;
  const usersLoading = usersQuery?.isLoading;
  const usersError = usersQuery?.error;

  const { user: currentUser } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

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

  if (statsError) {
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
          <div>❌ Erreur : {statsError}</div>
          <button
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
            onClick={() => dispatch(fetchDashboardStats())}
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
              count={usersCount || 0}
              icon={<Users size={24} />}
              onClick={() => setActiveSection('users')}
              clickable
              variant="primary"
              loading={statsLoading}
            />
            <StatCard
              title="Classes"
              count={classroomsCount || 0}
              icon={<School size={24} />}
              onClick={() => setActiveSection('classrooms')}
              clickable
              variant="info"
            />
            <StatCard
              title="Progressions"
              count={progressionsCount || 0}
              icon={<BarChart2 size={24} />}
              onClick={() => setActiveSection('progressions')}
              clickable
              variant="success"
            />
            <StatCard
              title="Menus"
              count={menusCount || 0}
              icon={<Utensils size={24} />}
              onClick={() => setActiveSection('menus')}
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
          />
        </div>

      )}
      {/* ⚡ MODALE AJOUT UTILISATEUR */}
      {showUserModal && (
        <UserModal
          mode="create"
          onClose={() => setShowUserModal(false)}
          onSuccess={() => {
            // Refetch users or refresh logic if needed
            setShowUserModal(false)
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
            <p><strong>Stats Error:</strong> {statsError || 'null'}</p>
            <p><strong>Users Count:</strong> {usersCount}</p>
            <p><strong>Classrooms Count:</strong> {classroomsCount}</p>
            <p><strong>Progressions Count:</strong> {progressionsCount}</p>
            <p><strong>Menus Count:</strong> {menusCount}</p>
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
