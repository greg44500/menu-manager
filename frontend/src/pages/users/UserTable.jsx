import { useState, useMemo } from 'react'
import { useGetAllUsersQuery, useDeleteUserMutation } from '../../store/api/usersApi'
import { Trash2, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'
import UserModal from './UserModal'
import DataTable from '../../components/common/DataTable'

const UserTable = () => {
  const { data, isLoading, error, refetch } = useGetAllUsersQuery()
  const users = data?.users || []
  const [deleteUser] = useDeleteUserMutation()

  const [modalMode, setModalMode] = useState('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return
    try {
      await deleteUser(id).unwrap()
      toast.success('Utilisateur supprimé avec succès')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'fullname',
      header: 'Utilisateur',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <p className="user-info-identity">
              {user.firstname} {user.lastname}
            </p>

          </div>
        )
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <p className="text-sm truncate max-w-[200px]">{row.original.email}</p>,
    },
    {
      accessorKey: 'role',
      header: 'Rôle',
      enableSorting: true,
      cell: ({ row }) => {
        const role = row.original.role
        const roles = {
          superAdmin: { label: 'Super Admin', className: 'badge-error' },
          manager: { label: 'Manager', className: 'badge-warning' },
          user: { label: 'Formateur', className: 'badge-info' },
        }
        const conf = roles[role] || roles.user
        return <span className={`badge ${conf.className}`}>{conf.label}</span>
      },
    },
    {
      accessorKey: 'specialization',
      header: 'Spécialisation',
      enableSorting: true,
      cell: ({ row }) => <span className="badge badge-neutral">{row.original.specialization}</span>,
    },
    {
      accessorKey: 'isActive',
      header: 'Statut',
      cell: ({ row }) => (
        <span className={`badge ${row.original.isActive ? 'badge-success' : 'badge-error'}`}>
          <span className="dot" /> {row.original.isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      accessorKey: 'isTeacher',
      header: 'Formateur',
      cell: ({ row }) => <span className="badge badge-neutral">{row.original.isTeacher ? 'Oui' : 'Non'}</span>,
    },
  ], [])

  const rowActions = (user) => (
    <div className="flex justify-end gap-2">
      <button
        title="Modifier"
        className="icon-button"
        onClick={() => {
          setModalMode('edit')
          setSelectedUser(user)
          setIsModalOpen(true)
        }}
      >
        <Edit3 size={16} />
      </button>
      <button
        title="Supprimer"
        className="icon-button"
        onClick={() => handleDelete(user._id)}
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
  if (error) {
    return (
      <div className="text-center badge-error">
        Erreur lors du chargement des utilisateurs : {error?.data?.message || 'Erreur inconnue'}
      </div>
    )
  }
 const sortedUSers = [...users].sort((a, b) =>
        a.lastname.localeCompare(b.lastname)
    )
  return (
    <div className="card theme-transition">
      <DataTable
        columns={columns}
        data={sortedUSers}
        isLoading={isLoading}
        rowActions={rowActions}
        pageSize={5}
      />

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        userData={selectedUser}
        onSuccess={refetch}
      />
    </div>
  )
}

export default UserTable