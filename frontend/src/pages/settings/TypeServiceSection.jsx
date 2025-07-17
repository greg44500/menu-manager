// frontend/src/components/settings/TypeServiceSection.jsx
import { useState } from 'react'
import Modal from '../../components/common/Modal'
import CreateTypeServiceModal from './CreateTypeServiceModal'
import TypeServiceTable from '../settings/TypeServicetable'
import { useGetTypesServicesQuery } from '../../store/api/typeServiceApi.js'

const TypeServiceSection = () => {
    const { refetch } = useGetTypesServicesQuery()
    const [showCreateModal, setShowCreateModal] = useState(false)

    return (
        <div className="card">
            <div
                className="card-header container-service-location-section"

            >
                <h2>Types de services</h2>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    + Ajouter un type de service
                </button>
            </div>

            <div className="card-content">
                <TypeServiceTable />
            </div>

            {showCreateModal && (
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Créer un type de service"
                >
                    <CreateTypeServiceModal
                        onClose={() => setShowCreateModal(false)}
                        onCreated={refetch}
                    />
                </Modal>
            )}
        </div>
    )
}

export default TypeServiceSection
