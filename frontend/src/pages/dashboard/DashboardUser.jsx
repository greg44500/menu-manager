// src/pages/dashboard/DashboardUser.jsx

import { useState } from 'react'
import { useSelector } from 'react-redux'
import StatCard from '../../components/common/StatCard'
import UserProgressionsSection from './dashboardUser/UserProgressionSection'
import UserClassesSection from './dashboardUser/UserClassesSection'
import { useGetProgressionsByTeacherQuery } from '../../store/api/progressionsApi'
import { useGetClassroomsByTeacherQuery } from '../../store/api/classroomsApi'
import { BarChart2, School } from 'lucide-react'

/**
 * DashboardUser
 * -------------
 * Affiche le tableau de bord du formateur avec:
 *  - Statistiques (classes/progressions assignées)
 *  - Section dynamique selon la carte sélectionnée
 * Style identique au SuperAdminDashboard
 */

const DashboardUser = () => {
  // --- Récupération utilisateur et données d'affichage ---
  const user = useSelector(state => state.auth.user)

  // IDs des entités assignées - PROGRESSIONS
  const {
    data: assignedProgressionsData = [],
    isLoading: progressionsLoading
  } = useGetProgressionsByTeacherQuery(user?.id, {
    skip: !user?.id
  })

  // IDs des entités assignées - CLASSES
  const {
    data: assignedClassroomsData = {},
    isLoading: classroomsLoading
  } = useGetClassroomsByTeacherQuery(user?.id, {
    skip: !user?.id // Ne pas faire la requête si pas d'utilisateur
  })

  const assignedClassrooms = assignedClassroomsData?.classrooms || []
  const assignedProgressions = assignedProgressionsData || []

  // --- State : tab actif (progression ou classes) ---
  // "progressions" = par défaut
  const [activeSection, setActiveSection] = useState('progressions')

  // --- Handler pour changer de section ---
  const handleSectionChange = (section) => setActiveSection(section)

  return (
    <div>
      {/* --- HEADER IDENTIQUE --- */}
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '600',
        color: 'var(--primary)',
        marginBottom: '2rem'
      }}>
        Mon Tableau de Bord
      </h1>

      {/* --- STATISTIQUES PERSONNELLES --- */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-header-title">
            Mes Assignations
          </h2>
        </div>
        <div className="card-content">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <StatCard
              title="Classes assignées"
              count={assignedClassrooms.length}
              icon={<School size={24} />}
              onClick={() => handleSectionChange('classes')}
              clickable
              variant="info"
              loading={classroomsLoading}
            />
            <StatCard
              title="Progressions assignées"
              count={assignedProgressions.length}
              icon={<BarChart2 size={24} />}
              onClick={() => handleSectionChange('progressions')}
              clickable
              variant="success"
              loading={progressionsLoading}
            />
          </div>
        </div>
      </div>

      {/* --- SECTION DYNAMIQUE : progressions ou classes --- */}
      {activeSection && (
        <div >
          {activeSection === 'progressions' && (
            <div className='card'>
              <div className='card-header'>
                <h1 className="card-header-title">Mes Progressions</h1>
              </div>
              <div className='card-content'>
                <UserProgressionsSection progressions={assignedProgressions} />
              </div>
            </div>
          )}

          {activeSection === 'classes' && (
            <div className='card'>
              <div className='card-header'>
                <h1 className="card-header-title">Mes classes</h1>
              </div>
              <div className='card-content'>
                <UserClassesSection classes={assignedClassrooms} />
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DashboardUser