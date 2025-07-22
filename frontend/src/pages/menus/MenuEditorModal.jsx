import { useEffect, useState } from 'react'
import Modal from '../../components/common/Modal'
import { useGetItemsQuery, useCreateItemMutation } from '@/store/api/itemApi'
import { useCreateMenuMutation } from '@/store/api/menuApi'
import { useAuth } from '../../hooks/useAuth'
const MenuEditorModal = ({ isOpen, onClose, service, onSaved }) => {
    const { user } = useAuth()
    const isAdmin = user.role === 'manager' || user.role === 'superAdmin'

    const [typeState, setTypeState] = useState('cuisine')
    const type = isAdmin ? typeState : user.specialization

    const [selectedItems, setSelectedItems] = useState([])

    const { data: itemsData = [] } = useGetItemsQuery()
    const [createMenu, { isLoading }] = useCreateMenuMutation()

    const allItems = itemsData.data || []

    useEffect(() => {
        if (service?.menu) {
            const existing = service.menu.find(m => m.type === type)
            if (existing) setSelectedItems(existing.items.map(i => i._id))
        }
    }, [service, type])

    const handleSubmit = async () => {
        const payload = {
            service: service._id,
            type,
            items: selectedItems,
        }
        await createMenu(payload).unwrap()
        onSaved?.()
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Menu du service">
            {isAdmin && (
                <div className="form-group">
                    <label>Type de menu</label>
                    <select value={typeState} onChange={e => setTypeState(e.target.value)}>
                        <option value="cuisine">Cuisine</option>
                        <option value="service">Service</option>
                    </select>
                </div>
            )}

            <div className="form-group">
                <label>Contenu du menu</label>
                <select
                    multiple
                    value={selectedItems}
                    onChange={(e) =>
                        setSelectedItems(Array.from(e.target.selectedOptions, opt => opt.value))
                    }
                >
                    {allItems.map(item => (
                        <option key={item._id} value={item._id}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Enregistrement...' : 'Valider le menu'}
                </button>
            </div>
        </Modal>
    )
}

export default MenuEditorModal
