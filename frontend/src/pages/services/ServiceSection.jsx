import { useState } from 'react'
import { Plus } from 'lucide-react'
import ProgressionSelect from './ProgressionSelect'
import DataTable from '../../components/common/DataTable'
import { useGetAllProgressionsQuery } from '../../store/api/progressionsApi'
import { useGetServicesByProgressionQuery } from '../../store/api/servicesApi'

const ServiceSection = () => {
    const [selectedProgressionId, setSelectedProgressionId] = useState(null)

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

    const selectedProgression = progressions.find(p => p._id === selectedProgressionId)

    const allServices = services?.data || []

    const uniqueTeachers = selectedProgression?.teachers || []
    const uniqueClasses = selectedProgression?.classrooms || []
    const uniqueWeeks = [...new Set(allServices.map(s => s.weekNumber))]
  console.log("TEACHER", uniqueTeachers)
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
                                { header: 'Date', accessorKey: 'serviceDate' },
                                {
                                    header: 'Classe',
                                    cell: ({ row }) => {
                                        const classrooms = row.original.classrooms;
                                        return classrooms?.map(c => c.virtualName || c.name).join(', ') || 'Aucune classe';
                                    }
                                },
                                {
                                    header: 'Formateur',
                                    cell: ({ row }) => {
                                        const teachers = row.original.teachers;
                                        return teachers?.map(t => t.fullName || `${t.firstname} ${t.lastname}`).join(', ') || 'Aucun formateur';
                                    }
                                },
                                { header: 'Actions', cell: () => <div>// TODO: boutons</div> },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ServiceSection
