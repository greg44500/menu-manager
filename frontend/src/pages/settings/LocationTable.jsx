import { useState, useMemo } from 'react'
import { Edit3, Trash2 } from 'lucide-react'
import { useGetLocationsQuery, useDeleteLocationMutation } from '../../store/api/locationApi.js'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import EditLocationModal from './EditLocationModal'
import DataTable from '../../components/common/DataTable'

const LocationTable = ({ onDataChange }) => {
    const { data, isLoading, isError, refetch } = useGetLocationsQuery()
    const locations = Array.isArray(data?.data) ? data.data : []
    const [deleteLocation] = useDeleteLocationMutation()

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cet atelier ?')) return
        try {
            await deleteLocation(id).unwrap()
            toast.success('Atelier supprimé avec succès')
            refetch()
            onDataChange?.()
            setRefreshKey(prev => prev + 1)
        } catch (err) {
            toast.error('Erreur lors de la suppression')
            console.error('Erreur suppression location:', err)
        }
    }

    const handleEdit = (location) => {
        setSelectedLocation(location)
        setEditModalOpen(true)
    }

    const handleEditSuccess = () => {
        setEditModalOpen(false)
        setSelectedLocation(null)
        refetch()
        onDataChange?.()
        setRefreshKey(prev => prev + 1)
    }

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Nom',
            cell: ({ row }) => <span>{row.original.name}</span>,
        },
    ], [])

    const rowActions = (location) => (
        <div className="flex justify-end gap-2">
            <button className="icon-button" onClick={() => handleEdit(location)}>
                <Edit3 size={16} />
            </button>
            <button className="icon-button" onClick={() => handleDelete(location._id)}>
                <Trash2 size={16} />
            </button>
        </div>
    )

    if (isLoading) return <p>Chargement...</p>
    if (isError) return <p>Erreur lors du chargement des ateliers.</p>
    if (locations.length === 0) return <p>Aucun atelier pour le moment.</p>

    return (
        <div className="card">
            <DataTable
                key={refreshKey}
                columns={columns}
                data={locations}
                isLoading={isLoading}
                rowActions={rowActions}
                pageSize={5}
            />

            {editModalOpen && selectedLocation && (
                <Modal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    title="Modifier l'atelier"
                >
                    <EditLocationModal
                        location={selectedLocation}
                        onClose={() => {
                            setEditModalOpen(false)
                            setSelectedLocation(null)
                        }}
                        onUpdated={handleEditSuccess}
                    />
                </Modal>
            )}
        </div>
    )
}

export default LocationTable