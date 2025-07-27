// frontend/src/pages/progressions/ProgressionTable.jsx
import { useState } from 'react'
import { useDispatch } from 'react-redux' // ✅ AJOUT : Pour dispatch
import DataTable from '../../components/common/DataTable'
import { Edit3, Trash2 } from 'lucide-react'
import ProgressionModal from './ProgressionModal'
import toast from 'react-hot-toast'
import {
    useGetAllProgressionsQuery,
    useDeleteProgressionMutation
} from '../../store/api/progressionsApi'
import { baseApi } from '../../store/api/baseApi' // ✅ AJOUT : Pour l'invalidation

/**
 * TABLEAU DES PROGRESSIONS - VERSION FONCTIONNELLE FINALE
 * -------------------------------------------------------
 * ✅ FIX : Suppression de l'import util inexistant
 * ✅ FIX : Utilisation de await refetch() pour forcer la mise à jour
 * ✅ FIX : Gestion correcte des données de réponse
 */
const ProgressionTable = ({ calendarId }) => {
    const dispatch = useDispatch() // ✅ AJOUT : Pour invalider le cache
    
    // --- RTK Query : Récupère les progressions filtrées par calendarId ---
    const { data, isLoading, error, refetch } = useGetAllProgressionsQuery(calendarId, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
    })

    // ✅ FIX : Gestion correcte des données selon votre structure API
    console.log('📊 Raw API Response:', data)
    
    // Adaptez selon la structure de votre réponse API
    const progressions = data?.data || data?.progressions || data || []
    
    console.log('📋 Progressions processed:', progressions)
    console.log('🎯 Calendar ID:', calendarId)

    // --- État local pour l'édition ---
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedProgression, setSelectedProgression] = useState(null)

    // --- Mutation suppression ---
    const [deleteProgression, { isLoading: isDeleting }] = useDeleteProgressionMutation()

    // Ouvre la modale d'édition
    const handleEdit = (progression) => {
        setSelectedProgression(progression)
        setEditModalOpen(true)
    }

    // ✅ SOLUTION OPTIMALE : Suppression avec cache invalidation
    const handleDelete = async (progression) => {
        if (!window.confirm(`Supprimer la progression "${progression.title}" ?`)) return
        
        try {
            await deleteProgression(progression._id).unwrap()
            
            // ✅ SOLUTION OPTIMALE : Invalide le cache via baseApi
            dispatch(baseApi.util.invalidateTags(['Progression']))
            
            toast.success('Progression supprimée')
        } catch (err) {
            console.error('Delete error:', err)
            toast.error(err?.data?.message || "Erreur lors de la suppression")
        }
    }

    // ✅ SOLUTION OPTIMALE : Callback après édition avec cache invalidation
    const handleEditSuccess = () => {
        setEditModalOpen(false)
        setSelectedProgression(null)
        
        // ✅ SOLUTION OPTIMALE : Invalide le cache via baseApi
        dispatch(baseApi.util.invalidateTags([
            'Progression',
            { type: 'Progression', id: calendarId }
        ]))
        
        toast.success('Progression mise à jour')
    }

    // --- Définition des colonnes adaptées à vos données ---
    const columns = [
        {
            accessorKey: 'title',
            header: 'Titre',
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.original.title || 'Sans titre'}
                </div>
            )
        },
        {
            accessorKey: 'classrooms',
            header: 'Classes',
            cell: ({ row }) => {
                const classrooms = row.original.classrooms || []
                if (Array.isArray(classrooms)) {
                    return classrooms.map(c => 
                        typeof c === 'string' ? c : c?.name || c?.virtualName || 'Classe'
                    ).join(', ')
                }
                return 'Aucune classe'
            }
        },
        {
            accessorKey: 'weekNumbers',
            header: 'Semaines',
            cell: ({ row }) => {
                const weeks = row.original.weekNumbers || []
                return Array.isArray(weeks) ? weeks.join(', ') : 'Aucune'
            }
        },
        {
            accessorKey: 'teachers',
            header: 'Formateurs',
            cell: ({ row }) => {
                const teachers = row.original.teachers || []
                if (Array.isArray(teachers)) {
                    return teachers.map(t => 
                        typeof t === 'string' ? t : `${t?.firstname || ''} ${t?.lastname || ''}`.trim()
                    ).join(', ')
                }
                return 'Non assigné'
            }
        }
    ]

    // Actions par ligne (éditer, supprimer)
    const rowActions = (progression) => (
        <div className="flex gap-2">
            <button
                className="icon-button"
                title="Éditer"
                onClick={() => handleEdit(progression)}
                disabled={isDeleting}
            >
                <Edit3 size={18} />
            </button>
            <button
                className="icon-button"
                title="Supprimer"
                onClick={() => handleDelete(progression)}
                disabled={isDeleting}
            >
                <Trash2 size={18} />
            </button>
        </div>
    )

    // --- États de chargement et d'erreur ---
    if (isLoading) {
        return (
            <div className="datatable-loading">
                <div className="loader" /> Chargement des progressions...
            </div>
        )
    }

    if (error) {
        console.error('❌ Error loading progressions:', error)
        return (
            <div className="alert alert-error">
                <p>Erreur de chargement des progressions</p>
                <p>{error.data?.message || error.message || 'Une erreur est survenue'}</p>
                <button 
                    onClick={() => refetch()} 
                    className="btn btn-sm btn-secondary mt-2"
                >
                    Réessayer
                </button>
            </div>
        )
    }

    // ✅ DEBUG : Vérification des données avant rendu
    if (progressions.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted mb-4">
                    {calendarId 
                        ? `Aucune progression trouvée pour la session sélectionnée`
                        : `Aucune session sélectionnée`
                    }
                </p>
                <div className="text-sm text-muted bg-gray-50 p-3 rounded">
                    <strong>Debug Info:</strong><br/>
                    Calendar ID: {calendarId || 'null'}<br/>
                    Data: {JSON.stringify(data, null, 2)}
                </div>
            </div>
        )
    }

    // --- Rendu principal ---
    return (
        <>
            <DataTable
                columns={columns}
                data={progressions}
                isLoading={isLoading}
                rowActions={rowActions}
                pageSize={10}
            />

            {/* Modale d'édition */}
            {editModalOpen && selectedProgression && (
                <ProgressionModal
                    progressionData={selectedProgression}
                    onClose={() => setEditModalOpen(false)}
                    onSuccess={handleEditSuccess}
                    mode="edit"
                />
            )}
        </>
    )
}

export default ProgressionTable