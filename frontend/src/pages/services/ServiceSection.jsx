import { useState } from 'react'
import { Plus } from 'lucide-react'
import ProgressionSelect from './ProgressionSelect'
import DataTable from '../../components/common/DataTable'
import { useGetAllProgressionsQuery } from '../../store/api/progressionsApi'
import { useGetServicesByProgressionQuery } from '../../store/api/servicesApi'

const ServiceSection = () => {
    const [selectedProgression, setSelectedProgression] = useState(null)

    const {
        data: rawProgressions,
        isLoading: loadingProgressions,
    } = useGetAllProgressionsQuery()

    const progressions = rawProgressions?.data || []

    const {
        data: services = {},
        isLoading: loadingServices,
    } = useGetServicesByProgressionQuery(selectedProgression, {
        skip: !selectedProgression
    })
    console.log(services)
    console.log('🔍 FRONTEND DEBUG - services.data:', services?.data);
    if (services?.data?.[0]) {
        console.log('🔍 FRONTEND DEBUG - Premier service:', services.data[0]);
    }
    return (
        <div className="card" style={{ marginBottom: '2rem' }}>
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
                <ProgressionSelect
                    progressions={progressions}
                    value={selectedProgression}
                    onChange={setSelectedProgression}
                />

                <div style={{ marginTop: '1rem' }}>
                    <DataTable
                        data={services?.data || []}
                        loading={loadingProgressions || loadingServices}
                        columns={[
                            { header: 'Semaine', accessorKey: 'weekNumber' },
                            { header: 'Date', accessorKey: 'serviceDate' },
                            {
                                header: 'Classe',
                                cell: ({ row }) => {
                                    const classrooms = row.original.classrooms;
                                    return classrooms?.map(c => c.virtualName).join(', ') || 'Aucune classe';
                                }
                            },
                            {
                                header: 'Formateur',
                                cell: ({ row }) => {
                                    const teachers = row.original.teachers;
                                    return teachers?.map(t => t.fullName).join(', ') || 'Aucun formateur';
                                }
                            },
                            { header: 'Actions', cell: () => <div>// TODO: boutons</div> },
                        ]}
                    />
                </div>
            </div>
        </div>
    )
}

export default ServiceSection
