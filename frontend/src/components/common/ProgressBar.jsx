import React from 'react'

const ProgressBar = ({ current = 0, total = 1, label = '' }) => {
    const percent = Math.round((current / total) * 100)

    return (
        <div className="progressbar-container">
            {label && (
                <div className="progressbar-label">
                    {label} ({current}/{total})
                </div>
            )}
            <div className="progressbar-background">
                <div
                    className="progressbar-fill"
                    style={{ width: `${percent}%` }}
                />
            </div>          
        </div>
    )
}

export default ProgressBar
