import { useState } from 'react'
import { Plus, TrendingUp, Utensils, Replace, Edit3, Trash2, FileDown } from 'lucide-react' // ← Ajout de TrendingUp
import ProgressionSelect from './ProgressionSelect'
import DataTable from '../../components/common/DataTable'
import ProgressBar from '../../components/common/ProgressBar' // ← Import de ProgressBar
import { useGetAllProgressionsQuery } from '../../store/api/progressionsApi'
import { useGetServicesByProgressionQuery } from '../../store/api/servicesApi'
import MenuEditorModal from '../menus/MenuEditorModal'

const ServiceSection = () => {
    const [selectedProgressionId, setSelectedProgressionId] = useState(null)
    const [editingService, setEditingService] = useState(null)

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

    const getMondayFromWeek = (weekNumber, year = new Date().getFullYear()) => {
        const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7)
        const dow = simple.getDay()
        const monday = new Date(simple)
        if (dow <= 4)
            monday.setDate(simple.getDate() - simple.getDay() + 1)
        else
            monday.setDate(simple.getDate() + 8 - simple.getDay())
        return monday.toLocaleDateString('fr-FR') // => "21/07/2025"
    }
    const selectedProgression = progressions.find(p => p._id === selectedProgressionId)

    const allServices = (services?.data || [])
        .slice()
        .sort((a, b) => {
            const startWeek = 35; // 🗓️ semaine de démarrage de l'année pédagogique
            const normalize = (week) => (week < startWeek ? week + 100 : week);
            return normalize(a.weekNumber) - normalize(b.weekNumber);
        });

    const uniqueTeachers = selectedProgression?.teachers || []
    const uniqueClasses = selectedProgression?.classrooms || []
    const uniqueWeeks = [...new Set(allServices.map(s => s.weekNumber))]


    // 🆕 CALCULS POUR LA PROGRESSBAR
    const totalWeeks = uniqueWeeks.length
    const completedServices = allServices.filter(service =>
        service.menu && service.menu.length > 0
    ).length
    const progressPercentage = totalWeeks > 0 ? (completedServices / totalWeeks) * 100 : 0

    console.log("TEACHER", uniqueTeachers)
    console.log("WEEKS", uniqueWeeks)

    return (
        <div className="main-grid-layout-service ">
            <div className="left-panel-service ">
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-content">
                        <ProgressionSelect
                            progressions={progressions}
                            value={selectedProgressionId}
                            onChange={setSelectedProgressionId}
                        />
                    </div>
                    {selectedProgressionId && (
                        <div >
                            <div className="card-summary outline-orange service-card">
                                <div className="card-content-form">
                                    <div className="summary-header summary-header-h4 ">
                                        <h4>Formateurs assignés : </h4>
                                        <span className="badge badge-orange">{uniqueTeachers.length}</span>
                                    </div>
                                    <ul className="summary-list">
                                        {uniqueTeachers.map(t => (
                                            <li key={t._id}>{t.fullName || `${t.firstname} ${t.lastname}`} <span className="small-tag">({t.specialization})</span></li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="card-summary outline-orange service-card">
                                <div className="card-content-form ">
                                    <div className="summary-header summary-header-h4 ">
                                        <h4>Classes assignées : </h4>
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
                                        <h4>Semaines programmées : </h4>
                                        <span className="badge badge-green">{uniqueWeeks.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 🆕 NOUVELLE CARTE AVEC PROGRESSBAR */}
                            <div className="card-summary outline-orange service-card">
                                <div className="card-content-form">
                                    <div className="summary-header summary-header-h4">
                                        <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                                        <h4 style={{ color: 'var(--primary)' }}>Complétion des services</h4>
                                        <span className="badge badge-primary">
                                            {Math.round(progressPercentage)}%
                                        </span>
                                    </div>

                                    {/* 🎯 INTÉGRATION DE LA PROGRESSBAR */}
                                    <ProgressBar
                                        current={completedServices}
                                        total={totalWeeks}
                                        label="Services avec menus créés"
                                    />

                                    {/* Informations additionnelles */}
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
            <div className="right-panel-service ">
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
                            loading={loadingProgressions || loadingServices}
                            columns={[
                                { header: 'Semaine', accessorKey: 'weekNumber' },
                                {
                                    header: 'Date (Lundi estimé)',
                                    cell: ({ row }) => getMondayFromWeek(row.original.weekNumber)
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
                                // Tu peux ici déclencher un refetch de l'API
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