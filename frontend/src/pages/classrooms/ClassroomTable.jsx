import { useState, useMemo } from 'react'
import { useGetAllClassroomsQuery, useDeleteClassroomMutation } from '../../store/api/classroomsApi'
import { Trash2, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'
import ClassroomModal from './ClassroomModal'
import DataTable from '../../components/common/DataTable'

const ClassroomTable = ({ onEdit }) => {
    const { data, isLoading, error, refetch } = useGetAllClassroomsQuery()
    const classrooms = data?.classrooms || []
    const [deleteClassroom] = useDeleteClassroomMutation()

    const [modalMode, setModalMode] = useState('create')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedClassroom, setSelectedClassroom] = useState(null)

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette classe ?')) return
        try {
            await deleteClassroom(id).unwrap()
            toast.success('Classe supprimée avec succès')
            refetch()
        } catch (err) {
            toast.error(err?.data?.message || 'Erreur lors de la suppression')
        }
    }

    const handleEdit = (classroom) => {
        if (onEdit) return onEdit(classroom)
        setModalMode('edit')
        setSelectedClassroom(classroom)
        setIsModalOpen(true)
    }

    const columns = useMemo(() => [
        {
            accessorKey: 'virtualName',
            header: 'Nom',
            cell: ({ row }) => <span>{row.original.virtualName}</span>,
        },
        {
            accessorKey: 'diploma',
            header: 'Diplôme',
            cell: ({ row }) => <span className="badge badge-neutral">{row.original.diploma}</span>,
        },
        {
            accessorKey: 'category',
            header: 'Catégorie',
            cell: ({ row }) => <span className="badge badge-info">{row.original.category}</span>,
        },
        {
            accessorKey: ' alternationNumber',
            header: 'Alternance',
            cell: ({ row }) => <span>{row.original.alternationNumber}</span>,
        },
        {
            accessorKey: 'group',
            header: 'Groupe',
            cell: ({ row }) => <span>{row.original.group}</span>,
        },
        {
            accessorKey: ' certificationSession',
            header: 'Année',
            cell: ({ row }) => <span>{row.original.certificationSession}</span>,
        },

        {
            accessorKey: 'assignedTeachers',
            header: 'Formateur',
            cell: ({ row }) => {
                const teacher = row.original.assignedTeachers?.[0]
                return <span>{teacher ? `${teacher.firstname} ${teacher.lastname}` : '-'}</span>
            },
        },
    ], [])

    const rowActions = (classroom) => (
        <div className="flex justify-end gap-2">
            <button
                title="Modifier"
                className="icon-button"
                onClick={() => handleEdit(classroom)}
            >
                <Edit3 size={16} />
            </button>
            <button
                title="Supprimer"
                className="icon-button"
                onClick={() => handleDelete(classroom._id)}
            >
                <Trash2 size={16} />
            </button>
        </div>
    )

    if (error) {
        return (
            <div className="text-center text-red-600 mt-4">
                Erreur lors du chargement des classes : {error?.data?.message || 'Erreur inconnue'}
            </div>
        )
    }

    return (
        <div className="card theme-transition">
            <DataTable
                columns={columns}
                data={classrooms}
                isLoading={isLoading}
                rowActions={rowActions}
                pageSize={5}
            />

            {!onEdit && (
                <ClassroomModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    mode={modalMode}
                    classroomData={selectedClassroom}
                    onSuccess={refetch}
                />
            )}
        </div>
    )
}

export default ClassroomTable
