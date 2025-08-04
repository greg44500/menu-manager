// frontend/src/pages/classrooms/ClassroomTable.jsx

import { useState, useMemo } from 'react'
import { useGetAllClassroomsQuery, useDeleteClassroomMutation } from '../../store/api/classroomsApi'
import { Trash2, Edit3, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import ClassroomModal from './ClassroomModal'
import DataTable from '../../components/common/DataTable'

/**
 * TABLEAU DES CLASSES - VERSION FLEXIBLE
 * -------------------------------------
 * ✅ NOUVEAU : Support des données externes (dashboard user)
 * ✅ NOUVEAU : Mode lecture seule
 * ✅ CONSERVÉ : Toutes les fonctionnalités admin existantes
 */
const ClassroomTable = ({
    // ---- NOUVELLES PROPS (dashboard user) ----
    data: externalData,        // Données externes pré-filtrées
    readOnly = false,          // Mode lecture seule
    onRowClick,                // Handler pour clic sur ligne
    emptyMessage,              // Message personnalisé si vide

    // ---- PROPS EXISTANTES (dashboard admin) ----
    onEdit
}) => {
    // ✅ LOGIQUE ADAPTATIVE : Requête API seulement si pas de données externes
    const { data: apiData, isLoading, error, refetch } = useGetAllClassroomsQuery(undefined, {
        skip: !!externalData,                    // Skip si données fournies
        refetchOnMountOrArgChange: !externalData,
        refetchOnFocus: !externalData,
    })

    // ✅ PRIORITÉ AUX DONNÉES EXTERNES
    const classrooms = externalData || apiData?.classrooms || []
    const isExternalMode = !!externalData

    // --- États modal (seulement en mode admin) ---
    const [modalMode, setModalMode] = useState('create')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedClassroom, setSelectedClassroom] = useState(null)

    // --- Mutation suppression (seulement en mode admin) ---
    const [deleteClassroom] = useDeleteClassroomMutation()

    // ✅ HANDLERS CONDITIONNELS
    const handleDelete = async (id) => {
        if (readOnly) return // Pas de suppression en mode lecture seule

        if (!window.confirm('Voulez-vous vraiment supprimer cette classe ?')) return
        try {
            await deleteClassroom(id).unwrap()
            toast.success('Classe supprimée avec succès')
            if (!isExternalMode) refetch()
        } catch (err) {
            toast.error(err?.data?.message || 'Erreur lors de la suppression')
        }
    }

    const handleEdit = (classroom) => {
        if (readOnly && onRowClick) {
            onRowClick(classroom)  // Mode user : ouvre modal de consultation
        } else if (onEdit) {
            onEdit(classroom)      // Mode admin : callback parent
        } else if (!readOnly) {
            // Mode admin : modal interne
            setModalMode('edit')
            setSelectedClassroom(classroom)
            setIsModalOpen(true)
        }
    }

    // --- Colonnes (identiques) ---
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
            accessorKey: 'alternationNumber',
            header: 'Alternance',
            cell: ({ row }) => <span>{row.original.alternationNumber}</span>,
        },
        {
            accessorKey: 'group',
            header: 'Groupe',
            cell: ({ row }) => <span>{row.original.group}</span>,
        },
        {
            accessorKey: 'certificationSession',
            header: 'Année',
            cell: ({ row }) => <span>{row.original.certificationSession}</span>,
        },
        {
            accessorKey: 'assignedTeachers',
            header: 'Formateur',
            cell: ({ row }) => {
                const teacher = row.original.assignedTeachers?.[0]  // ← Prend seulement le PREMIER
                return <span>{teacher ? `${teacher.firstname} ${teacher.lastname}` : '-'}</span>
            },
        },
    ], [])

    // ✅ ACTIONS CONDITIONNELLES SELON LE MODE
    const rowActions = (classroom) => {
        if (readOnly) {
            // Mode user : seulement consultation
            return (
                <div className="flex justify-end gap-2">
                    <button
                        title="Voir les détails"
                        className="icon-button"
                        onClick={() => handleEdit(classroom)}
                    >
                        <Eye size={16} />
                    </button>
                </div>
            )
        }

        // Mode admin : toutes les actions
        return (
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
    }

    // ✅ GESTION DES ERREURS (seulement en mode API)
    if (!isExternalMode && error) {
        return (
            <div className="alert alert-error">
                <p>Erreur lors du chargement des classes</p>
                <p>{error?.data?.message || 'Erreur inconnue'}</p>
            </div>
        )
    }

    // ✅ MESSAGE VIDE PERSONNALISÉ
    if (classrooms.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted mb-4">
                    {emptyMessage || "Aucune classe à afficher"}
                </p>
            </div>
        )
    }

    return (
        <>
            <DataTable
                columns={columns}
                data={classrooms}
                isLoading={!isExternalMode && isLoading}
                rowActions={rowActions}
                pageSize={5}
            />

            {/* Modal seulement en mode admin ET si pas de callback externe */}
            {!readOnly && !onEdit && (
                <ClassroomModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    mode={modalMode}
                    classroomData={selectedClassroom}
                    onSuccess={refetch}
                />
            )}
        </>
    )
}

export default ClassroomTable