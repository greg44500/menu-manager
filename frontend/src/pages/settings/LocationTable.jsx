// frontend/src/components/settings/LocationTable.jsx
import { useState } from 'react'
import { Edit3, Trash2 } from 'lucide-react'
import { useGetLocationsQuery, useDeleteLocationMutation } from '../../store/api/locationApi.js'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import EditLocationModal from './EditLocationModal'

const LocationTable = ({ onDataChange }) => {
    const {
        data,
        isLoading,
        isError,
        refetch
    } = useGetLocationsQuery()
    const locations = Array.isArray(data?.data) ? data.data : []
    const [deleteLocation] = useDeleteLocationMutation()

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState(null)

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cet atelier ?')) return
        
        try {
            await deleteLocation(id).unwrap()
            toast.success('Atelier supprimé avec succès')
            
            // 🔄 Double synchronisation
            refetch()                // Refetch local
            onDataChange?.()         // Callback vers parent pour stats
            
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
        refetch()                // Refetch local
        onDataChange?.()         // Callback vers parent pour stats
    }

    if (isLoading) return <p>Chargement...</p>
    if (isError) return <p>Erreur lors du chargement des ateliers.</p>
    if (locations.length === 0) return <p>Aucun atelier pour le moment.</p>

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '400px' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Nom</th>
                        <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {locations.map((location) => (
                        <tr key={location._id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px', fontWeight: '500' }}>{location.name}</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    <button className="icon-button" onClick={() => handleEdit(location)}>
                                        <Edit3 size={16} />
                                    </button>
                                    <button className="icon-button" onClick={() => handleDelete(location._id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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