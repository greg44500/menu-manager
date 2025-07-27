import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useUpdateCalendarMutation } from '../../store/api/calendarApi'
import DatePicker from '../../components/common/DatePicker'
import { isMonday } from 'date-fns'

/**
 * MODALE D'ÉDITION DE CALENDRIER (SESSION)
 * - Préremplissage des champs depuis calendar (label, startDate, endDate, active)
 * - Utilisation du DatePicker custom (lundi only, semaine affichée)
 * - Validation UX et retours d'erreur design system
 * - Envoie l'ID du calendrier édité via onUpdated (si besoin pour auto-sélection)
 */
const EditCalendarModal = ({
  calendar,         // ← Objet calendrier à éditer (prérempli)
  onClose = () => { },
  onUpdated = () => {  },
}) => {
  // --- ÉTATS FORMULAIRE ---
  const [label, setLabel] = useState(calendar?.label || '')
  const [startDate, setStartDate] = useState(calendar?.startDate ? new Date(calendar.startDate) : null)
  const [endDate, setEndDate] = useState(calendar?.endDate ? new Date(calendar.endDate) : null)
  const [active, setActive] = useState(!!calendar?.active)
  const [error, setError] = useState(null)

  // --- EFFET DE SYNCHRO SI CHANGEMENT DE CALENDAR EN PROP ---
  useEffect(() => {
    setLabel(calendar?.label || '')
    setStartDate(calendar?.startDate ? new Date(calendar.startDate) : null)
    setEndDate(calendar?.endDate ? new Date(calendar.endDate) : null)
    setActive(!!calendar?.active)
    setError(null)
  }, [calendar])

  // --- MUTATION RTK QUERY POUR UPDATE ---
  const [updateCalendar, { isLoading }] = useUpdateCalendarMutation()

  // --- VALIDATION FORM ---
  const validate = () => {
    if (!label.trim()) {
      setError("Le nom de la session est requis")
      toast.error("Veuillez indiquer un nom de session (ex: 2025-2026)")
      return false
    }
    if (!startDate || !endDate) {
      setError("Les deux dates sont obligatoires")
      toast.error("Sélectionnez la date de début ET la date de fin")
      return false
    }
    if (!isMonday(startDate) || !isMonday(endDate)) {
      setError("Les dates doivent être des lundis")
      toast.error("Veuillez sélectionner des lundis (début et fin)")
      return false
    }
    if (startDate >= endDate) {
      setError("La date de fin doit être postérieure à la date de début")
      toast.error("La date de fin doit être postérieure à la date de début")
      return false
    }
    return true
  }

  // --- SOUMISSION DU FORMULAIRE ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!validate()) return
    try {
      const updatedCalendar = await updateCalendar({
        id: calendar._id,
        label: label.trim(),
        startDate,
        endDate,
        active,
        holidays: calendar?.holidays || [],
        events: calendar?.events || [],
      }).unwrap()
      toast.success("Calendrier modifié avec succès")
      onClose()
      // Passe l'ID du calendrier édité au parent (utile si tu veux sélectionner cette session)
      if (onUpdated && updatedCalendar && updatedCalendar._id) {
        onUpdated(updatedCalendar._id)
      } else {
        onUpdated() // fallback si besoin
      }
    } catch (err) {
      const msg = err?.data?.message || "Erreur lors de la modification"
      setError(msg)
      toast.error(msg)
    }
  }

  // --- RENDU PRINCIPAL ---
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-2">
      {/* Nom de la session */}
      <div>
        <label className="label" htmlFor="label">Nom de la session</label>
        <input
          id="label"
          type="text"
          className="input w-full"
          placeholder="Ex : 2025-2026"
          value={label}
          onChange={e => setLabel(e.target.value)}
          autoFocus
        />
      </div>

      {/* DatePicker début */}
      <DatePicker
        id="startDate"
        label="Lundi de la rentrée"
        date={startDate}
        setDate={setStartDate}
        mondayOnly
        showWeekNumber
      />

      {/* DatePicker fin */}
      <DatePicker
        id="endDate"
        label="Lundi des grandes vacances"
        date={endDate}
        setDate={setEndDate}
        mondayOnly
        showWeekNumber
      />

      {/* Switch activation */}
      <div className="switch-display">
        <input
          id="active"
          type="checkbox"
          checked={active}
          onChange={e => setActive(e.target.checked)}
          className="switch"
        />
        <label htmlFor="active">Session active</label>
      </div>

      {/* Erreur inline */}
      {error && <p className="form-error">{error}</p>}

      {/* Boutons */}
      <div className="flex gap-2 justify-end mt-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
          disabled={isLoading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? "Modification..." : "Enregistrer"}
        </button>
      </div>
    </form>
  )
}

export default EditCalendarModal
