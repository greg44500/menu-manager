// frontend/src/components/settings/EditLocationModal.jsx
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useUpdateLocationMutation } from '../../store/api/locationApi.js'

const EditLocationModal = ({ location, onClose, onUpdated }) => {
    const [name, setName] = useState(location?.name || '')
    const [error, setError] = useState(null)

    const [updateLocation, { isLoading }] = useUpdateLocationMutation()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError("Le nom est requis")
            toast.error("Veuillez entrer un nom.")
            return
        }

        try {
            await updateLocation({ id: location._id, name }).unwrap()
            toast.success("Atelier modifié avec succès")
            onClose()
            onUpdated()
        } catch (err) {
            console.error(err)
            toast.error("Erreur lors de la mise à jour")
            setError("Une erreur est survenue.")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-2">
            <div>
                <label className="label" htmlFor="edit-name">Nom de l'atelier</label>
                <input
                    id="edit-name"
                    type="text"
                    className="input w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="flex justify-end gap-2 mt-4">
                <button
                    type="button"
                    className="btn btn-ghost btn-form"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className="btn btn-primary btn-form"
                    disabled={isLoading}
                >
                    {isLoading ? 'Modification...' : 'Enregistrer'}
                </button>
            </div>
        </form>
    )
}

export default EditLocationModal
