import { useState, useRef, useEffect } from 'react'
import { Save, TrendingUp } from 'lucide-react'

const SmartAutocomplete = ({
    category,
    items = [],
    selectedItems = [],
    onChange,
    onCreateItem,
    loading = false,
    placeholder = "Rechercher...",
    color = 'var(--primary)'
}) => {
    const [inputValue, setInputValue] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState(-1)
    const [isCreating, setIsCreating] = useState(false)
    const inputRef = useRef(null)
    const listRef = useRef(null)

    // Recherche floue très simple
    const fuzzyMatch = (text, pattern) => {
        let patternIndex = 0
        for (let i = 0; i < text.length && patternIndex < pattern.length; i++) {
            if (text[i] === pattern[patternIndex]) {
                patternIndex++
            }
        }
        return patternIndex === pattern.length
    }

    // Items filtrés (suggestions)
    const searchTerm = inputValue.trim().toLowerCase()
    const filteredItems = items
        .filter(item => {
            if (!item?.name) return false
            if (selectedItems.includes(item._id)) return false
            if (item.category !== category) return false
            if (!searchTerm) return false

            const itemName = item.name.toLowerCase()
            if (itemName.includes(searchTerm)) return true
            return fuzzyMatch(itemName, searchTerm)
        })
        .slice(0, 8)

    const itemExists = items.some(item =>
        item?.name?.toLowerCase().trim() === searchTerm &&
        item.category === category
    )

    // Sélection d'un item
    const handleSelectItem = (item) => {
        if (!item || selectedItems.includes(item._id)) return
        onChange([...selectedItems, item._id])
        setInputValue('')
        setIsOpen(false)
        setFocusedIndex(-1)
        inputRef.current?.classList.add('item-added')
        setTimeout(() => {
            inputRef.current?.classList.remove('item-added')
        }, 300)
    }

    // Création d'un nouvel item
    const handleCreateItem = async () => {
        const trimmedValue = inputValue.trim()
        if (!trimmedValue || itemExists || isCreating) return
        setIsCreating(true)
        try {
            const newItemId = await onCreateItem(trimmedValue, category)
            if (newItemId) {
                onChange([...selectedItems, newItemId])
                setInputValue('')
                setIsOpen(false)
                setFocusedIndex(-1)
            }
        } finally {
            setIsCreating(false)
        }
    }

    // Gestion clavier
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown') {
                setIsOpen(true)
                setFocusedIndex(0)
                e.preventDefault()
            }
            return
        }
        const canCreate = searchTerm && !itemExists
        const totalItems = filteredItems.length + (canCreate ? 1 : 0)
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setFocusedIndex(prev => (prev + 1) % totalItems)
                break
            case 'ArrowUp':
                e.preventDefault()
                setFocusedIndex(prev => (prev - 1 + totalItems) % totalItems)
                break
            case 'Enter':
                e.preventDefault()
                if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
                    handleSelectItem(filteredItems[focusedIndex])
                } else if (focusedIndex === filteredItems.length && canCreate) {
                    handleCreateItem()
                }
                break
            case 'Escape':
                setIsOpen(false)
                setFocusedIndex(-1)
                inputRef.current?.blur()
                break
        }
    }

    // Scroll to item focus
    useEffect(() => {
        if (focusedIndex >= 0 && listRef.current) {
            const el = listRef.current.children[focusedIndex]
            if (el) el.scrollIntoView({ block: 'nearest' })
        }
    }, [focusedIndex])

    // Click-outside pour fermer le dropdown proprement
    useEffect(() => {
        function handleClick(e) {
            if (
                inputRef.current &&
                !inputRef.current.contains(e.target) &&
                listRef.current &&
                !listRef.current.contains(e.target)
            ) {
                setIsOpen(false)
                setFocusedIndex(-1)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClick)
            return () => document.removeEventListener('mousedown', handleClick)
        }
    }, [isOpen])

    return (
        <div
            className="smart-autocomplete"
            style={{ '--accent-color': color }}
        >
            <div className="autocomplete-input-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    className="autocomplete-input"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={e => {
                        setInputValue(e.target.value)
                        setIsOpen(e.target.value.trim().length > 0)
                        setFocusedIndex(-1)
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (inputValue.trim()) setIsOpen(true)
                    }}
                    disabled={loading}
                    autoComplete="off"
                />
                {loading && (
                    <div className="autocomplete-loading">
                        <div className="loading-spinner" />
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && inputValue.trim() && (
                <div className="autocomplete-dropdown" ref={listRef}>
                    {filteredItems.map((item, idx) => (
                        <div
                            key={item._id}
                            className={`autocomplete-item${idx === focusedIndex ? ' focused' : ''}`}
                            onClick={() => handleSelectItem(item)}
                            onMouseEnter={() => setFocusedIndex(idx)}
                        >
                            <div className="item-content">
                                <span className="item-name">{item.name}</span>
                                {item.isPopular && (
                                    <TrendingUp size={12} className="popularity-icon" />
                                )}
                            </div>
                            <span className="item-category">{item.category}</span>
                        </div>
                    ))}

                    {/* Création d'un nouvel item */}
                    {searchTerm && !itemExists && (
                        <div
                            className={
                                `autocomplete-create${focusedIndex === filteredItems.length ? ' focused' : ''}${isCreating ? ' creating' : ''}`
                            }
                            onClick={handleCreateItem}
                            onMouseEnter={() => setFocusedIndex(filteredItems.length)}
                        >
                            <Save size={16} />
                            <span>
                                {isCreating
                                    ? 'Création en cours...'
                                    : `Créer "${inputValue.trim()}"`
                                }
                            </span>
                        </div>
                    )}

                    {/* States d'absence */}
                    {filteredItems.length === 0 && itemExists && (
                        <div className="autocomplete-empty">
                            Cet item existe déjà !
                        </div>
                    )}
                    {filteredItems.length === 0 && !itemExists && searchTerm && (
                        <div className="autocomplete-empty">
                            Aucun résultat trouvé...
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SmartAutocomplete
