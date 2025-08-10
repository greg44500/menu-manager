// ServiceSection.jsx - VERSION CORRIGÉE
import React, { useState, useMemo } from 'react'
import { getISOWeek } from 'date-fns'
import { useSelector } from 'react-redux'
import { useGetAllProgressionsQuery } from '../../store/api/progressionsApi'
import { useGetServicesByProgressionQuery } from '../../store/api/servicesApi'
import { useGetAllCalendarsQuery } from '../../store/api/calendarApi'
import ProgressionSummaryPanel from './ProgressionSummaryPanel'
import ServiceTablePanel from './ServiceTablePanel'

const ServiceSection = () => {
    // État pour la progression sélectionnée
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
    
    // Récupération de la semaine exacte
    const startWeek = useMemo(() => {
        if (activeSession && activeSession.startDate) {
            return getISOWeek(new Date(activeSession.startDate))
        }
        // fallback si session absente
        return 35
    }, [activeSession])

    // Progressions filtrées par calendrier/session active
    const filteredProgressions = useMemo(() => {
        if (!activeCalendarId) return []
        return progressions.filter(prog =>
            prog.calendar === activeCalendarId ||
            (typeof prog.calendar === 'object' && prog.calendar._id === activeCalendarId)
        )
    }, [progressions, activeCalendarId])

    // Quand la session active change, on réinitialise la sélection
    React.useEffect(() => {
        setSelectedProgressionId(null)
    }, [activeCalendarId])

    // Progression actuellement sélectionnée
    const selectedProgression = useMemo(
        () => filteredProgressions.find(p => p._id === selectedProgressionId),
        [filteredProgressions, selectedProgressionId]
    )

    // Services liés à la progression sélectionnée
    const {
        data: servicesResponse = {},
        isLoading: loadingServices,
        refetch: refetchServices,
    } = useGetServicesByProgressionQuery(selectedProgressionId, {
        skip: !selectedProgressionId
    })

    // Liste de tous les services triés par semaine
    const allServices = useMemo(() => {
        const serviceList = servicesResponse?.data || []
        if (!serviceList.length || !startWeek) return serviceList

        const rotateWeek = (w) => (
            w >= startWeek ? w : w + 100
        )

        return serviceList
            .slice()
            .sort((a, b) => rotateWeek(a.weekNumber) - rotateWeek(b.weekNumber))
    }, [servicesResponse, startWeek])

    // Semaines programmées (sans doublons)
    const uniqueWeeks = useMemo(() =>
        [...new Set(allServices.map(s => s.weekNumber))], [allServices])

    // Calculs progression/services complétés
    const totalWeeks = uniqueWeeks.length
    const completedServices = allServices.filter(service => !!service.menu).length
    const progressPercentage = totalWeeks > 0 ? (completedServices / totalWeeks) * 100 : 0

    // Helper pour retrouver la progression liée à un service
    const getProgressionForService = (serviceId) => {
        // Si on a déjà la progression sélectionnée, on la retourne directement
        if (selectedProgression) {
            return selectedProgression
        }
        
        // Sinon on cherche dans toutes les progressions filtrées
        return filteredProgressions.find(prog =>
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
    }

    // Callback création de service
    const handleCreateService = () => {
        console.log('Création de service pour la progression:', selectedProgressionId)
        // TODO: Implémenter la création de service
    }

    // Callback après sauvegarde d'un menu
    const handleMenuSaved = () => {
        console.log('Menu sauvegardé, rafraîchissement des services...')
        refetchServices()
    }

    // Chargement global
    const isLoading = loadingProgressions || loadingServices || loadingCalendars

    // Debug - pour vérifier les données
    React.useEffect(() => {
        if (selectedProgressionId && allServices.length > 0) {
            console.log('📊 Services chargés:', {
                progressionId: selectedProgressionId,
                servicesCount: allServices.length,
                firstService: allServices[0],
                hasProgressionId: allServices[0]?.progressionId
            })
        }
    }, [selectedProgressionId, allServices])

    return (
        <div className="main-grid-layout-service">
            {/* Colonne de gauche : résumé progression */}
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

            {/* Colonne de droite : table des services */}
            <ServiceTablePanel
                allServices={allServices}
                loading={isLoading}
                onCreateService={handleCreateService}
                onMenuSaved={handleMenuSaved}
                progressionId={selectedProgressionId}  // ⚡ CORRECTION ICI
                getProgressionForService={getProgressionForService} // ⚡ OPTIONNEL mais utile
            />
        </div>
    )
}

export default ServiceSection