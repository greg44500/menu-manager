import { useState } from 'react'
import { useDispatch } from "react-redux"
import Modal from '../../components/common/Modal'
import CalendarTable from './CalendarTable'
import CreateCalendarModal from './CreateCalendarModal'
import { useGetAllCalendarsQuery } from '../../store/api/calendarApi'
import { setActiveCalendar } from "../../store/slices/calendarSessionSlice"

/**
 * SECTION DE GESTION DES CALENDRIERS (Sessions scolaires)
 * -------------------------------------------------------
 * - Affiche la liste des calendriers (tableau)
 * - Permet la création d’un calendrier (modale)
 * - Rafraîchit la liste et sélectionne auto la session créée
 */

const CalendarSection = () => {
  // --- ETATS LOCAUX ---
  // Contrôle ouverture de la modale de création
  const [showCreateModal, setShowCreateModal] = useState(false)

  // --- HOOK REDUX POUR LA SÉLECTION ---
  const dispatch = useDispatch()

  // --- RTK QUERY : RÉCUPERATION DES CALENDRIERS ---
  const {
    data: calendarsData,
    isLoading,
    error,
    refetch
  } = useGetAllCalendarsQuery()

  // Liste des calendriers (sessions)
  const calendars = calendarsData?.calendars || []

  // --- CALLBACK POUR RAFRAÎCHIR LA LISTE APRÈS UNE MUTATION ---
  const handleDataChange = () => {
    refetch() // Rafraîchit la liste côté front
  }

  // --- CALLBACK APRÈS CRÉATION D’UN CALENDRIER ---
  // Sélectionne automatiquement la nouvelle session comme active
  const handleCalendarCreated = (createdCalendarId) => {
    refetch()
    if (createdCalendarId && calendars.length) {
      // Recherche du calendrier fraichement créé dans la liste
      const created = calendars.find(c => c._id === createdCalendarId)
      if (created) {
        dispatch(setActiveCalendar({
          id: created._id,
          label: created.label,
        }))
      }
    }
    setShowCreateModal(false) // Ferme la modale
  }

  // --- RENDU PRINCIPAL ---
  return (
    <div className="card">
      {/* ----------- HEADER / ACTION ----------- */}
      <div className="card-header container-service-location-section">
        <h2>Calendriers scolaires</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Ajouter un calendrier
        </button>
      </div>

      {/* ----------- TABLEAU PRINCIPAL ----------- */}
      <div className="card-content">
        <CalendarTable
          onDataChange={handleDataChange}
          isLoading={isLoading}
          error={error}
          calendars={calendars}
        />
      </div>

      {/* ----------- MODALE DE CRÉATION ----------- */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Créer un calendrier"
        >
          <CreateCalendarModal
            onClose={() => setShowCreateModal(false)}
            onCreated={handleCalendarCreated}
          />
        </Modal>
      )}
    </div>
  )
}

export default CalendarSection
