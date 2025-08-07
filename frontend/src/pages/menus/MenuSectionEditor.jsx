import SmartAutocomplete from '../../components/common/SmartAutocomplete'
import ItemPill from '../../components/common/ItemPill'
import { LockIcon } from 'lucide-react'

/**
 * MenuSectionEditor — gère l'édition d'une section du menu (Entrée, Plat, ...)
 * @param {string} sectionKey
 * @param {object} config — config couleurs/label de la section
 * @param {array} items — IDs d’items sélectionnés pour la section
 * @param {array} allItemsList — liste complète pour l’autocomplete
 * @param {function} onChange — callback ([...newIds]) lors de modification
 * @param {function} onCreateItem — callback de création rapide d’un item
 * @param {object} errors — erreurs YUP pour cette section
 * @param {object} user — user courant pour droits
 * @param {boolean} loading — loading pour l’autocomplete
 */
const MenuSectionEditor = ({
    sectionKey,
    config,
    items = [],
    allItemsList = [],
    onChange,
    onCreateItem,
    errors,
    user,
    loading,

}) => {
    // ======= LOGIQUE MÉTIER =======
    // Extraction objets items depuis IDs (si besoin)
    const itemObjs = items.map(itemId =>
        allItemsList.find(i => i._id === itemId) || { _id: itemId, name: "?" }
    )

    // Contrôle de droits (à affiner si besoin)
    const isEditable = user && (user.role === 'superAdmin' || user.role === 'manager')

    // ======= RENDER =======
    return (
        <div className="menu-section-composer">
            <div className="section-label-row">
                <span className="section-label-badge">
                    <span className="section-label-text">{config.label}</span>
                    <span className="section-count-badge">{items.length}</span>
                </span>
                <div className="menu-synthesis-items">
                    {itemObjs.map(item => (
                        <div key={item._id} className="menu-item-row">
                            <ItemPill
                                item={item}
                                color={config.color}
                                onRemove={isEditable ? () => onChange(items.filter(id => id !== item._id)) : undefined}
                                showTooltip
                                disabled={!isEditable}
                                authors={item.authors}
                            />

                            {/* Cadenas si non éditable */}
                            {!isEditable && (
                                <span
                                    className="item-lock-icon"
                                    title="Modification interdite : vous n’êtes pas l’auteur"
                                >
                                    <LockIcon size={16} />
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {/* Autocomplete */}
            <div className="input-group-custom">
                <SmartAutocomplete
                    category={sectionKey}
                    items={allItemsList}
                    selectedItems={items}
                    onChange={onChange}
                    onCreateItem={onCreateItem}
                    loading={loading}
                    placeholder={`Rechercher des ${config.label}...`}
                    color={config.color}
                    className="input-custom"
                />
            </div>
            {/* Erreur de validation */}
            {errors && (
                <p className="form-error">
                    {errors.message}
                </p>
            )}
        </div>
    )
}

export default MenuSectionEditor
