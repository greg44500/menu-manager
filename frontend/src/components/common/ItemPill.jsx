import { X, Info } from 'lucide-react'
import { useState } from 'react'

/**
 * Composant ItemPill
 * - Affiche un item sous forme de pillule avec couleur de catégorie
 * - Tooltip détaillé (nom, catégorie, date création, auteurs)
 * - Suppression animée, callback vers parent via onRemove
 * - Respecte les styles CSS custom définis dans components.css
 */
const ItemPill = ({
    item,
    color = 'var(--primary)',
    onRemove,
    showTooltip = true,
}) => {
    const [isRemoving, setIsRemoving] = useState(false)
    const [showTooltipState, setShowTooltipState] = useState(false)

    // Animation + suppression front de la pillule
    const handleRemove = () => {
        setIsRemoving(true)
        setTimeout(() => {
            onRemove?.(item._id)
        }, 200)
    }

    // Formatage date en français JJ/MM/AAAA
    const formatDate = (dateString) => {
        if (!dateString) return 'Date inconnue'
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    // Affichage des auteurs (prénom + nom)
    const getAuthorsNames = (authors) => {
        if (!authors || authors.length === 0) return 'Auteur inconnu'
        return authors
            .map((author) =>
                typeof author === 'object'
                    ? `${author.firstname || ''} ${author.lastname || ''}`.trim()
                    : 'Auteur'
            )
            .join(', ')
    }

    // Libellé user-friendly pour la catégorie
    const getCategoryLabel = (cat) => {
        switch (cat) {
            case 'AB':
                return 'Amuse-bouche'
            case 'Entrée':
                return 'Entrée'
            case 'Plat':
                return 'Plat principal'
            case 'Fromage':
                return 'Fromage'
            case 'Dessert':
                return 'Dessert'
            case 'Cocktail':
                return 'Cocktail'
            default:
                return cat
        }
    }

    // Définition des couleurs selon la catégorie si besoin d’override
    const pillColor = color
    const pillBg = color + '1A' // alpha faible

    // Gestion du focus pour accessibilité (optionnel)
    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') handleRemove()
        if (e.key === 'Enter' && showTooltip) setShowTooltipState((s) => !s)
    }

    return (
        <div className="pill-container">
            <div
                className={`item-pill${isRemoving ? ' removing' : ''}`}
                style={{
                    '--pill-color': pillColor,
                    '--pill-bg': pillBg,
                }}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onMouseEnter={() => setShowTooltipState(true)}
                onMouseLeave={() => setShowTooltipState(false)}
                aria-label={item.name}
            >
                {/* Contenu principal de la pillule */}
                <span className="pill-name" style={{ fontWeight: 500 }}>
                    {item.name}
                </span>

                {/* Bouton info pour afficher le tooltip */}
                {showTooltip && (
                    <button
                        type="button"
                        className="pill-info-btn"
                        aria-label="Afficher les détails"
                        tabIndex={-1}
                        onMouseEnter={() => setShowTooltipState(true)}
                        onFocus={() => setShowTooltipState(true)}
                        onBlur={() => setShowTooltipState(false)}
                        style={{ color: pillColor }}
                    >
                        <Info size={12} />
                    </button>
                )}

                {/* Bouton suppression */}
                <button
                    type="button"
                    className="pill-remove-btn"
                    aria-label="Supprimer cet item"
                    onClick={handleRemove}
                    disabled={isRemoving}
                    style={{ color: 'var(--error)' }}
                >
                    <X size={14} />
                </button>

                {/* Bloc TOOLTIP INFO */}
                {showTooltip && showTooltipState && (
                    <div className="pill-tooltip">
                        <div className="tooltip-content">
                            <div className="tooltip-header">{item.name}</div>
                            <div className="tooltip-row">
                                <span className="tooltip-label">Catégorie :</span>
                                <span>{getCategoryLabel(item.category)}</span>
                            </div>
                            <div className="tooltip-row">
                                <span className="tooltip-label">Créé le :</span>
                                <span>{formatDate(item.createdAt)}</span>
                            </div>
                            <div className="tooltip-row">
                                <span className="tooltip-label">Auteur :</span>
                                <span>{getAuthorsNames(item.authors)}</span>
                            </div>
                            {/* Badge traçabilité */}
                            <div className="tooltip-badge">
                                Traçabilité API activée
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ItemPill
