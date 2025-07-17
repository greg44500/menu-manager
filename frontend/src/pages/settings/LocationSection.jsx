// frontend/src/components/settings/LocationSection.jsx
import { useState } from 'react'
import Modal from '../../components/common/Modal'
import CreateLocationModal from './CreateLocationModal'
import LocationTable from './LocationTable'
import { useGetSettingsStatsQuery } from '../../store/api/settingsApi'
import { useInvalidateSettingsStats } from '../../hooks/useInvalidateSettings'

const LocationSection = () => {
    const [showCreateModal, setShowCreateModal] = useState(false)
    const { refetch: refetchStats } = useGetSettingsStatsQuery()
    const invalidateSettings = useInvalidateSettingsStats()

    // 🔄 Callback unifié pour toutes les actions
    const handleDataChange = () => {
        invalidateSettings()     // Force l'invalidation des caches
        refetchStats()          // Refetch explicite des stats
    }

    return (
        <div className="card">
            <div className="card-header container-service-location-section">
                <h2>Ateliers</h2>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    + Ajouter un atelier
                </button>
            </div>

            <div className="card-content">
                <LocationTable onDataChange={handleDataChange} />
            </div>

            {showCreateModal && (
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Créer un atelier"
                >
                    <CreateLocationModal
                        onClose={() => setShowCreateModal(false)}
                        onCreated={handleDataChange}
                    />
                </Modal>
            )}
        </div>
    )
}

export default LocationSection