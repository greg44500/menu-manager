// ProgressionSummaryPanel.jsx
// Ce composant présente la colonne de gauche de l'écran "services".
// Il affiche la sélection de progression, la session académique active, le résumé formateurs/classes/semaines et la progression de complétion.
// Ne contient aucune logique d'état complexe : reçoit toutes les infos par props, pour une réutilisabilité maximale.

import ProgressionSelect from './ProgressionSelect'
import { Calendar, TrendingUp } from 'lucide-react'
import ProgressBar from '../../components/common/ProgressBar'

/**
 * @param {Object} props
 * @param {Array} progressions - Liste de toutes les progressions disponibles
 * @param {string} selectedProgressionId - ID de la progression actuellement sélectionnée
 * @param {Function} setSelectedProgressionId - Setter pour modifier la progression sélectionnée
 * @param {Object} activeSession - Session académique active (objet calendrier)
 * @param {Object} selectedProgression - Progression actuellement sélectionnée (objet complet)
 * @param {number} totalWeeks - Nombre total de semaines programmées
 * @param {number} completedServices - Nombre de services complétés (menus créés)
 * @param {number} progressPercentage - Pourcentage de complétion des services
 */
const ProgressionSummaryPanel = ({
    progressions,
    selectedProgressionId,
    setSelectedProgressionId,
    selectedProgression,
    totalWeeks,
    completedServices,
    progressPercentage,
}) => {
    // Extraction des classes et enseignants de la progression sélectionnée
    const uniqueTeachers = selectedProgression?.teachers || []
    const uniqueClasses = selectedProgression?.classrooms || []
    const uniqueWeeks = selectedProgression?.weekList?.length || 0



    return (
        <div className="left-panel-service">
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-content">
                    {/* Sélection de la progression */}
                    <ProgressionSelect
                        progressions={progressions}
                        value={selectedProgressionId}
                        onChange={setSelectedProgressionId}
                    />
                </div>

                {/* Affichage session académique active */}
                {/* {activeSession && (
                    <div className="card-summary outline-blue service-card">
                        <div className="card-content-form">
                            <div className="summary-header summary-header-h4">
                                <Calendar size={16} style={{ color: 'var(--info)' }} />
                                <h4 style={{ color: 'var(--info)' }}>Session académique</h4>
                                <span className="badge badge-info">Active</span>
                            </div>
                            <div className="service-info">
                                <span><strong>{activeSession.name}</strong></span>
                                <span>
                                    Du {new Date(activeSession.startDate).toLocaleDateString('fr-FR')} au {new Date(activeSession.endDate).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Si une progression est sélectionnée : afficher le résumé */}
                {selectedProgression && (
                    <div>
                        {/* Formateurs assignés */}
                        <div className="card-summary outline-orange service-card">
                            <div className="card-content-form">
                                <div className="summary-header summary-header-h4">
                                    <h4>Formateurs assignés :</h4>
                                    <span className="badge badge-orange">{uniqueTeachers.length}</span>
                                </div>
                                <ul className="summary-list">
                                    {uniqueTeachers.map(t => (
                                        <li key={t._id}>
                                            {t.fullName || `${t.firstname} ${t.lastname}`}
                                            <span className="small-tag">({t.specialization})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Classes assignées */}
                        <div className="card-summary outline-orange service-card">
                            <div className="card-content-form">
                                <div className="summary-header summary-header-h4">
                                    <h4>Classes assignées :</h4>
                                    <span className="badge badge-info">{uniqueClasses.length}</span>
                                </div>
                                <ul className="summary-list">
                                    {uniqueClasses.map(c => (
                                        <li key={c._id}>
                                            {c.virtualName ??
                                                [c.diploma, c.category, c.alternationNumber, c.group, c.certificationSession]
                                                    .filter(Boolean)
                                                    .join(' ')
                                            }
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Semaines programmées */}
                        <div className="card-summary outline-orange service-card">
                            <div className="card-content-form">
                                <div className="summary-header summary-header-h4">
                                    <h4>Semaines programmées :</h4>
                                    <span className="badge badge-green">{uniqueWeeks}</span>
                                </div>
                            </div>
                        </div>

                        {/* Progression : complétion services/menus */}
                        <div className="card-summary outline-orange service-card">
                            <div className="card-content-form">
                                <div className="summary-header summary-header-h4">
                                    <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                                    <h4 style={{ color: 'var(--primary)' }}>Etat d'avancement</h4>
                                    <span className="badge badge-primary">
                                        <strong> {Math.round(progressPercentage)}%</strong>
                                    </span>
                                </div>
                                <ProgressBar
                                    current={completedServices}
                                    total={totalWeeks}
                                    label="Services avec menus créés"
                                />
                                <div className='service-info'>
                                    <span>Services planifiés : {totalWeeks}</span>
                                    <span>Services complétés : {completedServices}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProgressionSummaryPanel
