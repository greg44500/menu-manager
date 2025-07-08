// frontend/src/components/users/UserForm.jsx
import { useState, useEffect } from 'react'
import { useCreateUserMutation, useUpdateUserMutation } from '../../store/api/usersApi'

/**
 * FORMULAIRE UTILISATEUR - Création/Édition
 * 
 * POURQUOI UN COMPOSANT SÉPARÉ ?
 * - Réutilisable pour création ET modification
 * - Validation côté client avant envoi
 * - Gestion des états de loading/erreur
 * - Interface cohérente avec le design system
 */

const UserForm = ({ 
  user = null, // null = création, objet = édition
  onSuccess, 
  onCancel 
}) => {
  // MUTATIONS RTK QUERY
  const [createUser, { 
    isLoading: isCreating, 
    error: createError 
  }] = useCreateUserMutation()
  
  const [updateUser, { 
    isLoading: isUpdating, 
    error: updateError 
  }] = useUpdateUserMutation()

  // MODE : création ou édition
  const isEditMode = Boolean(user)
  const isLoading = isCreating || isUpdating
  const error = createError || updateError

  // ÉTAT DU FORMULAIRE
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: 'user',
    specialization: 'cuisine',
    isActive: true
  })

  // ÉTAT DES ERREURS DE VALIDATION
  const [validationErrors, setValidationErrors] = useState({})

  // INITIALISATION DU FORMULAIRE EN MODE ÉDITION
  useEffect(() => {
    if (isEditMode && user) {
      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        password: '', // Ne pas pré-remplir le mot de passe
        role: user.role || 'user',
        specialization: user.specialization || 'cuisine',
        isActive: user.isActive !== undefined ? user.isActive : true
      })
    }
  }, [isEditMode, user])

  // GESTION DES CHANGEMENTS DE CHAMPS
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  // VALIDATION CÔTÉ CLIENT
  const validateForm = () => {
    const errors = {}

    // Nom requis
    if (!formData.firstname.trim()) {
      errors.firstname = 'Le prénom est requis'
    }

    // Prénom requis
    if (!formData.lastname.trim()) {
      errors.lastname = 'Le nom est requis'
    }

    // Email requis et format
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis'
    } else if (!/^[a-zA-Z0-9._%+-]+@citeformations\.com$/.test(formData.email)) {
      errors.email = 'L\'email doit être au format @citeformations.com'
    }

    // Mot de passe requis (seulement en création)
    if (!isEditMode && !formData.password.trim()) {
      errors.password = 'Le mot de passe est requis'
    }

    // Mot de passe minimum 6 caractères (si fourni)
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // SOUMISSION DU FORMULAIRE
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      let result

      if (isEditMode) {
        // MISE À JOUR
        const updateData = { ...formData }
        
        // Ne pas envoyer le mot de passe s'il est vide
        if (!updateData.password) {
          delete updateData.password
        }

        result = await updateUser({ 
          id: user._id, 
          ...updateData 
        }).unwrap()
      } else {
        // CRÉATION
        result = await createUser(formData).unwrap()
      }

      // Succès
      onSuccess?.(result)
      
      // Reset du formulaire si création
      if (!isEditMode) {
        setFormData({
          firstname: '',
          lastname: '',
          email: '',
          password: '',
          role: 'user',
          specialization: 'cuisine',
          isActive: true
        })
      }

    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      // L'erreur est déjà gérée par RTK Query et affichée via `error`
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AFFICHAGE DES ERREURS GLOBALES */}
      {error && (
        <div className="alert alert-error">
          <p className="font-medium">Erreur :</p>
          <p>{error.data?.message || 'Une erreur est survenue'}</p>
        </div>
      )}

      {/* INFORMATIONS PERSONNELLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PRÉNOM */}
        <div>
          <label htmlFor="firstname" className="label label-required">
            Prénom
          </label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            className={`input ${validationErrors.firstname ? 'input-error' : ''}`}
            placeholder="Jean"
            disabled={isLoading}
          />
          {validationErrors.firstname && (
            <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>
              {validationErrors.firstname}
            </p>
          )}
        </div>

        {/* NOM */}
        <div>
          <label htmlFor="lastname" className="label label-required">
            Nom
          </label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            className={`input ${validationErrors.lastname ? 'input-error' : ''}`}
            placeholder="Dupont"
            disabled={isLoading}
          />
          {validationErrors.lastname && (
            <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>
              {validationErrors.lastname}
            </p>
          )}
        </div>
      </div>

      {/* EMAIL */}
      <div>
        <label htmlFor="email" className="label label-required">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`input ${validationErrors.email ? 'input-error' : ''}`}
          placeholder="jean.dupont@citeformations.com"
          disabled={isLoading}
        />
        {validationErrors.email && (
          <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>
            {validationErrors.email}
          </p>
        )}
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Doit être au format @citeformations.com
        </p>
      </div>

      {/* MOT DE PASSE */}
      <div>
        <label htmlFor="password" className={`label ${!isEditMode ? 'label-required' : ''}`}>
          {isEditMode ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`input ${validationErrors.password ? 'input-error' : ''}`}
          placeholder={isEditMode ? 'Laisser vide pour ne pas changer' : 'Minimum 6 caractères'}
          disabled={isLoading}
        />
        {validationErrors.password && (
          <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>
            {validationErrors.password}
          </p>
        )}
        {isEditMode && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Laisser vide pour conserver le mot de passe actuel
          </p>
        )}
      </div>

      {/* RÔLE ET SPÉCIALISATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RÔLE */}
        <div>
          <label htmlFor="role" className="label label-required">
            Rôle
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input"
            disabled={isLoading}
          >
            <option value="user">Formateur</option>
            <option value="manager">Manager</option>
            <option value="superAdmin">Super Admin</option>
          </select>
        </div>

        {/* SPÉCIALISATION */}
        <div>
          <label htmlFor="specialization" className="label label-required">
            Spécialisation
          </label>
          <select
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="input"
            disabled={isLoading}
          >
            <option value="cuisine">Cuisine</option>
            <option value="service">Service</option>
          </select>
        </div>
      </div>

      {/* STATUT ACTIF */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="
            w-4 h-4 rounded
            border-2 border-border
            text-primary focus:ring-primary focus:ring-offset-0
          "
          disabled={isLoading}
        />
        <label htmlFor="isActive" className="label !mb-0">
          Compte actif
        </label>
      </div>

      {/* BOUTONS D'ACTION */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          Annuler
        </button>
        
        <button
          type="submit"
          className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            isEditMode ? 'Modification...' : 'Création...'
          ) : (
            isEditMode ? 'Modifier' : 'Créer'
          )}
        </button>
      </div>
    </form>
  )
}

export default UserForm