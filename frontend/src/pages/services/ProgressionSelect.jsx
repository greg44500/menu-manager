const ProgressionSelect = ({ progressions, value, onChange }) => {
    return (
        <div className="form-group">
            <label htmlFor="progression" className="label label-icon">
                <span>Sélectionner une progression</span>
            </label>
            <select
                id="progression"
                className="input"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="" disabled>-- Choisir --</option>
                {progressions.map((prog) => (
                    <option key={prog._id} value={prog._id}>{prog.title}</option>
                ))}
            </select>
        </div>
    )
}

export default ProgressionSelect