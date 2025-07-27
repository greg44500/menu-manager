import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useCreateCalendarMutation } from '../../store/api/calendarApi'
import DatePicker from '../../components/common/DatePicker'
import { isMonday } from 'date-fns'

/**
 * MODALE DE CRÉATION DE CALENDRIER (SESSION)
 * - Utilise le composant DatePicker (react-day-picker)
 * - Validation : label requis, lundi uniquement, date fin > date début
 */
const CreateCalendarModal = ({
  onClose = () => { },
  onCreated = () => { },
}) => {
  // --- ÉTATS FORMULAIRE ---
  const [label, setLabel] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState(null)

  // --- RTK QUERY (mutation) ---
  const [createCalendar, { isLoading }] = useCreateCalendarMutation()

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
      await createCalendar({
        label: label.trim(),
        startDate,
        endDate,
        active,
        holidays: [],
        events: [],
      }).unwrap()
      toast.success("Calendrier créé avec succès")
      onClose()
      onCreated(createCalendar._id)
    } catch (err) {
      const msg = err?.data?.message || "Erreur lors de la création"
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

      {/* Switch pour activation */}
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
          {isLoading ? "Création..." : "Créer"}
        </button>
      </div>
    </form>
  )
}

export default CreateCalendarModal
