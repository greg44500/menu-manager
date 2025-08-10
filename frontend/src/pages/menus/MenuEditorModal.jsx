import { useEffect, useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import Modal from '../../components/common/Modal'
import { useSelector } from 'react-redux'
import { useGetItemsQuery, useCreateItemMutation } from '@/store/api/itemApi'
import { useCreateMenuMutation, useUpdateMenuMutation } from '@/store/api/menuApi'
import { toast } from 'react-hot-toast'
import { menuSchema } from '../../validation/menuSchema'
import MenuColumnEditor from './MenuColumnEditor'
import { SECTIONS_CONFIG, SECTIONS_ORDER } from './sectionConfig'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { X, GripVertical } from 'lucide-react'

// =================== FONCTION UTILITAIRE ===================
function sectionsToIdList(sections = {}) {
    const result = {}
    Object.entries(sections).forEach(([key, items]) => {
        result[key] = Array.isArray(items)
            ? items.map(item => typeof item === 'string' ? item : (item._id || item.id))
            : []
    })
    return result
}

// =================== COMPONENT ============================
const MenuEditorModal = ({
    isOpen,
    onClose,
    service,
    menu,
    progression,
    onSaved,
}) => {
    // --- Sélecteurs Redux & Data API ---
    const { user } = useSelector(state => state.auth)
    const { data: itemsData, isLoading: itemsLoading } = useGetItemsQuery()
    const itemsList = itemsData?.items || []
    const [createItem] = useCreateItemMutation()
    const [createMenu, { isLoading: isCreating }] = useCreateMenuMutation()
    const [updateMenu, { isLoading: isUpdating }] = useUpdateMenuMutation()


    // --- État unifié pour le Drag & Drop ---
    const [dragState, setDragState] = useState({
        bank: [],
        cuisine: [],
        service: []
    })

    // RHF pour la gestion du contenu des sections
    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(menuSchema),
        defaultValues: {
            sections: sectionsToIdList(menu?.sections || {}),
        }
    })

    // --- Initialisation du drag state ---
    useEffect(() => {
        // Si on a déjà une répartition sauvegardée, on la restaure
        if (menu && menu.productionAssignment) {
            setDragState({
                bank: SECTIONS_ORDER.filter(key =>
                    !menu.productionAssignment.cuisine.includes(key) &&
                    !menu.productionAssignment.service.includes(key)
                ),
                cuisine: menu.productionAssignment.cuisine || [],
                service: menu.productionAssignment.service || []
            })
        } else if (menu && menu.sections) {
            // Fallback : si pas de productionAssignment, on fait une répartition par défaut
            const usedSections = Object.keys(menu.sections).filter(key =>
                menu.sections[key] && menu.sections[key].length > 0
            )

            const cuisineSections = []
            const serviceSections = []

            usedSections.forEach(sectionKey => {
                // Répartition par défaut si pas d'info
                if (['Entrée', 'Plat', 'Fromage'].includes(sectionKey)) {
                    cuisineSections.push(sectionKey)
                } else if (['AB', 'Dessert', 'Boisson'].includes(sectionKey)) {
                    serviceSections.push(sectionKey)
                } else {
                    cuisineSections.push(sectionKey)
                }
            })

            const bankSections = SECTIONS_ORDER.filter(key => !usedSections.includes(key))

            setDragState({
                bank: bankSections,
                cuisine: cuisineSections,
                service: serviceSections
            })
        } else {
            // État initial pour un nouveau menu
            setDragState({
                bank: SECTIONS_ORDER.filter(key => !['Entrée', 'Plat', 'Dessert'].includes(key)),
                cuisine: ['Entrée', 'Plat'],
                service: ['Dessert']
            })
        }
    }, [menu])

    // --- remet toutes les sections du formulaire à partir du menu courant ---
    useEffect(() => {
        if (!isOpen) return;                           // évite le reset quand la modale est fermée
        if (!menu) {
            // Nouveau menu : on remet les valeurs par défaut (vide)
            reset({ sections: sectionsToIdList({}) });
            return;
        }
        // Menu existant : pré-remplir avec les items sauvés
        reset({ sections: sectionsToIdList(menu.sections || {}) });
    }, [isOpen, menu, reset]);


    // --- RHF: suivi dynamique des items ---
    const sectionsValue = watch('sections')
    const formSections = useMemo(() => sectionsValue || {}, [sectionsValue])

    // ===================== DRAG & DROP AMÉLIORÉ =======================
    const handleDragEnd = (result) => {
        const { source, destination } = result
        // Note: draggableId est disponible dans result si besoin pour du debug
        // console.log('Dragging:', result.draggableId)

        // Pas de destination = annulation du drag
        if (!destination) return

        // Même position = pas de changement
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) return

        // Copie de l'état pour manipulation
        const newState = { ...dragState }

        // Retirer l'élément de la source
        const sourceList = [...newState[source.droppableId]]
        const [removed] = sourceList.splice(source.index, 1)
        newState[source.droppableId] = sourceList

        // Ajouter l'élément à la destination
        const destList = [...newState[destination.droppableId]]
        destList.splice(destination.index, 0, removed)
        newState[destination.droppableId] = destList

        // Mettre à jour l'état
        setDragState(newState)

        // Si on retire une section d'une colonne, réinitialiser ses items
        if (source.droppableId !== 'bank' && destination.droppableId === 'bank') {
            setValue(`sections.${removed}`, [])
        }
    }

    // ===================== SUPPRESSION DE SECTION ======================
    const handleRemoveSection = (columnId, sectionKey) => {
        setDragState(prev => ({
            ...prev,
            [columnId]: prev[columnId].filter(key => key !== sectionKey),
            bank: [...prev.bank, sectionKey].sort((a, b) =>
                SECTIONS_ORDER.indexOf(a) - SECTIONS_ORDER.indexOf(b)
            )
        }))
        // Réinitialiser les items de cette section
        setValue(`sections.${sectionKey}`, [])
    }

    // ===================== GESTION DES ITEMS ======================
    const handleSectionItemsChange = (sectionKey, items) => {
        setValue(`sections.${sectionKey}`, items)
    }

    const handleCreateItem = async (name, category) => {
        try {
            const result = await createItem({ name, category }).unwrap()
            toast.success(`Item "${name}" créé`)
            return result._id
        } catch (error) {
            toast.error('Erreur lors de la création')
            console.log(error)
            return null
        }
    }

    // ===================== SOUMISSION DU FORMULAIRE =======================
    const onSubmit = async (data) => {
        try {
            // Construire les sections avec tous les items
            const sectionsPayload = {}
            SECTIONS_ORDER.forEach(sectionKey => {
                sectionsPayload[sectionKey] = data.sections?.[sectionKey] || []
            })

            // NOUVEAU : Sauvegarder la répartition cuisine/service
            const productionAssignment = {
                cuisine: dragState.cuisine || [],
                service: dragState.service || []
            }

            const payload = {
                serviceId: service._id,
                sections: sectionsPayload,
                productionAssignment: productionAssignment, // Stocke qui fait quoi
            }

            if (menu) {
                await updateMenu({ id: menu._id, ...payload }).unwrap()
                toast.success('Menu mis à jour avec succès')
            } else {
                await createMenu(payload).unwrap()
                toast.success('Menu créé avec succès')
            }

            onSaved?.()
            onClose()
        } catch (error) {
            toast.error(error?.data?.message || 'Erreur lors de la sauvegarde')
            console.error('Erreur soumission:', error)
        }
    }

    // ===================== RENDER ===========================
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="menu-modal-title">
                    {menu ? "Modifier le menu" : "Créer le menu"}
                </div>
            }
            size="large"
        >
            <form className="form-container-menudashboard" onSubmit={handleSubmit(onSubmit)}>
                <DragDropContext onDragEnd={handleDragEnd}>
                    {/* ====== Banque centrale des sections ====== */}
                    <div className="section-bank-container">
                        <h3 style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'var(--text-muted)',
                            marginBottom: '0.75rem'
                        }}>
                            Sections disponibles (glissez pour utiliser)
                        </h3>
                        <Droppable droppableId="bank" direction="horizontal">
                            {(provided, snapshot) => (
                                <div
                                    className={`section-bank ${snapshot.isDraggingOver ? 'droppable-hover' : ''}`}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {dragState.bank.length > 0 ? (
                                        dragState.bank.map((sectionKey, index) => (
                                            <Draggable
                                                key={sectionKey}
                                                draggableId={`bank-${sectionKey}`}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`section-chip ${snapshot.isDragging ? 'dragging' : ''}`}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            backgroundColor: snapshot.isDragging
                                                                ? SECTIONS_CONFIG[sectionKey]?.color + '20'
                                                                : 'var(--surface)',
                                                            borderColor: SECTIONS_CONFIG[sectionKey]?.color || 'var(--border)'
                                                        }}
                                                    >
                                                        <GripVertical size={14} style={{ opacity: 0.5 }} />
                                                        <span>{SECTIONS_CONFIG[sectionKey]?.label}</span>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))
                                    ) : (
                                        <div style={{
                                            padding: '1rem',
                                            color: 'var(--text-muted)',
                                            fontStyle: 'italic'
                                        }}>
                                            Toutes les sections sont utilisées
                                        </div>
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>

                    {/* ======== Colonnes cuisine & service ========== */}
                    <div className="menu-editor-columns">
                        {/* --- Colonne Cuisine --- */}
                        <Droppable droppableId="cuisine">
                            {(provided, snapshot) => (
                                <div
                                    className={`menu-column ${snapshot.isDraggingOver ? 'droppable-hover' : ''}`}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <div className="menu-column-header">
                                        <h2 className="menu-column-title">Production Cuisine</h2>
                                        {progression?.cuisineTeacher && (
                                            <span className="menu-column-teacher">
                                                {progression.cuisineTeacher.firstname} {progression.cuisineTeacher.lastname}
                                            </span>
                                        )}
                                    </div>

                                    <div className="menu-sections-list">
                                        {dragState.cuisine.length > 0 ? (
                                            dragState.cuisine.map((sectionKey, index) => (
                                                <Draggable
                                                    key={`cuisine-${sectionKey}`}
                                                    draggableId={`cuisine-${sectionKey}`}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`menu-section-editor ${snapshot.isDragging ? 'dragging' : ''}`}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                borderColor: SECTIONS_CONFIG[sectionKey]?.color || 'var(--border)'
                                                            }}
                                                        >
                                                            <div className="section-header">
                                                                <div className="section-header-left" {...provided.dragHandleProps}>
                                                                    <GripVertical size={16} style={{ opacity: 0.5 }} />
                                                                    <span className="section-title">
                                                                        {SECTIONS_CONFIG[sectionKey]?.label}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="section-remove-btn"
                                                                    onClick={() => handleRemoveSection('cuisine', sectionKey)}
                                                                    title="Retirer cette section"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>

                                                            <MenuColumnEditor
                                                                sectionKeys={[sectionKey]}
                                                                formSections={formSections}
                                                                itemsList={itemsList}
                                                                errors={errors}
                                                                user={user}
                                                                onChange={handleSectionItemsChange}
                                                                onCreateItem={handleCreateItem}
                                                                itemsLoading={itemsLoading}
                                                                sectionsConfig={SECTIONS_CONFIG}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))
                                        ) : (
                                            <div className="empty-column-state">
                                                Glissez des sections ici
                                            </div>
                                        )}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>

                        {/* --- Colonne Service --- */}
                        <Droppable droppableId="service">
                            {(provided, snapshot) => (
                                <div
                                    className={`menu-column ${snapshot.isDraggingOver ? 'droppable-hover' : ''}`}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <div className="menu-column-header">
                                        <h2 className="menu-column-title">Production Service</h2>
                                        {progression?.serviceTeacher && (
                                            <span className="menu-column-teacher">
                                                {progression.serviceTeacher.firstname} {progression.serviceTeacher.lastname}
                                            </span>
                                        )}
                                    </div>

                                    <div className="menu-sections-list">
                                        {dragState.service.length > 0 ? (
                                            dragState.service.map((sectionKey, index) => (
                                                <Draggable
                                                    key={`service-${sectionKey}`}
                                                    draggableId={`service-${sectionKey}`}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`menu-section-editor ${snapshot.isDragging ? 'dragging' : ''}`}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                borderColor: SECTIONS_CONFIG[sectionKey]?.color || 'var(--border)'
                                                            }}
                                                        >
                                                            <div className="section-header">
                                                                <div className="section-header-left" {...provided.dragHandleProps}>
                                                                    <GripVertical size={16} style={{ opacity: 0.5 }} />
                                                                    <span className="section-title">
                                                                        {SECTIONS_CONFIG[sectionKey]?.label}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="section-remove-btn"
                                                                    onClick={() => handleRemoveSection('service', sectionKey)}
                                                                    title="Retirer cette section"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>

                                                            <MenuColumnEditor
                                                                sectionKeys={[sectionKey]}
                                                                formSections={formSections}
                                                                itemsList={itemsList}
                                                                errors={errors}
                                                                user={user}
                                                                onChange={handleSectionItemsChange}
                                                                onCreateItem={handleCreateItem}
                                                                itemsLoading={itemsLoading}
                                                                sectionsConfig={SECTIONS_CONFIG}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))
                                        ) : (
                                            <div className="empty-column-state">
                                                Glissez des sections ici
                                            </div>
                                        )}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </div>
                </DragDropContext>

                {/* ======= Actions (Annuler / Enregistrer) ========== */}
                <div className="form-actions mt-8 flex justify-end gap-4">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={isCreating || isUpdating}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className={`btn btn-primary ${(isCreating || isUpdating) ? 'btn-loading' : ''}`}
                        disabled={isCreating || isUpdating}
                    >
                        {isCreating || isUpdating
                            ? (menu ? 'Mise à jour...' : 'Création...')
                            : (menu ? 'Mettre à jour' : 'Créer le menu')}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default MenuEditorModal