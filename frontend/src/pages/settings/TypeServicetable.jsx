// frontend/src/components/settings/TypeServiceTable.jsx
import { useState } from 'react'
import { Edit3, Trash2 } from 'lucide-react'
import { useGetTypesServicesQuery, useDeleteTypeServiceMutation } from '../../store/api/typeServiceApi.js'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import EditTypeServiceModal from './EditTypeServiceModal'

const TypeServiceTable = () => {
    const { data: types = [], isLoading, isError, refetch } = useGetTypesServicesQuery()
    const [deleteType] = useDeleteTypeServiceMutation()

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedType, setSelectedType] = useState(null)

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce type de service ?')) return
        try {
            await deleteType(id).unwrap()
            toast.success('Type supprimé avec succès')
            refetch()
        } catch (err) {
            toast.error(err, 'Erreur lors de la suppression')
        }
    }

    const handleEdit = (type) => {
        setSelectedType(type)
        setEditModalOpen(true)
    }

    if (isLoading) return <p>Chargement...</p>
    if (isError) return <p>Erreur lors du chargement des types.</p>
    if (types.length === 0) return <p>Aucun type de service pour le moment.</p>

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
                    {types.map((type) => (
                        <tr key={type._id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px', fontWeight: '500' }}>{type.name}</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    <button className="icon-button" onClick={() => handleEdit(type)}>
                                        <Edit3 size={16} />
                                    </button>
                                    <button className="icon-button" onClick={() => handleDelete(type._id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editModalOpen && selectedType && (
                <Modal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    title="Modifier le type de service"
                >
                    <EditTypeServiceModal
                        type={selectedType}
                        onClose={() => {
                            setEditModalOpen(false)
                            setSelectedType(null)
                        }}
                    />
                </Modal>
            )}
        </div>
    )
}

export default TypeServiceTable