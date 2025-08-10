// src/pages/services/ServiceTablePanel.jsx
// ServiceTablePanel.jsx - VERSION TEST avec <input type="date"> (pas de DatePicker)
import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit3, Utensils, Trash2, BookCheck, BookMinus, Lock, Calendar } from 'lucide-react'
import DataTable from '../../components/common/DataTable'
import MenuEditorModal from '../menus/MenuEditorModal'
import { format } from 'date-fns'
// import { fr } from 'date-fns/locale'
import {
  useDeleteMenuMutation,
  useUpdateMenuMutation,
  useToggleMenuValidationMutation
} from '../../store/api/menuApi'
import { useUpdateServiceDateMutation } from '../../store/api/servicesApi'
import { toast } from 'react-hot-toast'
import { SECTIONS_CONFIG } from '../menus/sectionConfig'

/* ============================================================================
   PANEL LISTE DES SERVICES
   - Colonne Date remplacée par un <input type="date"> pour les tests de fonctions
   - Aucune règle de style inline : uniquement classes utilitaires
============================================================================ */

const ServiceTablePanel = ({
  allServices,
  loading,
  onCreateService,
  onMenuSaved,
  progressionId,
}) => {
  /* === ETATS & MUTATIONS MENUS === */
  const [deleteMenu] = useDeleteMenuMutation()
  const [updateMenu] = useUpdateMenuMutation()
  const [toggleMenuValidation] = useToggleMenuValidationMutation()
  const [editingService, setEditingService] = useState(null)

  /* === CELLULE D'EDITION DE DATE AVEC INPUT DATE === */
  const EditableDateCell = ({ service }) => {
    const [isUpdating, setIsUpdating] = useState(false)
    const [updateServiceDate] = useUpdateServiceDateMutation()

    // Date distante mémoïsée pour stabiliser les deps des hooks
    const remoteDate = useMemo(
      () => (service?.serviceDate ? new Date(service.serviceDate) : null),
      [service?.serviceDate]
    )

    // Chaîne "yyyy-MM-dd" pour l'input date
    const initialStr = remoteDate ? format(remoteDate, 'yyyy-MM-dd') : ''
    const [selectedDateStr, setSelectedDateStr] = useState(initialStr)

    // Resync local lorsque la valeur distante change (après onMenuSaved/refetch)
    useEffect(() => {
      setSelectedDateStr(remoteDate ? format(remoteDate, 'yyyy-MM-dd') : '')
    }, [remoteDate])

    const handleChange = async (e) => {
      const value = e.target.value // "yyyy-MM-dd" ou ""
      setSelectedDateStr(value)

      if (!value) {
        toast.error('Date invalide')
        return
      }

      const progId = service.progressionId || progressionId
      if (!progId) {
        toast.error('Impossible de trouver la progression')
        return
      }

      setIsUpdating(true)
      try {
        // Normaliser à midi pour éviter les surprises timezone
        const d = new Date(value)
        d.setHours(12, 0, 0, 0)

        await updateServiceDate({
          progressionId: progId,
          serviceId: service._id,
          serviceDate: d.toISOString(),
        }).unwrap()

        toast.success('Date mise à jour !')
        onMenuSaved?.()
      } catch (error) {
        toast.error(error?.data?.message || 'Erreur lors de la mise à jour')
        // rollback à la valeur distante
        setSelectedDateStr(initialStr)
      } finally {
        setIsUpdating(false)
      }
    }

    return (
      <div>
        <div>
          <input
            type="date"
            className="input input-sm"
            value={selectedDateStr}
            onChange={handleChange}
            disabled={isUpdating}
            aria-label="Changer la date du service"
          />
        </div>
      </div>
    )
  }

  /* === HELPERS PRODUCTIONS (formatage) === */
  const getCuisineProductions = (menu) => {
    if (!menu?.sections) return {}
    const cuisineSections = menu.productionAssignment?.cuisine || []
    const result = {}
    cuisineSections.forEach(key => {
      if (menu.sections[key]?.length > 0) result[key] = menu.sections[key]
    })
    return result
  }

  const getServiceProductions = (menu) => {
    if (!menu?.sections) return {}
    const serviceSections = menu.productionAssignment?.service || []
    const result = {}
    serviceSections.forEach(key => {
      if (menu.sections[key]?.length > 0) result[key] = menu.sections[key]
    })
    return result
  }

  const formatProductionsDisplay = (productions) => {
    const entries = Object.entries(productions)
    if (!entries.length) return <span className="text-text-muted">—</span>

    return (
      <div className="flex flex-col gap-1">
        {entries.map(([section, items]) => {
          const names = items.map(i => i.name).join(', ')
          return (
            <div key={section}className='badge-section-menu-container'>
              {/* Le badge ne doit pas rétrécir */}
              <span className="badge-section-menu">
                {SECTIONS_CONFIG[section]?.label || section}
              </span>

              {/* Bloc texte qui peut rétrécir et ellipser */}
              <span
                className="badge-section-menu-content"
                title={names} // tooltip au survol
              >
                {names}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  /* === HANDLERS MENU (toggle / validate / delete) === */
  const handleToggleRestaurant = async (menu) => {
    try {
      await updateMenu({ id: menu._id, isRestaurant: !menu.isRestaurant }).unwrap()
      toast.success(menu.isRestaurant ? 'Retiré du restaurant' : 'Assigné au restaurant')
      onMenuSaved?.()
    } catch {
      toast.error('Erreur lors de la modification')
    }
  }

  const handleToggleValidate = async (menu) => {
    try {
      await toggleMenuValidation({
        id: menu._id,
        isMenuValidate: !menu.isMenuValidate,
      }).unwrap()
    } catch {
      toast.error('Erreur lors de la validation')
      return
    }
    toast.success(menu.isMenuValidate ? 'Menu déverrouillé' : 'Menu validé')
    onMenuSaved?.()
  }

  const handleDeleteMenu = async (menuId) => {
    if (confirm('Supprimer ce menu ?')) {
      try {
        await deleteMenu(menuId).unwrap()
        toast.success('Menu supprimé')
        onMenuSaved?.()
      } catch {
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  /* === COLONNES DU TABLEAU === */
  const columns = [
    { header: 'Semaine', accessorKey: 'weekNumber' },
    { header: 'Date', cell: ({ row }) => <EditableDateCell service={row.original} /> },
    {
      header: 'Type',
      cell: ({ row }) =>
        row.original.menu?.isRestaurant
          ? <span className="badge badge-success">Restaurant</span>
          : <span className="badge badge-info">Cantine</span>
    },
    {
      header: 'Production Cuisine',
      cell: ({ row }) => formatProductionsDisplay(getCuisineProductions(row.original.menu))
    },
    {
      header: 'Production Service',
      cell: ({ row }) => formatProductionsDisplay(getServiceProductions(row.original.menu))
    },
    {
      header: 'Statut',
      cell: ({ row }) => {
        const validated = row.original.menu?.isMenuValidate
        return (
          <span className={`badge ${validated ? 'badge-success' : 'badge-warning'}`}>
            {validated ? 'Validé' : 'À valider'}
          </span>
        )
      }
    },
    {
      header: 'Actions',
      cell: ({ row }) => {
        const service = row.original
        const menu = service.menu
        const isLocked = menu?.isMenuValidate

        return (
          <div>
            <button
              className="icon-button"
              onClick={() => setEditingService(service)}
              title={isLocked ? 'Menu verrouillé' : 'Modifier'}
            >
              {isLocked ? <Lock size={16} /> : <Edit3 size={16} />}
            </button>

            {menu && (
              <>
                <button
                  className="icon-button"
                  onClick={() => handleToggleRestaurant(menu)}
                  title="Restaurant"
                >
                  <Utensils size={16} />
                </button>

                <button
                  className="icon-button"
                  onClick={() => handleToggleValidate(menu)}
                  title={isLocked ? 'Déverrouiller' : 'Valider'}
                >
                  {isLocked ? <BookMinus size={16} /> : <BookCheck size={16} />}
                </button>

                <button
                  className="icon-button text-red-600"
                  onClick={() => handleDeleteMenu(menu._id)}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        )
      }
    },
  ]

  /* === RENDER GLOBAL === */
  return (
    <div className="service-table-panel">
      <div className="card">
        <div className="card-header">
          <div className="card-header-position">
            <h2 className="card-header-title">Liste des services</h2>
            <button className="btn btn-primary card-header-btn" onClick={onCreateService}>
              <Plus size={16} />
              Créer un service
            </button>
          </div>
        </div>

        <div className="card-content">
          <DataTable data={allServices} loading={loading} columns={columns} />

          {editingService && (
            <MenuEditorModal
              isOpen={true}
              service={editingService}
              progression={{ _id: editingService.progressionId || progressionId }}
              menu={editingService.menu}
              onClose={() => setEditingService(null)}
              onSaved={() => {
                setEditingService(null)
                onMenuSaved?.()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceTablePanel
