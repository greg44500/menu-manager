// frontend/src/pages/settings/SettingsDashboard.jsx

import { useState } from 'react'
import { Building2, ScrollText, CalendarDays } from 'lucide-react'
import StatCard from '../../components/common/StatCard'
import { useGetLocationsQuery } from '../../store/api/locationApi'
import { useGetTypesServicesQuery } from '../../store/api/typeServiceApi.js'
import { useGetAllCalendarsQuery } from '../../store/api/calendarApi.js'
import TypeServiceSection from './TypeServiceSection'
import LocationSection from './LocationSection'
import CalendarSection from './CalendarSection'

/**
 * DASHBOARD DE PARAMÉTRAGE TECHNIQUE
 * -----------------------------------
 * - Affiche les stats des entités paramétrables (Types, Ateliers, Calendriers)
 * - Affiche dynamiquement la section en fonction du clic sur StatCard
 * - Gère le calcul et l'affichage des stats en temps réel (live)
 * - Rendu maintenable, chaque bloc est indépendant
 */

const SettingsDashboard = () => {
    // --- ETAT LOCAL : Section active à afficher ---
    // 'types-services', 'locations', ou 'calendrier'
    const [activeSection, setActiveSection] = useState(null)

    // --- HOOKS RTK QUERY POUR LES DONNÉES ---
    // Récupération des Ateliers (Locations)
    const {
        data: locationsData,
        isLoading: locationsLoading,
        error: locationsError
    } = useGetLocationsQuery()

    // Récupération des Types de service
    const {
        data: typesData,
        isLoading: typesLoading,
        error: typesError
    } = useGetTypesServicesQuery()

    // Récupération des Calendriers (sessions)
    const {
        data: calendarsData,
        isLoading: calendarsLoading,
        error: calendarsError
    } = useGetAllCalendarsQuery()

    // --- CALCUL DES STATS POUR LES CARDS ---
    // Compte les éléments pour chaque entité paramétrable
    const stats = {
        typesServicesCount: typesData?.length || 0,
        locationsCount: Array.isArray(locationsData?.data) ? locationsData.data.length : 0,
        calendarCount: calendarsData?.count || 0,
    }

    // --- CONFIGURATION DES STATCARDS ---
    // Chaque card ouvre sa section dédiée via onClick
    const statCards = [
        {
            title: 'Types de services',
            icon: <ScrollText size={24} />,
            count: stats.typesServicesCount,
            variant: 'primary',
            section: 'types-services'
        },
        {
            title: 'Ateliers',
            icon: <Building2 size={24} />,
            count: stats.locationsCount,
            variant: 'info',
            section: 'locations'
        },
        {
            title: 'Calendriers',
            icon: <CalendarDays size={24} />,
            count: stats.calendarCount,
            variant: 'success',
            section: 'calendrier'
        }
    ]

    // --- DEBUG : Infos brutes (optionnel, à commenter en prod) ---
    // console.log('📊 Données locations:', locationsData)
    // console.log('📊 Données types:', typesData)
    // console.log('📊 Données calendars:', calendarsData)
    // console.log('📊 Stats calculées:', stats)
    // console.log('📊 Loading states:', { locationsLoading, typesLoading, calendarsLoading })
    // console.log('📊 Errors:', { locationsError, typesError, calendarsError })

    // --- RENDU PRINCIPAL ---
    return (
        <div>
            {/* ----------- TITRE PRINCIPAL ----------- */}
            <h1 style={{
                fontSize: '2rem',
                fontWeight: '600',
                color: 'var(--primary)',
                marginBottom: '2rem'
            }}>
                Paramétrages Techniques
            </h1>

            {/* ----------- STATCARDS : Accès rapide aux entités ----------- */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        margin: 0
                    }}>
                        Données Paramétrables
                    </h2>
                </div>
                <div className="card-content">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {/* Affiche chaque StatCard avec navigation par section */}
                        {statCards.map((card) => (
                            <StatCard
                                key={card.title}
                                title={card.title}
                                count={card.count}
                                icon={card.icon}
                                onClick={() => setActiveSection(card.section)}
                                clickable
                                variant={card.variant}
                                loading={
                                    (card.section === 'types-services' && typesLoading)
                                    || (card.section === 'locations' && locationsLoading)
                                    || (card.section === 'calendrier' && calendarsLoading)
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ----------- SECTION DYNAMIQUE PAR TYPE ----------- */}
            {activeSection && (
                <div className="mt-6">
                    {activeSection === 'types-services' && (
                        <TypeServiceSection />
                    )}

                    {activeSection === 'locations' && (
                        <LocationSection />
                    )}

                    {activeSection === 'calendrier' && (
                        <CalendarSection />
                    )}
                </div>
            )}
        </div>
    )
}

export default SettingsDashboard
