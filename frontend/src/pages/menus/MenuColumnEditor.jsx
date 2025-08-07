import React from 'react'
import MenuSectionEditor from './MenuSectionEditor'

/**
 * MenuColumnEditor — Affiche toutes les sections d'une colonne (cuisine/service)
 * @param {string} title
 * @param {object} formateur — user assigné à la colonne
 * @param {array} sectionKeys
 * @param {object} formSections — valeurs RHF actuelles { [sectionKey]: [itemIds] }
 * @param {array} itemsList — tous les items pour l'autocomplete
 * @param {object} errors — erreurs YUP actuelles
 * @param {object} user — user courant (pour droits)
 * @param {function} onChange — callback (sectionKey, items)
 * @param {function} onCreateItem
 * @param {boolean} itemsLoading
 * @param {object} sectionsConfig — config des sections (label/couleur/etc)
 */
function MenuColumnEditor({
    title,
    formateur,
    sectionKeys,
    formSections,
    itemsList,
    errors,
    user,
    onChange,
    onCreateItem,
    itemsLoading,
    sectionsConfig,   // <-- Ajout ici !
}) {

    return (
        <div>
            <h2 className='section-chips-title'>{title}
                {formateur && (
                    <span><em>{formateur.firstname} {formateur.lastname}</em></span>
                )}
            </h2>
            <div>
                {sectionKeys.map((sectionKey) => (
                    <MenuSectionEditor
                        key={sectionKey}
                        sectionKey={sectionKey}
                        config={sectionsConfig[sectionKey]}
                        items={formSections[sectionKey] || []}
                        allItemsList={itemsList}
                        onChange={items => onChange(sectionKey, items)}
                        onCreateItem={onCreateItem}
                        errors={errors.sections?.[sectionKey]}
                        user={user}
                        loading={itemsLoading}
                    />
                ))}
            </div>
        </div>
    )
}

export default MenuColumnEditor
