import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setActiveCalendar } from "../../store/slices/calendarSessionSlice";
import { useGetAllCalendarsQuery } from "../../store/api/calendarApi"; // Adapte le chemin si besoin

/**
 * Composant SessionSelector
 * Affiche un <select> pour choisir la session académique active.
 * Met à jour Redux ET localStorage.
 */
const SessionSelector = () => {
  const dispatch = useDispatch();

  // Récupère la session active dans Redux
  const { activeCalendarId } = useSelector((state) => state.calendarSession);

  // Récupère toutes les sessions via RTK Query
  const { data, isLoading, error } = useGetAllCalendarsQuery();

  // Liste des sessions (calendriers)
  const calendars = useMemo(() => data?.calendars || [], [data]);
  // 👉 **Filtre les sessions actives uniquement**
  const activeCalendars = useMemo(
    () => calendars.filter(c => c.active),
    [calendars]
  );

  // Sélection initiale (si aucune session active, sélectionne la première dispo)
  useEffect(() => {
    if (!activeCalendarId && activeCalendars.length > 0) {
      dispatch(
        setActiveCalendar({
          id: activeCalendars[0]._id,
          label: activeCalendars[0].label,
        })
      );
    }
  }, [activeCalendarId, activeCalendars, dispatch]);

  // Handler sur le changement de select
  const handleChange = (e) => {
    const selectedId = e.target.value;
    const selectedCalendar = activeCalendars.find((c) => c._id === selectedId);
    if (selectedCalendar) {
      dispatch(
        setActiveCalendar({
          id: selectedCalendar._id,
          label: selectedCalendar.label,
        })
      );
    }
  };

  if (isLoading) return <span>Chargement des sessions...</span>;
  if (error) return <span>Erreur lors du chargement des sessions.</span>;

  return (
    <div className="session-selector">
      <label htmlFor="session-select" className="session-label">
        Session :
      </label>
      <select
        id="session-select"
        value={activeCalendarId || ""}
        onChange={handleChange}
        className="session-select"
      >
        {activeCalendars.map((calendar) => (
          <option key={calendar._id} value={calendar._id}>
            {calendar.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SessionSelector;
