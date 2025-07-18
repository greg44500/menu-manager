import { useMemo, useState } from 'react'
import { Edit3, Trash2, UserPlus2 } from 'lucide-react'
import toast from 'react-hot-toast'
import AssignTeachersModal from './AssignTeachersModal'
import { useGetAllProgressionsQuery, useDeleteProgressionMutation } from '../../store/api/progressionsApi'
import DataTable from '../../components/common/DataTable'
import ProgressionModal from './ProgressionModal'

const ProgressionTable = () => {
    const { data, isLoading, error, refetch } = useGetAllProgressionsQuery()
    const [deleteProgression] = useDeleteProgressionMutation()
    const progressions = Array.isArray(data?.data) ? data.data : []

    const [selectedProgression, setSelectedProgression] = useState(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [modalMode, setModalMode] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette progression ?')) return
        try {
            await deleteProgression(id).unwrap()
            toast.success('Progression supprimée avec succès')
            refetch()
            setRefreshKey(prev => prev + 1)
        } catch (err) {
            toast.error(err?.data?.message || 'Erreur lors de la suppression')
        }
    }

    const columns = useMemo(() => [
        {
            accessorKey: 'title',
            header: 'Titre',
            cell: ({ row }) => <span>{row.original.title}</span>,
        },
        {
            accessorKey: 'weeks',
            header: 'Semaines',
            cell: ({ row }) => <span>{row.original.weekNumbers?.join(', ')}</span>,
        },
        {
            accessorKey: 'classroomName',
            header: 'Classe',
            cell: ({ row }) => {
                const classrooms = row.original.classrooms
                if (!classrooms || !Array.isArray(classrooms) || classrooms.length === 0) return '-'
                return <span>{classrooms.map(c =>
                    c.virtualName ??
                    [c.diploma, c.category, c.alternationNumber, c.group, c.certificationSession]
                        .filter(Boolean)
                        .join(' ')
                ).join(', ')}
                </span>
            },
        },
        {
            accessorKey: 'teacherName',
            header: 'Formateur',
            cell: ({ row }) => {
                const teachers = row.original.teachers
                return (
                    <span>
                        {Array.isArray(teachers) && teachers.length
                            ? teachers.map(t => `${t.firstname} ${t.lastname}`).join(', ')
                            : '-'}
                    </span>
                )
            },
        },
    ], [])

    const rowActions = (progression) => (
        <div className="flex justify-end gap-2">
            <button
                title="Assigner formateurs"
                className="icon-button"
                onClick={() => {
                    setSelectedProgression(progression)
                    setModalMode('assign')
                    setModalOpen(true)
                }}
            >
                <UserPlus2 size={16} />
            </button>
            <button
                title="Modifier"
                className="icon-button"
                onClick={() => {
                    setSelectedProgression(progression)
                    setModalMode('edit')
                    setModalOpen(true)
                }}
            >
                <Edit3 size={16} />
            </button>
            <button
                title="Supprimer"
                className="icon-button"
                onClick={() => handleDelete(progression._id)}
            >
                <Trash2 size={16} />
            </button>

        </div>
    )

    if (error) {
        return (
            <div className="text-center text-red-600 mt-4">
                Erreur lors du chargement des progressions : {error?.data?.message || 'Erreur inconnue'}
            </div>
        )
    }
    const sortedProgressions = [...progressions].sort((a, b) =>
        a.title.localeCompare(b.title)
    )
    return (
        <div className="card theme-transition">
            <DataTable
                key={refreshKey}
                columns={columns}
                data={sortedProgressions}
                isLoading={isLoading}
                rowActions={rowActions}
                pageSize={5}
            />

            {modalMode === 'assign' && selectedProgression && (
                <AssignTeachersModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    progressionId={selectedProgression._id}
                    onSuccess={() => {
                        refetch()
                        setRefreshKey(prev => prev + 1)
                        setModalOpen(false)
                    }}
                />
            )}

            {modalMode === 'edit' && selectedProgression && (
                <ProgressionModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    progressionData={selectedProgression}
                    mode="edit"
                    onSuccess={() => {
                        refetch()
                        setRefreshKey(prev => prev + 1)
                        setModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}

export default ProgressionTable
