// frontend/src/pages/dashboard/SuperAdminDashboard.jsx
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats } from '../../store/slices/dashboardSlice'
import { useGetAllUsersQuery } from '../../store/api/usersApi' // ← NOUVEAU
import StatCard from '../../components/common/StatCard'
import Modal from '../../components/common/Modal'
import { Users, School, BarChart2, Utensils, Hourglass, AlertCircle, RotateCcw } from 'lucide-react'

/**
 * DASHBOARD SUPER ADMIN
 * 
 * POURQUOI cette architecture ?
 * - fetchDashboardStats() : Récupère les COMPTEURS (performances optimisées)
 * - useGetAllUsersQuery() : Récupère les DONNÉES COMPLÈTES (pour la modale)
 * - Séparation des responsabilités : stats VS données détaillées
 */

const SuperAdminDashboard = () => {

  // ÉTATS LOCAUX
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false)

  // REDUX - STATISTIQUES GÉNÉRALES
  const dispatch = useDispatch()
  const {
    usersCount,
    classroomsCount,
    progressionsCount,
    menusCount,
    loading: statsLoading,
    error: statsError
  } = useSelector(state => state.dashboard)

  // RTK QUERY - DONNÉES UTILISATEURS COMPLÈTES
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useGetAllUsersQuery(undefined, {
    // OPTIMISATION : Ne charge que si modal ouverte
    skip: !isUsersModalOpen,

    refetchOnMountOrArgChange: true,
  })

  //  AUTHENTIFICATION UTILISATEUR ACTUEL
  const { user: currentUser } = useSelector(state => state.auth)

  //  HANDLERS
  const handleOpenUsersModal = () => {
    setIsUsersModalOpen(true)
  }

  const handleCloseUsersModal = () => {
    setIsUsersModalOpen(false)
  }

  //  CHARGEMENT INITIAL DES STATS
  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  //  DEBUG COMPLET
  console.log('Dashboard state:', {
    // Stats générales
    usersCount,
    classroomsCount,
    progressionsCount,
    menusCount,
    statsLoading,
    statsError,
    // Données utilisateurs
    usersData,
    usersLoading,
    usersError,
    // UI
    isUsersModalOpen,
    currentUser
  })

  // ÉTAT DE CHARGEMENT GLOBAL
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

  //  GESTION DES ERREURS STATS
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

      {/* 🔥 SECTION STATS CLIQUABLES */}
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
            {/* ⚡ CARTE UTILISATEURS - CLIQUABLE */}
            <StatCard
              title="Utilisateurs"
              count={usersCount || 0}
              icon={<Users size={24} />}
              onClick={handleOpenUsersModal}
              clickable={true}
              variant="primary"
              loading={statsLoading}
              hoverText="Cliquer pour voir la liste complète"
            />

            {/* AUTRES CARTES - NON CLIQUABLES POUR L'INSTANT */}
            <StatCard
              title="Classes"
              count={classroomsCount || 0}
              icon={<School size={24} />}
              clickable={false}
              variant="info"
            />
            <StatCard
              title="Progressions"
              count={progressionsCount || 0}
              icon={<BarChart2 size={24} />}
              clickable={false}
              variant="success"
            />
            <StatCard
              title="Menus"
              count={menusCount || 0}
              icon={<Utensils size={24} />}
              clickable={false}
              variant="warning"
            />
          </div>
        </div>
      </div>

      {/* 🔥 SECTION DEBUG - À GARDER TEMPORAIREMENT */}
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

            <p><strong>Modal Open:</strong> {isUsersModalOpen ? 'true' : 'false'}</p>
            <p><strong>Users Loading:</strong> {usersLoading ? 'true' : 'false'}</p>
            <p><strong>Users Error:</strong> {usersError?.data?.message || 'null'}</p>
            <p><strong>Users Data Length:</strong> {usersData?.users?.length || 0}</p>
            <p><strong>Current User:</strong> {currentUser?.firstname} {currentUser?.lastname}</p>
          </div>
        </div>
      </div>

      {/* 🔥 SECTION ACTIONS RAPIDES */}
      <div className="card">
        <div className="card-header">
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Actions Rapides
          </h2>
        </div>
        <div className="card-content">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <button
              className="btn btn-primary"
              onClick={handleOpenUsersModal}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Users size={18} />
              Gérer les Utilisateurs
            </button>

            <button
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <School size={18} />
              Gérer les Classes
            </button>

            <button
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <BarChart2 size={18} />
              Voir Progressions
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => {
                dispatch(fetchDashboardStats())
                if (isUsersModalOpen) refetchUsers()
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              🔄 Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* 🎯 MODALE UTILISATEURS AVEC DONNÉES RÉELLES */}
      <Modal
        isOpen={isUsersModalOpen}
        onClose={handleCloseUsersModal}
        title={`👥 Gestion des Utilisateurs`}
        // ⚡ PASSAGE DES DONNÉES UTILISATEURS
        usersData={usersData?.users || []} // Format: { users: [...], count: n }
        currentUser={currentUser}
        // 🎨 GESTION DU LOADING DANS LA MODALE
        isLoading={usersLoading}
        error={usersError}
        onRefresh={refetchUsers}
      >
        {/* 🔄 GESTION DES ÉTATS DANS LA MODALE */}
        {usersLoading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-muted)'
          }}>
            <Hourglass size={32} className="animate-spin" style={{ marginBottom: '1rem' }} />
            <p>Chargement des utilisateurs...</p>
          </div>
        )}

        {usersError && !usersLoading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--error)',
            backgroundColor: 'var(--error-bg)',
            borderRadius: '0.5rem',
            margin: '1rem'
          }}>
            <AlertCircle size={32} style={{ marginBottom: '1rem' }} />
            <p>Erreur : {usersError?.data?.message || 'Impossible de charger les utilisateurs'}</p>
            <button
              className="btn btn-primary"
              onClick={refetchUsers}
              style={{ marginTop: '1rem' }}
            >
              🔄 Réessayer
            </button>
          </div>
        )}

        {!usersLoading && !usersError && (!usersData?.users?.length) && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-muted)'
          }}>
            <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Aucun utilisateur trouvé</p>
          </div>
        )}
      </Modal>

    </div>
  )
}

export default SuperAdminDashboard