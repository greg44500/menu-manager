// ServiceTablePanel.jsx
// Ce composant présente la colonne de droite de l'écran "services".
// Il affiche la table des services, les boutons d'action, et gère l'ouverture de la modale MenuEditorModal.
// Toute la logique métier de récupération et sélection de données doit être déportée au parent.
import { useState } from 'react'
import { Plus, Edit3, Utensils, Replace, Trash2 } from 'lucide-react'
import DataTable from '../../components/common/DataTable'
import MenuEditorModal from '../menus/MenuEditorModal'
import { useDeleteMenuMutation } from '../../store/api/menuApi'
import { useUpdateMenuMutation } from '../../store/api/menuApi'
import { useGetMenuByIdQuery } from '../../store/api/menuApi'
import { toast } from 'react-hot-toast'
/**
 * @param {Object} props
 * @param {Array} allServices - Liste des services à afficher dans le tableau
 * @param {Boolean} loading - Indique si les données sont en cours de chargement
 * @param {Function} onCreateService - Callback pour création d'un service (à relier plus tard si besoin)
 * @param {Function} onMenuSaved - Callback appelé après sauvegarde menu (rafraîchissement parent)
 * @param {Function} getProgressionForService - Helper pour retrouver la progression liée à un service
 */
const ServiceTablePanel = ({
  allServices,
  loading,
  onCreateService,
  onMenuSaved,
  getProgressionForService,

}) => {
  // Etat local pour la modale d'édition du menu
  const [deleteMenu] = useDeleteMenuMutation();
  const [updateMenu] = useUpdateMenuMutation()
  const [editingService, setEditingService] = useState(null)



  // EXTERNALISATION de la fonction d’assignation
  const handleToggleRestaurant = async (menu) => {
    if (!menu) return;
    try {
      await updateMenu({ id: menu._id, isRestaurant: !menu.isRestaurant }).unwrap();
      toast.success(
        menu.isRestaurant
          ? 'Service retiré du restaurant.'
          : 'Service assigné au restaurant !'
      );
      onMenuSaved && onMenuSaved();
    } catch (err) {
      toast.error('Erreur lors de la modification du service restaurant');
      console.log(err)
    }
  };
  // Fonction de suppression du menu
  const handleDeleteMenu = async (menuId) => {
    if (window.confirm('Supprimer ce menu ? Cette action est irréversible.')) {
      try {
        await deleteMenu(menuId).unwrap();
        toast.success('Menu supprimé !');
        onMenuSaved && onMenuSaved(); // 👈 Ici tu déclenches le refetch
      } catch (error) {
        toast.error(error?.data?.message || "Erreur lors de la suppression du menu");
      }
    }
  }

  return (
    <div className="right-panel-service">
      <div className="card">
        <div className="card-header">
          <div className='card-header-position'>
            <h2 className='card-header-title'>Liste des services</h2>
            <button className="btn btn-primary card-header-btn" onClick={onCreateService}>
              <Plus size={16} />
              Créer un service
            </button>
          </div>
        </div>
        <div className="card-content">
          <DataTable
            data={allServices}
            loading={loading}
            columns={[
              { header: 'Semaine', accessorKey: 'weekNumber' },
              {
                header: 'Date (Lundi)',
                accessorKey: 'serviceDate',
                cell: ({ row }) => new Date(row.original.serviceDate).toLocaleDateString('fr-FR')
              },
              {
                header: 'Type',
                cell: ({ row }) =>
                  row.original.menu?.isRestaurant ? (
                    <span className="badge badge-success">Service Restaurant</span>
                  ) : (
                    row.original.serviceType?.name || '—'
                  )
              },
              {
                header: 'Menus',
                cell: ({ row }) => {
                  const sections = row.original.menu?.sections || {};
                  // Pas de warning eslint: entry[1] seulement
                  const filledSections = Object.entries(sections).filter((entry) => entry[1] && entry[1].length > 0);
                  if (filledSections.length === 0) return "Non défini";
                  return (
                    <div>
                      {filledSections.map(([section, items]) => (
                        <div key={section}>
                          <strong>{section}</strong> :{" "}
                          {items.map(item => (
                            <span key={item._id} className="badge badge-secondary mx-1">{item.name} </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                }
              },
              {
                header: 'Statut',
                cell: ({ row }) => (
                  row.original.menu ? (
                    <span className="badge badge-success">Complété</span>
                  ) : (
                    <span className="badge badge-warning">À compléter</span>
                  )
                )
              },
              {
                header: 'Actions',
                cell: ({ row }) => {
                  const service = row.original
                  return (
                    <div className="flex items-center gap-2">
                      <button
                        title="Créer/Modifier le menu"
                        className="icon-button"
                        onClick={() => setEditingService(service)}
                      >
                        <Edit3 size={16} />
                      </button>
                      {service.menu && (
                        <>
                          <button
                            title={service.menu.isRestaurant ? "Retirer du restaurant" : "Assigner au restaurant"}
                            className="icon-button"
                            onClick={() => handleToggleRestaurant(service.menu)}
                          >
                            <Utensils size={16} />
                          </button>
                          <button
                            title="Assigner un remplaçant"
                            className="icon-button">
                            <Replace size={16} />
                          </button>
                          <button
                            title="Supprimer ce menu"
                            className="icon-button"
                            onClick={() => handleDeleteMenu(service.menu._id)}>

                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  )
                }
              },
            ]}
          />
          {/* Modale édition menu, ne s'affiche que si editingService défini */}
          <MenuEditorModal
            isOpen={!!editingService}
            service={editingService}
            progression={editingService && getProgressionForService(editingService._id)}
            menu={editingService?.menu}
            onClose={() => setEditingService(null)}
            onSaved={() => {
              setEditingService(null)
              onMenuSaved && onMenuSaved()
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ServiceTablePanel
