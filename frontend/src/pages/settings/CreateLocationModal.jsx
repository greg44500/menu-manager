// frontend/src/components/settings/CreateLocationModal.jsx
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useCreateLocationMutation } from '../../store/api/locationApi.js'

const CreateLocationModal = ({ onClose, onCreated }) => {
    const [name, setName] = useState('')
    const [error, setError] = useState(null)

    const [createLocation, { isLoading }] = useCreateLocationMutation()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError("Le nom est requis")
            toast.error("Veuillez entrer un nom.")
            return
        }

        try {
            await createLocation({ name }).unwrap()
            toast.success("Atelier créé avec succès")
            onClose()
            onCreated()
        } catch (err) {
            const message = err?.data?.message || "Erreur lors de la création"
            setError(message)
            toast.error(message)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-2">
            <div>
                <label className="label" htmlFor="name">Nom de l'atelier</label>
                <input
                    id="name"
                    type="text"
                    className="input w-full"
                    placeholder="Ex : Atelier cuisine 1"
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
                    {isLoading ? 'Création...' : 'Créer'}
                </button>
            </div>
        </form>
    )
}

export default CreateLocationModal