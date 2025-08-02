import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Modal from '../../components/common/Modal'
import { useGetItemsQuery, useCreateItemMutation } from '@/store/api/itemApi'
import { useCreateMenuMutation, useUpdateMenuMutation } from '@/store/api/menuApi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { menuSchema } from '../../validation/menuSchema'
import SmartAutocomplete from '../../components/common/SmartAutocomplete'
import ItemPill from '../../components/common/ItemPill'
import { Utensils, LockIcon } from 'lucide-react'

// -------- FONCTION UTILITAIRE EN DEHORS DU COMPOSANT --------
function sectionsToIdList(sections = {}) {
    const result = {}
    Object.entries(sections).forEach(([key, items]) => {
        result[key] = Array.isArray(items)
            ? items.map(item => typeof item === 'string' ? item : (item._id || item.id))
            : []
    })
    return result
}

// ----------- CONFIGURATION SECTIONS -----------
const SECTIONS_CONFIG = {
    'AB': { label: 'AB', color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
    'Entrée': { label: 'Entrées', color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
    'Plat': { label: 'Plats', color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
    'Fromage': { label: 'Fromages', color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
    'Dessert': { label: 'Desserts', color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
    'Boisson': { label: 'Boissons', color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
}
const SECTIONS_ORDER = ['AB', 'Entrée', 'Plat', 'Fromage', 'Dessert', 'Boisson']

// -------------- LE COMPOSANT ---------------
const MenuEditorModal = ({
    isOpen,
    onClose,
    service,
    menu,
    progression,
    onSaved,
}) => {
    const { user } = useSelector(state => state.auth)
    // Sécurise la lecture du role même si user pas encore dispo
    const isManager = ['manager', 'superAdmin'].includes(user?.role);
    // Sécurise progression
    const authors = progression?.teachers || [];
    console.log("DEBUG", authors, isManager)

    // Data RTK Query
    const { data: itemsData, isLoading: itemsLoading } = useGetItemsQuery()
    const itemsList = itemsData?.items || []
    const [createItem] = useCreateItemMutation()
    const [createMenu, { isLoading: isCreating }] = useCreateMenuMutation()
    const [updateMenu, { isLoading: isUpdating }] = useUpdateMenuMutation()

    // State
    const [activeSections, setActiveSections] = useState([])



    // Date service
    const serviceDate = service?.serviceDate || null
    const date = serviceDate
        ? new Date(serviceDate).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
        : 'date inconnue'

    // Détecte les sections actives selon menu courant ou par défaut
    const defaultSections = useMemo(() => {
        if (menu && menu.sections) {
            return Object.keys(menu.sections).filter(key =>
                menu.sections[key] && menu.sections[key].length > 0
            )
        }
        return ['Entrée', 'Plat', 'Dessert']
    }, [menu])

    // Formulaire RHF
    const {
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(menuSchema),
        defaultValues: {
            sections: sectionsToIdList(menu?.sections || {}),
        }
    })

    // Set sections actives lors du changement de menu
    useEffect(() => {
        setActiveSections(defaultSections)
    }, [defaultSections])

    // Reset form lorsque menu change (édition/nouveau)
    useEffect(() => {
        reset({
            sections: sectionsToIdList(menu?.sections || {}),
        })
    }, [menu, reset])

    // Suivi des sections du formulaire
    const sectionsValue = watch('sections')
    const formSections = useMemo(() => sectionsValue || {}, [sectionsValue])

    // Ajouter/enlever une section
    const handleSectionToggle = (sectionKey) => {
        setActiveSections(prev => {
            const newSections = prev.includes(sectionKey)
                ? prev.filter(s => s !== sectionKey)
                : [...prev, sectionKey]
            // Nettoyage des items si la section est désactivée
            if (!newSections.includes(sectionKey)) {
                setValue(`sections.${sectionKey}`, [])
            }
            return newSections
        })
    }

    // Mise à jour d'une section
    const handleSectionItemsChange = (sectionKey, items) => {
        setValue(`sections.${sectionKey}`, items)
    }

    // Création d'item
    const handleCreateItem = async (name, category) => {
        try {
            const newItem = await createItem({ name: name.trim(), category }).unwrap()
            toast.success(`"${name}" ajouté avec succès`)
            return newItem._id
        } catch (error) {
            toast.error(error?.data?.message || "Erreur lors de la création")
            console.error('Erreur création item:', error)
            return null
        }
    }

    // Soumission du formulaire
    const onSubmit = async (data) => {
        try {
            const SECTIONS_KEYS = ["AB", "Entrée", "Plat", "Fromage", "Dessert", "Boisson"]
            const sectionsPayload = {}
            SECTIONS_KEYS.forEach(sectionKey => {
                sectionsPayload[sectionKey] = data.sections?.[sectionKey] || []
            })
            const payload = {
                serviceId: service._id,
                sections: sectionsPayload,
            }
            if (menu) {
                await updateMenu({ id: menu._id, ...payload }).unwrap()
                toast.success('Menu mis à jour avec succès', { duration: 3000 })
            } else {
                await createMenu(payload).unwrap()
                toast.success('Menu créé avec succès', { duration: 3000 })
            }
            onSaved?.()
            onClose()
        } catch (error) {
            toast.error(error?.data?.message || 'Erreur lors de la sauvegarde')
            console.error('Erreur soumission:', error)
        }
    }

    // Stats dynamiques
    const menuStats = useMemo(() => {
        let totalItems = 0
        const sectionCounts = {}
        activeSections.forEach(sectionKey => {
            const items = formSections[sectionKey] || []
            sectionCounts[sectionKey] = items.length
            totalItems += items.length
        })
        return { totalItems, sectionCounts }
    }, [activeSections, formSections])

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="menu-modal-title">
                    {menu ? `Modifier le menu du ${date}` : `Créer le menu du ${date}`}
                </div>
            }
        >
            <form className='form-container-menudashboard' onSubmit={handleSubmit(onSubmit)}>
                <div className="form-container-dashboard">
                    <div className="dashboard-left">
                        <div className="dashboard-section">
                            <div className="dashboard-section-header">
                                <h3 className="dashboard-section-title">Composition du Menu</h3>
                            </div>
                            {/* Sélecteur de sections */}
                            <div className="section-selector">
                                <p className="label">Sections à inclure :</p>
                                <div className="section-chips">
                                    {Object.entries(SECTIONS_CONFIG).map(([key, config]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleSectionToggle(key)}
                                            className={`section-chip${activeSections.includes(key) ? ' active' : ''}`}
                                            aria-pressed={activeSections.includes(key)}
                                            tabIndex={0}
                                        >
                                            <span className="section-chip-content">
                                                {config.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Sections actives et items */}
                            <div className="active-sections">
                                {SECTIONS_ORDER.filter(sectionKey => activeSections.includes(sectionKey)).map(sectionKey => {
                                    const config = SECTIONS_CONFIG[sectionKey]
                                    const sectionItems = formSections[sectionKey] || []
                                    return (
                                        <div key={sectionKey} className="menu-section-composer">
                                            <div className="section-label-row">
                                                <span className="section-label-badge">
                                                    <span className="section-label-text">{config.label}</span>
                                                    <span className="section-count-badge">{sectionItems.length}</span>
                                                </span>
                                                <div className="menu-synthesis-items">
                                                    {sectionItems.map(itemId => {
                                                        const item = itemsList.find(i => i._id === itemId)
                                                        if (!item) return null
                                                        // Contrôle de droits
                                                        const editable = (item.authors || []).some(a => a._id === user.id)
                                                            || user.role === 'superAdmin'
                                                            || user.role === 'manager'
                                                        return (
                                                            <div key={itemId} className="menu-item-row">
                                                                <ItemPill
                                                                    item={item}
                                                                    color={config.color}
                                                                    onRemove={editable ? () => {
                                                                        const newItems = sectionItems.filter(id => id !== itemId)
                                                                        handleSectionItemsChange(sectionKey, newItems)
                                                                    } : undefined}
                                                                    showTooltip
                                                                    disabled={!editable}
                                                                    authors={item.authors}
                                                                />
                                                                {/* Auteurs */}
                                                                {item.authors && (
                                                                    <span className="item-authors">
                                                                        {item.authors.map(a => (
                                                                            <span key={a._id} className="item-author-badge">
                                                                                {a.firstname} {a.lastname}
                                                                            </span>
                                                                        ))}
                                                                    </span>
                                                                )}
                                                                {/* Cadenas si non éditable */}
                                                                {!editable && (
                                                                    <span
                                                                        className="item-lock-icon"
                                                                        title="Modification interdite : vous n’êtes pas l’auteur"
                                                                    >
                                                                        <LockIcon size={16} />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            {/* Autocomplete */}
                                            <div className="input-group-custom">
                                                <SmartAutocomplete
                                                    category={sectionKey}
                                                    items={itemsList}
                                                    selectedItems={sectionItems}
                                                    onChange={(items) => handleSectionItemsChange(sectionKey, items)}
                                                    onCreateItem={handleCreateItem}
                                                    loading={itemsLoading}
                                                    placeholder={`Rechercher des ${config.label}...`}
                                                    color={config.color}
                                                    className="input-custom"
                                                />
                                            </div>
                                            {/* Erreur de validation */}
                                            {errors.sections?.[sectionKey] && (
                                                <p className="form-error">
                                                    {errors.sections[sectionKey]?.message}
                                                </p>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Actions */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onClose}
                        disabled={isCreating || isUpdating}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className={`btn btn-primary${(isCreating || isUpdating) ? 'btn-loading' : ''}`}
                        disabled={isCreating || isUpdating || menuStats.totalItems === 0}
                    >
                        {isCreating || isUpdating
                            ? (menu ? 'Mise à jour...' : 'Création...')
                            : (menu ? 'Mettre à jour' : 'Créer le menu')
                        }
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default MenuEditorModal
