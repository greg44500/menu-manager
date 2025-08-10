import { useState, useMemo } from 'react'
import { Edit3, Trash2 } from 'lucide-react'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import EditCalendarModal from './EditCalendarModal'
import { useDeleteCalendarMutation } from '../../store/api/calendarApi'
import toast from 'react-hot-toast'
import { getISOWeek } from "date-fns"


// Helpers pour gérer les valeurs des <input type="date">
const toInputDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  // Corrige le décalage timezone pour affichage dans input date
  const tz = d.getTimezoneOffset()
  const local = new Date(d.getTime() - tz * 60000)
  return local.toISOString().slice(0, 10) // yyyy-MM-dd
}

const fromInputDate = (value) => {
  if (!value) return null
  // Normalise à 12:00 UTC pour éviter les glissements de fuseau
  return new Date(`${value}T12:00:00.000Z`).toISOString()
}

// TABLEAU DES CALENDRIERS SCOLAIRES (sessions)
const CalendarTable = ({
  calendars = [],
  isLoading = false,
  error = null,
  onDataChange = () => { },
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCalendar, setSelectedCalendar] = useState(null)

  // état local pour les valeurs inline (sans toucher à l’API)
  const [draftDates, setDraftDates] = useState({}) // { [calendarId]: { startDate: string, endDate: string } }

  const [deleteCalendar, { isLoading: isDeleting }] = useDeleteCalendarMutation()

  const handleDelete = async (calendar) => {
    if (!window.confirm(`Supprimer le calendrier "${calendar.label}" ?`)) return
    try {
      await deleteCalendar(calendar._id).unwrap()
      toast.success('Calendrier supprimé avec succès')
      onDataChange()
    } catch (err) {
      toast.error(err?.data?.message || "Erreur lors de la suppression")
      console.error('Erreur suppression calendrier:', err)
    }
  }

  const handleEdit = (calendar) => {
    setSelectedCalendar(calendar)
    setEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    setEditModalOpen(false)
    setSelectedCalendar(null)
    onDataChange()
  }

  const handleInlineDateChange = (calendarId, field, value) => {
    setDraftDates((prev) => ({
      ...prev,
      [calendarId]: {
        ...(prev[calendarId] || {}),
        [field]: value, // value est déjà au format yyyy-MM-dd
      },
    }))
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'label',
      header: 'Session',
      cell: ({ row }) =>
        row.original.active ? (
          <span className="badge-session-active badge-success">{row.original.label}</span>
        ) : (
          <span>{row.original.label}</span>
        ),
    },
    {
      accessorKey: 'period',
      header: 'Période',
      cell: ({ row }) => {
        const cal = row.original
        const draft = draftDates[cal._id] || {}
        const startInput = draft.startDate ?? toInputDate(cal.startDate)
        const endInput = draft.endDate ?? toInputDate(cal.endDate)

        const startWeek = startInput ? getISOWeek(new Date(fromInputDate(startInput))) : null
        const endWeek = endInput ? getISOWeek(new Date(fromInputDate(endInput))) : null

        return (
          <div>
            <div>
              <strong>Commence le :</strong>
              <input
                type="date"
                className=" input input-calendar"
                value={startInput}
                onChange={(e) => handleInlineDateChange(cal._id, 'startDate', e.target.value)}
                aria-label="Date de début"
              />
              {startInput && (
                <span className="text-xs text-text-muted">
                  <strong>Semaine{startWeek}</strong>
                </span>
              )}
            </div>

            <div>
              <strong>Se Termine le :</strong>
              <input
                type="date"
                className=" input input-calendar"
                value={endInput}
                onChange={(e) => handleInlineDateChange(cal._id, 'endDate', e.target.value)}
                aria-label="Date de fin"
              />
              {endInput && (
                <span className="text-xs text-text-muted">
                  <strong>Semaine {endWeek}</strong>
                </span>
              )}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'holidays',
      header: 'Vacances',
      cell: ({ row }) => (row.original.holidays?.length || 0),
    },
    {
      accessorKey: 'events',
      header: 'Evénements',
      cell: ({ row }) => (row.original.events?.length || 0),
    },
  ], [draftDates])

  const rowActions = (calendar) => (
    <div className="flex gap-2">
      <button
        className="icon-button"
        title="Editer"
        onClick={() => handleEdit(calendar)}
      >
        <Edit3 size={18} />
      </button>
      <button
        className="icon-button"
        title="Supprimer"
        onClick={() => handleDelete(calendar)}
        disabled={isDeleting}
      >
        <Trash2 size={18} />
      </button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="datatable-loading">
        <div className="loader" /> Chargement des calendriers...
      </div>
    )
  }
  if (error) {
    return (
      <div className="alert alert-error">
        <p>Erreur de chargement des calendriers</p>
        <p>{error.data?.message || 'Une erreur est survenue'}</p>
      </div>
    )
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={calendars}
        isLoading={isLoading}
        rowActions={rowActions}
        pageSize={8}
      />

      {editModalOpen && selectedCalendar && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Modifier le calendrier"
        >
          <EditCalendarModal
            calendar={selectedCalendar}
            onClose={() => setEditModalOpen(false)}
            onUpdated={handleEditSuccess}
          />
        </Modal>
      )}
    </>
  )
}

export default CalendarTable
