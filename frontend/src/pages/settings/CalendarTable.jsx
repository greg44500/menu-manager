import { useState, useMemo } from 'react'
import { Edit3, Trash2 } from 'lucide-react'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import EditCalendarModal from './EditCalendarModal'
import { useDeleteCalendarMutation } from '../../store/api/calendarApi'
import toast from 'react-hot-toast'
import { format, getISOWeek } from "date-fns"
import { fr } from "date-fns/locale"

// TABLEAU DES CALENDRIERS SCOLAIRES (sessions)
// --------------------------------------------

const CalendarTable = ({
  calendars = [],
  isLoading = false,
  error = null,
  onDataChange = () => { },
}) => {
  // --- ÉTAT LOCAL POUR L'EDITION ---
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCalendar, setSelectedCalendar] = useState(null)

  // --- HOOK RTK QUERY POUR SUPPRESSION ---
  const [deleteCalendar, { isLoading: isDeleting }] = useDeleteCalendarMutation()

  // --- HANDLER METIER : SUPPRESSION ---
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

  // --- HANDLER METIER : EDITION ---
  const handleEdit = (calendar) => {
    setSelectedCalendar(calendar)
    setEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    setEditModalOpen(false)
    setSelectedCalendar(null)
    onDataChange()
  }

  // --- DEFINITION DES COLONNES ---
  const columns = useMemo(() => [
    {
      accessorKey: 'label',
      header: 'Session',
      cell: ({ row }) => (
        row.original.active ? (
          <span className="badge-session-active badge-success">
            {row.original.label}
          </span>
        ) : (
          <span>
            {row.original.label}
          </span>
        )
      ),
    },
    {
      accessorKey: 'period',
      header: 'Période',
      cell: ({ row }) => {
        const start = row.original.startDate ? new Date(row.original.startDate) : null
        const end = row.original.endDate ? new Date(row.original.endDate) : null
        return (
          <span>
            {" du "}
            {start && (
              <>
                {format(start, "dd/MM/yyyy", { locale: fr })}
                <span className="text-xs text-gray-400 ml-1">&nbsp;<strong>(S{getISOWeek(start)})</strong></span>
              </>
            )}
            {" au "}
            {end && (
              <>
                {format(end, "dd/MM/yyyy", { locale: fr })}
                <span className="text-xs text-gray-400 ml-1">&nbsp;<strong>(S{getISOWeek(end)})</strong></span>
              </>
            )}
          </span>
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
  ], [])

  // --- ACTIONS PAR LIGNE (EDIT / DELETE) ---
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

  // --- AFFICHAGE / ERREURS / LOADING ---
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

  // --- RENDU PRINCIPAL DU TABLEAU ---
  return (
    <>
      <DataTable
        columns={columns}
        data={calendars}
        isLoading={isLoading}
        rowActions={rowActions}
        pageSize={8}
      />

      {/* --- MODALE D'EDITION --- */}
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
