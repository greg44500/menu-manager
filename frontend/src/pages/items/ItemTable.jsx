// ===============================
// Imports externes & internes
// ===============================
import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetItemsQuery, useDeleteItemMutation } from '../../store/api/itemApi';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

// ===============================
// Utils métier : contrôle des droits de suppression
// ===============================
const canDelete = user =>
    user && (user.role === 'superAdmin' || user.role === 'manager');

// ===============================
// Composant principal
// ===============================
const ItemTable = () => {
    // ======= RTK Query : fetch items + mutation suppression =======
    const { data, isLoading, refetch } = useGetItemsQuery();
    const [deleteItem] = useDeleteItemMutation();

    // ======= Accès user courant pour la gestion des droits =======
    const currentUser = useSelector(state => state.auth.user);

    // ===============================
    // State UI : recherche & filtre catégorie
    // ===============================
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Liste des catégories disponibles (à synchroniser si modif backend)
    const categories = [
        "AB", "Entrée", "Plat", "Fromage", "Dessert", "Boisson"
    ];

    // ===============================
    // Mémo filtrage + tri (nom A→Z)
    // ===============================
    const filteredItems = useMemo(() => {
        const items = data?.items || [];
        let res = items;
        if (search) {
            res = res.filter(item =>
                item.name.toLowerCase().includes(search.trim().toLowerCase())
            );
        }
        if (categoryFilter && categoryFilter !== "all") {
            res = res.filter(item => item.category === categoryFilter);
        }
        // Clonage du tableau AVANT tri
        return [...res].sort((a, b) =>
            a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
        );
    }, [data, search, categoryFilter]);

    // ===============================
    // State UI : gestion modale de suppression
    // ===============================
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    // ===============================
    // Actions métiers : ouverture et confirmation suppression
    // ===============================
    const handleDeleteClick = item => {
        setSelectedItem(item);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteItem(selectedItem._id).unwrap();
            toast.success('Item supprimé avec succès !');
            setDeleteModalOpen(false);
            setSelectedItem(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Erreur lors de la suppression");
        }
    };

    // ===============================
    // Définition des colonnes pour DataTable
    // ===============================
    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Nom',
            cell: ({ row }) => <span>{row.original.name}</span>,
        },
        {
            accessorKey: 'category',
            header: 'Catégorie',
            cell: ({ row }) => <span>{row.original.category}</span>,
        },
        {
            accessorKey: 'authors',
            header: 'Auteur(s)',
            cell: ({ row }) => (
                <span>
                    {(row.original.authors || [])
                        .map(a => a.firstname ? `${a.firstname} ${a.lastname || ''}` : a.email)
                        .join(', ') || '-'}
                </span>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: 'Créé le',
            cell: ({ row }) =>
                row.original.createdAt
                    ? new Date(row.original.createdAt).toLocaleDateString('fr-FR')
                    : '-',
        },
    ], []);

    // ===============================
    // Colonne "Actions" : bouton suppression si droit
    // ===============================
    const renderActions = item =>
        canDelete(currentUser) ? (
            <button
                className="icon-button"
                title="Supprimer l'item"
                onClick={() => handleDeleteClick(item)}
            >
                <Trash2 size={18} />
            </button>
        ) : null;

    // ===============================
    // Rendu principal UI
    // ===============================
    return (
        <>
            {/* Barre de recherche + filtre catégorie */}
            <div className="input-search-display">
                <input
                    type="text"
                    className="input"
                    placeholder="Rechercher par nom..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: 220 }}
                />
                <select
                    className="input"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    style={{ maxWidth: 160 }}
                >
                    <option value="all">Toutes catégories</option>
                    {categories.map(cat => (
                        <option value={cat} key={cat}>{cat}</option>
                    ))}
                </select>
                <button className="btn btn-primary" onClick={() => { setSearch(''); setCategoryFilter('all'); }}>
                    Réinitialiser les filtres
                </button>
            </div>

            {/* Tableau principal */}
            <DataTable
                columns={columns}
                data={filteredItems}
                isLoading={isLoading}
                rowActions={canDelete(currentUser) ? renderActions : null}
            />

            {/* Modale de confirmation suppression */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirmation de suppression"
            >
                <div>
                    <p>
                        Êtes-vous sûr de vouloir supprimer l’item : 
                        <strong className='modal-item'>{selectedItem?.name}</strong> ?
                    </p>
                    <div className="form-actions">
                        <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>
                            Annuler
                        </button>
                        <button className="btn btn-primary" onClick={handleConfirmDelete}>
                            Oui, supprimer
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ItemTable;
