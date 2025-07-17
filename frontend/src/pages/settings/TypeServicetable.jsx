import { useState, useMemo } from 'react'
import { Edit3, Trash2 } from 'lucide-react'
import { useGetTypesServicesQuery, useDeleteTypeServiceMutation } from '../../store/api/typeServiceApi.js'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import EditTypeServiceModal from './EditTypeServiceModal'
import DataTable from '../../components/common/DataTable'

const TypeServiceTable = () => {
  const { data: types = [], isLoading, isError, refetch } = useGetTypesServicesQuery()
  const [deleteType] = useDeleteTypeServiceMutation()

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce type de service ?')) return
    try {
      await deleteType(id).unwrap()
      toast.success('Type supprimé avec succès')
      refetch()
      setRefreshKey(prev => prev + 1)
    } catch (err) {
      toast.error('Erreur lors de la suppression')
      console.error(err)
    }
  }

  const handleEdit = (type) => {
    setSelectedType(type)
    setEditModalOpen(true)
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Nom',
      cell: ({ row }) => <span>{row.original.name}</span>,
    },
  ], [])

  const rowActions = (type) => (
    <div className="flex justify-end gap-2">
      <button className="icon-button" onClick={() => handleEdit(type)}>
        <Edit3 size={16} />
      </button>
      <button className="icon-button" onClick={() => handleDelete(type._id)}>
        <Trash2 size={16} />
      </button>
    </div>
  )

  if (isLoading) return <p>Chargement...</p>
  if (isError) return <p>Erreur lors du chargement des types.</p>
  if (types.length === 0) return <p>Aucun type de service pour le moment.</p>

  return (
    <div className="card">
      <DataTable
        key={refreshKey}
        columns={columns}
        data={types}
        isLoading={isLoading}
        rowActions={rowActions}
        pageSize={5}
      />

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
            onUpdated={() => {
              refetch()
              setRefreshKey(prev => prev + 1)
            }}
          />
        </Modal>
      )}
    </div>
  )
}

export default TypeServiceTable