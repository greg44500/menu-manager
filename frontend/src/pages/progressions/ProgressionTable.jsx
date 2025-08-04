// frontend/src/pages/progressions/ProgressionTable.jsx

import { useDispatch } from 'react-redux'
import DataTable from '../../components/common/DataTable'
import { Edit3, Trash2, UserRoundPlus, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import {
    useGetAllProgressionsQuery,
    useDeleteProgressionMutation
} from '../../store/api/progressionsApi'
import { baseApi } from '../../store/api/baseApi'

/**
 * TABLEAU DES PROGRESSIONS - VERSION FLEXIBLE
 * ------------------------------------------
 * ✅ NOUVEAU : Support des données externes (dashboard user)
 * ✅ NOUVEAU : Mode lecture seule
 * ✅ CONSERVÉ : Toutes les fonctionnalités admin existantes
 */
const ProgressionTable = ({
    // ---- NOUVELLES PROPS (dashboard user) ----
    data: externalData,        // Données externes pré-filtrées
    readOnly = false,          // Mode lecture seule
    onRowClick,                // Handler pour clic sur ligne
    emptyMessage,              // Message personnalisé si vide

    // ---- PROPS EXISTANTES (dashboard admin) ----
    calendarId,                // Pour requête API
    onEdit,
    onAssignTeachers
}) => {
    const dispatch = useDispatch()

    // ✅ LOGIQUE ADAPTATIVE : Requête API seulement si pas de données externes
    const { data: apiData, isLoading, error, refetch } = useGetAllProgressionsQuery(calendarId, {
        skip: !!externalData,                    // Skip si données fournies
        refetchOnMountOrArgChange: !externalData,
        refetchOnFocus: !externalData,
    })

    // ✅ PRIORITÉ AUX DONNÉES EXTERNES
    const progressions = externalData || apiData?.data || apiData?.progressions || apiData || []
    const isExternalMode = !!externalData

    // --- Mutation suppression (seulement en mode admin) ---
    const [deleteProgression, { isLoading: isDeleting }] = useDeleteProgressionMutation()

    // ✅ HANDLERS CONDITIONNELS
    const handleEdit = (progression) => {
        if (readOnly && onRowClick) {
            onRowClick(progression)  // Mode user : ouvre modal de consultation
        } else if (onEdit) {
            onEdit(progression)      // Mode admin : ouvre modal d'édition
        }
    }

    const handleDelete = async (progression) => {
        if (readOnly) return // Pas de suppression en mode lecture seule

        if (!window.confirm(`Supprimer la progression "${progression.title}" ?`)) return

        try {
            await deleteProgression(progression._id).unwrap()
            dispatch(baseApi.util.invalidateTags(['Progression']))
            toast.success('Progression supprimée')
        } catch (err) {
            console.error('Delete error:', err)
            toast.error(err?.data?.message || "Erreur lors de la suppression")
        }
    }

    // --- Colonnes (identiques) ---
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
                const classrooms = row.original.classrooms || [];
                if (Array.isArray(classrooms) && classrooms.length > 0) {
                    return (
                        <ul className="table-list-vertical">
                            {classrooms.map((c, idx) => {
                                if (typeof c === 'string') {
                                    return <li key={c}>{c}</li>;
                                }
                                const label = c?.name
                                    || c?.virtualName
                                    || [c?.diploma, c?.category, c?.alternationNumber, c?.group, c?.certificationSession]
                                        .filter(Boolean)
                                        .join(' ')
                                    || 'Classe';
                                return <li key={c._id || idx}>{label}</li>;
                            })}
                        </ul>
                    );
                }
                return <span style={{ color: '#888' }}>Aucune classe</span>;
            }
        },
        {
            accessorKey: 'weekNumbers',  // ✅ CORRECTION : weekNumbers au lieu de weekList
            header: 'Semaines',
            cell: ({ row }) => {
                const weeks = row.original.weekNumbers || [];
                return Array.isArray(weeks) && weeks.length
                    ? weeks.map(w => `S${w}`).join(', ')
                    : 'Aucune';
            }
        },
        {
            accessorKey: 'teachers',
            header: 'Formateurs',
            cell: ({ row }) => {
                const teachers = row.original.teachers || [];
                if (Array.isArray(teachers) && teachers.length > 0) {
                    return (
                        <ul className='table-list-vertical'>
                            {teachers.map((t, idx) =>
                                <li key={typeof t === 'string' ? t : t._id || idx}>
                                    {typeof t === 'string'
                                        ? t
                                        : `${t.firstname || ''} ${t.lastname || ''}`.trim()
                                    }
                                </li>
                            )}
                        </ul>
                    );
                }
                return <span className='badge-info'>Pas d'assignation</span>;
            }
        }
    ]

    // ✅ ACTIONS CONDITIONNELLES SELON LE MODE
    const rowActions = (progression) => {
        if (readOnly) {
            // Mode user : seulement consultation
            return (
                <div className="flex gap-2">
                    <button
                        className="icon-button"
                        title="Voir les détails"
                        onClick={() => handleEdit(progression)}
                    >
                        <Eye size={18} />
                    </button>
                </div>
            )
        }

        // Mode admin : toutes les actions
        return (
            <div className="flex gap-2">
                <button
                    className="icon-button"
                    title="Assigner des formateurs"
                    onClick={() => onAssignTeachers?.(progression)}
                >
                    <UserRoundPlus size={18} />
                </button>
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
    }

    // ✅ GESTION DU LOADING (seulement en mode API)
    if (!isExternalMode && isLoading) {
        return (
            <div className="datatable-loading">
                <div className="loader" /> Chargement des progressions...
            </div>
        )
    }

    // ✅ GESTION DES ERREURS (seulement en mode API)
    if (!isExternalMode && error) {
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

    // ✅ MESSAGE VIDE PERSONNALISÉ
    if (progressions.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted mb-4">
                    {emptyMessage ||
                        (calendarId
                            ? `Aucune progression trouvée pour la session sélectionnée`
                            : `Aucune session sélectionnée`
                        )
                    }
                </p>
                {!isExternalMode && (
                    <div className="text-sm text-muted bg-gray-50 p-3 rounded">
                        <strong>Debug Info:</strong><br />
                        Calendar ID: {calendarId || 'null'}<br />
                        Data: {JSON.stringify(apiData, null, 2)}
                    </div>
                )}
            </div>
        )
    }

    // --- Rendu principal ---
    return (
        <DataTable
            columns={columns}
            data={progressions}
            isLoading={!isExternalMode && isLoading}
            rowActions={rowActions}
            pageSize={10}
        />
    )
}

export default ProgressionTable