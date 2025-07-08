// frontend/src/pages/dashboard/SuperAdminDashboard.jsx
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats } from '../../store/slices/dashboardSlice'
import StatCard from '../../components/common/StatCard'
import { Users, School, BarChart2, Utensils, Hourglass } from 'lucide-react'

// COMPONENTS IMPORT - Commenté temporairement pour debug
// import UserTable from '../../pages/users/UserTable'

const SuperAdminDashboard = () => {
  console.log('🔥 SuperAdminDashboard RENDU !')

  const dispatch = useDispatch()
  const {
    usersCount,
    classroomsCount,
    progressionsCount,
    menusCount,
    loading,
    error
  } = useSelector(state => state.dashboard)

  useEffect(() => {
    console.log('🔥 useEffect Dashboard appelé')
    dispatch(fetchDashboardStats())
  }, [dispatch])

  // Debug des données
  console.log('Dashboard state:', {
    usersCount,
    classroomsCount,
    progressionsCount,
    menusCount,
    loading,
    error
  })

  if (loading) {
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
        <Hourglass size={24} />
        Chargement des statistiques...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        fontSize: '1.25rem',
        color: 'var(--error)',
        backgroundColor: 'var(--error-bg)',
        borderRadius: '0.5rem'
      }}>
        ❌ Erreur : {error}
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

      {/* 🔥 SECTION STATS */}
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
            />
            <StatCard
              title="Classes"
              count={classroomsCount || 0}
              icon={<School size={24} />}
            />
            <StatCard
              title="Progressions"
              count={progressionsCount || 0}
              icon={<BarChart2 size={24} />}
            />
            <StatCard
              title="Menus"
              count={menusCount || 0}
              icon={<Utensils size={24} />}
            />
          </div>
        </div>
      </div>

      {/* 🔥 SECTION DEBUG - Temporaire */}
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
            <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
            <p><strong>Error:</strong> {error || 'null'}</p>
            <p><strong>Users Count:</strong> {usersCount}</p>
            <p><strong>Classrooms Count:</strong> {classroomsCount}</p>
            <p><strong>Progressions Count:</strong> {progressionsCount}</p>
            <p><strong>Menus Count:</strong> {menusCount}</p>
          </div>
        </div>
      </div>

      {/* 🔥 SECTION UTILISATEURS - UserTable commenté pour debug */}
      <div className="card">
        <div className="card-header">
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Gestion des Utilisateurs
          </h2>
        </div>
        <div className="card-content">
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--surface-hover)',
            borderRadius: '0.375rem',
            border: '2px dashed var(--border)'
          }}>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
              📊 UserTable sera affiché ici
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              (Temporairement désactivé pour debug)
            </p>
          </div>
          {/* <UserTable /> */}
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard