import { useState } from 'react'
import { useGetAllUsersQuery, useDeleteUserMutation } from '../../store/api/usersApi'
import { Trash2, Edit3, User } from 'lucide-react'
import toast from 'react-hot-toast'
import UserModal from './UserModal'

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

  const getRoleBadge = (role) => {
    const roles = {
      superAdmin: { label: 'Super Admin', class: 'badge-error' },
      manager: { label: 'Manager', class: 'badge-warning' },
      user: { label: 'Formateur', class: 'badge-info' },
    }
    const conf = roles[role] || roles.user
    return <span className={`badge ${conf.class}`}>{conf.label}</span>
  }

  const getStatusBadge = (isActive) => (
    <span className={`badge ${isActive ? 'badge-success' : 'badge-error'}`}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        marginRight: '6px',
        display: 'inline-block'
      }}></span>
      {isActive ? 'Actif' : 'Inactif'}
    </span>
  )

  if (isLoading) {
    return (
      <div className="flex-center" style={{ height: '16rem', color: 'var(--text-muted)' }}>
        <div className="loading-spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
        <span className="ml-4">Chargement des utilisateurs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <p style={{ fontWeight: '600' }}>Erreur de chargement des utilisateurs</p>
        <p>{error.data?.message || 'Une erreur est survenue'}</p>
      </div>
    )
  }

  return (
    <div className="card theme-transition">
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: '700px' }}>
          <thead style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              {['Utilisateur', 'Email', 'Rôle', 'Spécialisation', 'Statut', 'Actions'].map((title, idx) => (
                <th key={idx} style={{
                  padding: '1rem 1.5rem',
                  textAlign: idx === 5 ? 'right' : 'left',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  minWidth: '120px'
                }}>{title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                  <div className="flex-center" style={{ flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '12px', backgroundColor: 'var(--surface-alt)', borderRadius: '50%' }}>
                      <User size={32} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-primary)', fontWeight: '500', marginBottom: '4px' }}>Aucun utilisateur</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Commencez par en créer un</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : users.map((user) => (
              <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      {user.firstname?.[0]}{user.lastname?.[0]}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        color: 'var(--text-primary)',
                        fontWeight: '500',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {user.firstname} {user.lastname}
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <p style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '200px'
                  }}>{user.email}</p>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>{getRoleBadge(user.role)}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span className="badge badge-neutral">{user.specialization}</span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>{getStatusBadge(user.isActive)}</td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      title="Modifier"
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
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
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleDelete(user._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
