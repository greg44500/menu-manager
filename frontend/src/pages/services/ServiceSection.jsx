import { useState } from 'react'
import { Plus, TrendingUp, Utensils, Replace, Edit3, Trash2, Calendar } from 'lucide-react'
import ProgressionSelect from './ProgressionSelect'
import DataTable from '../../components/common/DataTable'
import ProgressBar from '../../components/common/ProgressBar'
import { useGetAllProgressionsQuery } from '../../store/api/progressionsApi'
import { useGetServicesByProgressionQuery } from '../../store/api/servicesApi'
import { useGetAllCalendarsQuery } from '../../store/api/calendarApi' // ← Import du calendrier
import MenuEditorModal from '../menus/MenuEditorModal'

const ServiceSection = () => {
    const [selectedProgressionId, setSelectedProgressionId] = useState(null)
    const [editingService, setEditingService] = useState(null)

    // 📅 RÉCUPÉRATION DU CALENDRIER ACADÉMIQUE
    const {
        data: calendarsData,
        isLoading: loadingCalendars,
    } = useGetAllCalendarsQuery()

    const {
        data: rawProgressions,
        isLoading: loadingProgressions,
    } = useGetAllProgressionsQuery()

    const progressions = rawProgressions?.data || []

    const {
        data: services = {},
        isLoading: loadingServices,
    } = useGetServicesByProgressionQuery(selectedProgressionId, {
        skip: !selectedProgressionId
    })

    // 🎯 FONCTION POUR TROUVER LA SESSION ACTIVE
    const getActiveAcademicSession = () => {
        const calendars = calendarsData?.calendars || []
        const today = new Date()

        return calendars.find(calendar => {
            const startDate = new Date(calendar.startDate)
            const endDate = new Date(calendar.endDate)
            return today >= startDate && today <= endDate
        })
    }

    // 📊 FONCTION POUR CALCULER LA DATE AVEC LE CONTEXTE ACADÉMIQUE
    // const getMondayFromWeek = (weekNumber) => {
    //     const activeSession = getActiveAcademicSession()

    //     if (!activeSession) {
    //         // 🚨 FALLBACK si pas de session active
    //         console.warn('Aucune session académique active trouvée')
    //         return 'Session non définie'
    //     }

    //     // 🗓️ EXTRACTION DES ANNÉES DE LA SESSION
    //     const startDate = new Date(activeSession.startDate)
    //     const endDate = new Date(activeSession.endDate)
    //     const startYear = startDate.getFullYear()
    //     const endYear = endDate.getFullYear()

    //     // 📅 DÉTERMINATION DE L'ANNÉE SELON LA SEMAINE
    //     // Logic: si la session commence en septembre (semaine ~35), 
    //     // les semaines 35+ sont dans l'année de début, les semaines 1-34 dans l'année de fin
    //     const SCHOOL_START_WEEK = 35 // Ajustable selon ton calendrier

    //     const targetYear = weekNumber >= SCHOOL_START_WEEK ? startYear : endYear

    //     // 🎯 CALCUL DE LA DATE DU LUNDI
    //     const jan1 = new Date(targetYear, 0, 1)
    //     const daysToAdd = (weekNumber - 1) * 7
    //     const targetDate = new Date(jan1.getTime() + daysToAdd * 24 * 60 * 60 * 1000)

    //     // Ajuste au lundi
    //     const dayOfWeek = targetDate.getDay()
    //     const monday = new Date(targetDate)
    //     const daysToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1)
    //     monday.setDate(targetDate.getDate() + daysToMonday)

    //     return monday.toLocaleDateString('fr-FR')
    // }

    const selectedProgression = progressions.find(p => p._id === selectedProgressionId)
    const activeSession = getActiveAcademicSession()

    const allServices = (services?.data || [])
        .slice()
        .sort((a, b) => {
            const startWeek = 35
            const normalize = (week) => (week < startWeek ? week + 100 : week)
            return normalize(a.weekNumber) - normalize(b.weekNumber)
        })

    const uniqueTeachers = selectedProgression?.teachers || []
    const uniqueClasses = selectedProgression?.classrooms || []
    const uniqueWeeks = [...new Set(allServices.map(s => s.weekNumber))]

    // 🆕 CALCULS POUR LA PROGRESSBAR
    const totalWeeks = uniqueWeeks.length
    const completedServices = allServices.filter(service =>
        service.menu && service.menu.length > 0
    ).length
    const progressPercentage = totalWeeks > 0 ? (completedServices / totalWeeks) * 100 : 0

    return (
        <div className="main-grid-layout-service">
            <div className="left-panel-service">
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-content">
                        <ProgressionSelect
                            progressions={progressions}
                            value={selectedProgressionId}
                            onChange={setSelectedProgressionId}
                        />
                    </div>

                    {/* 🆕 AFFICHAGE DE LA SESSION ACTIVE */}
                    {activeSession && (
                        <div className="card-summary outline-blue service-card">
                            <div className="card-content-form">
                                <div className="summary-header summary-header-h4">
                                    <Calendar size={16} style={{ color: 'var(--info)' }} />
                                    <h4 style={{ color: 'var(--info)' }}>Session académique</h4>
                                    <span className="badge badge-info">Active</span>
                                </div>
                                <div className="service-info">
                                    <span><strong>{activeSession.name}</strong></span>
                                    <span>Du {new Date(activeSession.startDate).toLocaleDateString('fr-FR')} au {new Date(activeSession.endDate).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedProgressionId && (
                        <div>
                            <div className="card-summary outline-orange service-card">
                                <div className="card-content-form">
                                    <div className="summary-header summary-header-h4">
                                        <h4>Formateurs assignés :</h4>
                                        <span className="badge badge-orange">{uniqueTeachers.length}</span>
                                    </div>
                                    <ul className="summary-list">
                                        {uniqueTeachers.map(t => (
                                            <li key={t._id}>
                                                {t.fullName || `${t.firstname} ${t.lastname}`}
                                                <span className="small-tag">({t.specialization})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="card-summary outline-orange service-card">
                                <div className="card-content-form">
                                    <div className="summary-header summary-header-h4">
                                        <h4>Classes assignées :</h4>
                                        <span className="badge badge-info">{uniqueClasses.length}</span>
                                    </div>
                                    <ul className="summary-list">
                                        {uniqueClasses.map(c => (
                                            <li key={c._id}>
                                                {c.virtualName ??
                                                    [c.diploma, c.category, c.alternationNumber, c.group, c.certificationSession]
                                                        .filter(Boolean)
                                                        .join(' ')
                                                }
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="card-summary outline-orange service-card">
                                <div className="card-content-form">
                                    <div className="summary-header summary-header-h4">
                                        <h4>Semaines programmées :</h4>
                                        <span className="badge badge-green">{uniqueWeeks.length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-summary outline-orange service-card">
                                <div className="card-content-form">
                                    <div className="summary-header summary-header-h4">
                                        <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                                        <h4 style={{ color: 'var(--primary)' }}>Complétion des services</h4>
                                        <span className="badge badge-primary">
                                            {Math.round(progressPercentage)}%
                                        </span>
                                    </div>

                                    <ProgressBar
                                        current={completedServices}
                                        total={totalWeeks}
                                        label="Services avec menus créés"
                                    />

                                    <div className='service-info'>
                                        <span>Services planifiés : {totalWeeks}</span>
                                        <span>Services complétés : {completedServices}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="right-panel-service">
                <div className="card">
                    <div className="card-header">
                        <div className='card-header-position'>
                            <h2 className='card-header-title'>Liste des services</h2>
                            <button className="btn btn-primary card-header-btn">
                                <Plus size={16} />
                                Créer un service
                            </button>
                        </div>
                    </div>
                    <div className="card-content">
                        <DataTable
                            data={allServices}
                            loading={loadingProgressions || loadingServices || loadingCalendars}
                            columns={[
                                { header: 'Semaine', accessorKey: 'weekNumber' },
                                {
                                    header: 'Date (Lundi)',
                                    accessorKey: 'serviceDate',
                                    cell: ({ row }) => new Date(row.original.serviceDate).toLocaleDateString('fr-FR')
                                },
                                {
                                    header: 'Type',
                                    cell: ({ row }) => row.original.serviceType?.name || '—'
                                },
                                {
                                    header: 'Menus',
                                    cell: ({ row }) => {
                                        const menus = row.original.menu || []
                                        return menus.length > 0
                                            ? menus.map(m => (
                                                <div key={m.type}>
                                                    <span className="badge badge-secondary">{m.type}</span> ({m.items.length} items)
                                                </div>
                                            ))
                                            : 'Non défini'
                                    }
                                },
                                {
                                    header: 'Statut',
                                    cell: ({ row }) => (
                                        row.original.menu ? (
                                            <span className="badge badge-success">Complété</span>
                                        ) : (
                                            <span className="badge badge-warning">À compléter</span>
                                        )
                                    )
                                },
                                {
                                    header: 'Actions',
                                    cell: ({ row }) => {
                                        const service = row.original
                                        return (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    title="Créer/Modifier le menu"
                                                    className="icon-button"
                                                    onClick={() => setEditingService(service)}
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                {service.menu && (
                                                    <>
                                                        <button
                                                            title="Assigner au restaurant"
                                                            className="icon-button">
                                                            <Utensils size={16} />
                                                        </button>
                                                        <button
                                                            title="Assigner un remplaçant"
                                                            className="icon-button">
                                                            <Replace size={16} />
                                                        </button>
                                                        <button
                                                            title="Supprimer ce menu"
                                                            className="icon-button">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )
                                    }
                                },
                            ]}
                        />
                        <MenuEditorModal
                            isOpen={!!editingService}
                            service={editingService}
                            onClose={() => setEditingService(null)}
                            onSaved={() => {
                                setEditingService(null)
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ServiceSection