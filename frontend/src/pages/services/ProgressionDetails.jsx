import { Users, School, CalendarDays } from 'lucide-react'

const ProgressionDetails = ({ progression }) => {
    if (!progression) return null

    const teachers = progression.teachers || []
    const classrooms = progression.classrooms || []
    const weeks = progression.weeks || []

    const getTeachersBySpeciality = (label) =>
        teachers.filter(t => t.specialization === label)

    return (
        <div className="summary-grid">
            {/* Équipe actuelle */}
            <div className="card-summary outline-orange">
                <div className="card-content-form">
                    <div className="summary-header">
                        <Users size={16} />
                        <h4>Équipe actuelle</h4>
                        <span className="badge badge-orange">{teachers.length} formateur{teachers.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="summary-columns">
                        <div>
                            <div className="summary-subtitle">
                                <span role="img" aria-label="cuisine">👨‍🍳</span> CUISINE ({getTeachersBySpeciality('cuisine').length})
                            </div>
                            {getTeachersBySpeciality('cuisine').map(t => <div key={t._id}>{t.fullName}</div>)}
                        </div>
                        <div>
                            <div className="summary-subtitle">
                                <span role="img" aria-label="salle">🍽️</span> SERVICE ({getTeachersBySpeciality('salle').length})
                            </div>
                            {getTeachersBySpeciality('salle').map(t => <div key={t._id}>{t.fullName}</div>)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Classes assignées */}
            <div className="card-summary outline-blue">
                <div className="card-content-form">
                    <div className="summary-header">
                        <School size={16} />
                        <h4>Classes assignées</h4>
                        <span className="badge badge-info">{classrooms.length}</span>
                    </div>
                    <ul className="summary-list">
                        {classrooms.map(c => (
                            <li key={c._id}>{c.virtualName || c.name}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Nombre de semaines */}
            <div className="card-summary outline-green">
                <div className="card-content-form">
                    <div className="summary-header">
                        <CalendarDays size={16} />
                        <h4>Nombre de semaines</h4>
                        <span className="badge badge-green">{weeks.length}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProgressionDetails