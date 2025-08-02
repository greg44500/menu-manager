// ServiceSection.jsx
import React, { useState, useMemo } from 'react'
import { getISOWeek } from 'date-fns'
import { useSelector } from 'react-redux'
import { useGetAllProgressionsQuery } from '../../store/api/progressionsApi'
import { useGetServicesByProgressionQuery } from '../../store/api/servicesApi'
import { useGetAllCalendarsQuery } from '../../store/api/calendarApi'
import ProgressionSummaryPanel from './ProgressionSummaryPanel'
import ServiceTablePanel from './ServiceTablePanel'

const ServiceSection = () => {
    // Etat pour la progression sélectionnée
    const [selectedProgressionId, setSelectedProgressionId] = useState(null)

    // Redux: session académique active
    const activeCalendarId = useSelector(state => state.calendarSession.activeCalendarId)

    // Requêtes RTK Query
    const { data: calendarsData, isLoading: loadingCalendars } = useGetAllCalendarsQuery()
    const { data: rawProgressions, isLoading: loadingProgressions } = useGetAllProgressionsQuery()
    const progressions = useMemo(() => rawProgressions?.data || [], [rawProgressions])

    // Session académique active trouvée via Redux
    const activeSession = useMemo(() => {
        if (!activeCalendarId) return null
        return (calendarsData?.calendars || []).find(cal => cal._id === activeCalendarId)
    }, [calendarsData, activeCalendarId])
    // Réccupération de la semaine exacte
    const startWeek = useMemo(() => {
        if (activeSession && activeSession.startDate) {
            return getISOWeek(new Date(activeSession.startDate))
        }
        // fallback si session absente
        return 35
    }, [activeSession])

    // Progressions filtrées par calendrier/session active (utilisation du champ .calendar !)
    const filteredProgressions = useMemo(() => {
        if (!activeCalendarId) return []
        return progressions.filter(prog =>
            prog.calendar === activeCalendarId ||
            (typeof prog.calendar === 'object' && prog.calendar._id === activeCalendarId)
        )
    }, [progressions, activeCalendarId])

    // Quand la session active change, on réinitialise la sélection pour éviter un id orphelin
    React.useEffect(() => {
        setSelectedProgressionId(null)
    }, [activeCalendarId])

    // Progression actuellement sélectionnée (objet complet, toujours dans la liste filtrée !)
    const selectedProgression = useMemo(
        () => filteredProgressions.find(p => p._id === selectedProgressionId),
        [filteredProgressions, selectedProgressionId]
    )

    // Services liés à la progression sélectionnée
    const {
        data: services = {},
        isLoading: loadingServices,
        refetch: refetchServices,
    } = useGetServicesByProgressionQuery(selectedProgressionId, {
        skip: !selectedProgressionId
    })

    // Liste de tous les services triés par semaine (corrigé pour années scolaires décalées)
    const allServices = useMemo(() => {
        const serviceList = services?.data || []
        if (!serviceList.length || !startWeek) return serviceList

        const rotateWeek = (w) => (
            w >= startWeek ? w : w + 100
        )

        return serviceList
            .slice()
            .sort((a, b) => rotateWeek(a.weekNumber) - rotateWeek(b.weekNumber))
    }, [services, startWeek])

    // Semaines programmées (sans doublons)
    const uniqueWeeks = useMemo(() =>
        [...new Set(allServices.map(s => s.weekNumber))], [allServices])

    // Calculs progression/services complétés
    const totalWeeks = uniqueWeeks.length
    const completedServices = allServices.filter(service =>
        !!service.menu
    ).length
    const progressPercentage = totalWeeks > 0 ? (completedServices / totalWeeks) * 100 : 0

    // Helper pour retrouver la progression liée à un service (utile pour la modale menu)
    const getProgressionForService = (serviceId) =>
        filteredProgressions.find(prog =>
            Array.isArray(prog.services) &&
            prog.services.some(s =>
                s.service && (
                    s.service._id === serviceId ||
                    s.service._id === String(serviceId) ||
                    s.service === serviceId ||
                    s.service === String(serviceId)
                )
            )
        )

    // Callback création de service
    const handleCreateService = () => {
        // TODO: log création service si besoin
    }

    // Chargement global
    const isLoading = loadingProgressions || loadingServices || loadingCalendars

    return (
        <div className="main-grid-layout-service">
            {/* Colonne de gauche : résumé progression, infos, complétion */}
            <ProgressionSummaryPanel
                progressions={filteredProgressions}
                selectedProgressionId={selectedProgressionId}
                setSelectedProgressionId={setSelectedProgressionId}
                activeSession={activeSession}
                selectedProgression={selectedProgression}
                totalWeeks={totalWeeks}
                completedServices={completedServices}
                progressPercentage={progressPercentage}
            />

            {/* Colonne de droite : table des services, actions, modale menu */}
            <ServiceTablePanel
                allServices={allServices}
                loading={isLoading}
                onCreateService={handleCreateService}
                onMenuSaved={refetchServices}
                getProgressionForService={getProgressionForService}
            />
        </div>
    )
}

export default ServiceSection
