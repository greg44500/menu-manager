// frontend/src/components/settings/CreateTypeServiceModal.jsx
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useCreateTypeServiceMutation } from '../../store/api/typeServiceApi.js'

const CreateTypeServiceModal = ({ onClose }) => {
    const [name, setName] = useState('')
    const [error, setError] = useState(null)

    const [createTypeService, { isLoading }] = useCreateTypeServiceMutation()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError("Le nom est requis")
            toast.error("Veuillez entrer un nom.")
            return
        }

        try {
            await createTypeService({ name }).unwrap()
            toast.success("Type de service créé avec succès")
            onClose()
        } catch (err) {
            console.error(err)
            setError("Erreur lors de la création")
            toast.error("Échec de la création du type de service")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-2">
            <div>
                <label className="label" htmlFor="name">Nom du type de service</label>
                <input
                    id="name"
                    type="text"
                    className="input w-full"
                    placeholder="Ex : Restaurant"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            {error && <p className="text-error">{error}</p>}

            <div className="flex justify-end gap-2 mt-4">
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? 'Création...' : 'Créer'}
                </button>
            </div>
        </form>
    )
}

export default CreateTypeServiceModal
