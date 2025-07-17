// frontend/src/pages/settings/SettingsDashboard.jsx
import { useState } from 'react'
import { Building2, ScrollText } from 'lucide-react'
import StatCard from '../../components/common/StatCard'
import { useGetLocationsQuery } from '../../store/api/locationApi'
import { useGetTypesServicesQuery } from '../../store/api/typeServiceApi.js'
import TypeServiceSection from './TypeServiceSection'
import LocationSection from './LocationSection'

const SettingsDashboard = () => {
    const [activeSection, setActiveSection] = useState(null)
    const {
        data: locationsData,
        isLoading: locationsLoading,
        error: locationsError
    } = useGetLocationsQuery()

    const {
        data: typesData,
        isLoading: typesLoading,
        error: typesError
    } = useGetTypesServicesQuery()

    // 🔢 CALCUL DIRECT DES STATS (SEULEMENT 2 TYPES)
    const stats = {
        typesServicesCount: typesData?.length || 0,
        locationsCount: Array.isArray(locationsData?.data) ? locationsData.data.length : 0,
    }

    // 🔍 DEBUG SIMPLIFIÉ
    console.log('📊 Données locations:', locationsData)
    console.log('📊 Données types:', typesData)
    console.log('📊 Stats calculées:', stats)
    console.log('📊 Loading states:', { locationsLoading, typesLoading })
    console.log('📊 Errors:', { locationsError, typesError })




    const statCards = [
        {
            title: 'Types de services',
            icon: <ScrollText size={24} />,
            count: stats?.typesServicesCount || 0,
            variant: 'primary',
            section: 'types-services'
        },
        {
            title: 'Ateliers',
            icon: <Building2 size={24} />,
            count: stats?.locationsCount || 0,
            variant: 'info',
            section: 'locations'
        }
    ]

    return (
        <div>
            <h1 style={{
                fontSize: '2rem',
                fontWeight: '600',
                color: 'var(--primary)',
                marginBottom: '2rem'
            }}>
                Paramétrages Techniques
            </h1>

            {/* 🟦 STATISTIQUES GÉNÉRALES */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        margin: 0
                    }}>
                        Données Paramétrables
                    </h2>
                </div>
                <div className="card-content">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {statCards.map((card) => (
                            <StatCard
                                key={card.title}
                                title={card.title}
                                count={card.count}
                                icon={card.icon}
                                onClick={() => setActiveSection(card.section)}
                                clickable
                                variant={card.variant}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* 🧩 SECTION DYNAMIQUE PAR TYPE DE PARAMÈTRE */}
            {activeSection && (
                <div className="mt-6">
                    {activeSection === 'types-services' && (
                        <TypeServiceSection />
                    )}

                    {activeSection === 'locations' && (
                        <LocationSection />
                    )}
                </div>
            )}
        </div>
    )
}

export default SettingsDashboard
