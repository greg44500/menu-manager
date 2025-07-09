// ✅ UserTable.jsx - avec badge de statut et actions
import { Pencil, Trash } from 'lucide-react'
import { useGetAllUsersQuery } from '@/store/api/usersApi'
import { useEffect } from 'react'

const UserTable = ({ onEdit, isRefreshing }) => {
    const { data, isLoading, refetch } = useGetAllUsersQuery()
    const users = data?.users || []

    // Rafraîchissement manuel déclenché par parent
    useEffect(() => {
        if (isRefreshing) refetch()
    }, [isRefreshing, refetch])

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border border-border bg-surface rounded-md shadow-sm">
                <thead className="bg-muted">
                    <tr>
                        <th className="p-3">Nom</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Rôle</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id} className="border-t border-border hover:bg-muted/40">
                            <td className="p-3">{user.name}</td>
                            <td className="p-3">{user.email}</td>
                            <td className="p-3">{user.role}</td>
                            <td className="p-3">
                                <span className={`inline-flex items-center gap-2 text-sm px-2 py-1 rounded-full font-medium ${user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: user.isOnline ? 'green' : 'gray' }}></span>
                                    {user.isOnline ? 'Connecté' : 'Hors ligne'}
                                </span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                                <button onClick={() => onEdit(user)} className="btn-icon btn-ghost">
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => alert('Suppression à implémenter')} className="btn-icon btn-danger">
                                    <Trash size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {!isLoading && users.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center p-4 text-muted">
                                Aucun utilisateur trouvé.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default UserTable
