// frontend/src/components/users/UserForm.jsx
import { useState, useEffect } from 'react'
import { useCreateUserMutation, useUpdateUserMutation } from '../../store/api/usersApi'
import { EyeOff, Eye, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * 🎯 FORMULAIRE UTILISATEUR ADAPTÉ À TON BACKEND
 * 
 * CHANGEMENTS vs version originale :
 * - Champs conformes à ton backend (firstname, lastname, specialization, etc.)
 * - Gestion des mutations RTK Query
 * - Validation selon tes règles (@citeformations.com)
 * - Mode création/édition
 * - Variables CSS + Tailwind
 */

const UserForm = ({ 
  mode = 'create', // 'create' | 'edit'
  user = null, 
  onCancel, 
  onSuccess 
}) => {
  
  console.log('🎯 UserForm rendu avec mode:', mode, 'user:', user)

  // 🎯 MUTATIONS RTK QUERY
  const [createUser, { 
    isLoading: isCreating, 
    error: createError 
  }] = useCreateUserMutation()
  
  const [updateUser, { 
    isLoading: isUpdating, 
    error: updateError 
  }] = useUpdateUserMutation()

  // 🎯 ÉTATS LOCAUX
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: 'user',
    specialization: 'cuisine',
    isActive: true
  })
  
  const [validationErrors, setValidationErrors] = useState({})

  // Variables dérivées
  const isEditMode = mode === 'edit'
  const isLoading = isCreating || isUpdating
  const error = createError || updateError

  // 🎯 INITIALISATION DU FORMULAIRE EN MODE ÉDITION
  useEffect(() => {
    if (isEditMode && user) {
      console.log('🔄 Initialisation formulaire édition avec:', user)
      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        password: '', // Ne pas pré-remplir en édition
        role: user.role || 'user',
        specialization: user.specialization || 'cuisine',
        isActive: user.isActive !== undefined ? user.isActive : true
      })
    }
  }, [isEditMode, user])

  // 🎯 GESTION DES CHANGEMENTS
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

  // 🎯 VALIDATION CÔTÉ CLIENT
  const validateForm = () => {
    const errors = {}

    // Prénom requis
    if (!formData.firstname.trim()) {
      errors.firstname = 'Le prénom est requis'
    }

    // Nom requis
    if (!formData.lastname.trim()) {
      errors.lastname = 'Le nom est requis'
    }

    // Email requis et format @citeformations.com
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis'
    } else if (!/^[a-zA-Z0-9._%+-]+@citeformations\.com$/.test(formData.email)) {
      errors.email = 'L\'email doit être au format @citeformations.com'
    }

    // Mot de passe requis en création
    if (!isEditMode && !formData.password.trim()) {
      errors.password = 'Le mot de passe est requis'
    }

    // Validation longueur mot de passe (si fourni)
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 🎯 SOUMISSION DU FORMULAIRE
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('🚀 Soumission formulaire:', { mode, formData })

    if (!validateForm()) {
      console.log('❌ Validation échouée:', validationErrors)
      return
    }

    try {
      let result

      if (isEditMode) {
        // 📝 MISE À JOUR
        const updateData = { ...formData }
        
        // Ne pas envoyer le mot de passe s'il est vide
        if (!updateData.password) {
          delete updateData.password
        }

        console.log('📝 Mise à jour utilisateur:', user._id, updateData)
        result = await updateUser({ 
          id: user._id, 
          ...updateData 
        }).unwrap()
      } else {
        // ➕ CRÉATION
        console.log('➕ Création utilisateur:', formData)
        result = await createUser(formData).unwrap()
      }

      console.log('✅ Succès:', result)
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
      console.error('❌ Erreur lors de la sauvegarde:', err)
      // L'erreur est déjà gérée par RTK Query et affichée via `error`
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 🚨 AFFICHAGE DES ERREURS GLOBALES */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-[var(--error-bg)] border border-[var(--error)] rounded-lg">
            <AlertCircle size={20} className="text-[var(--error)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[var(--error)]">Erreur :</p>
              <p className="text-[var(--error)]">{error.data?.message || 'Une erreur est survenue'}</p>
            </div>
          </div>
        )}

        {/* 🎯 INFORMATIONS PERSONNELLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PRÉNOM */}
          <div>
            <label htmlFor="firstname" className="label label-required text-[var(--text-secondary)]">
              Prénom
            </label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className={`input mt-1 text-[var(--text-primary)] bg-[var(--surface)] border-[var(--border)] focus:border-[var(--primary)] ${
                validationErrors.firstname ? 'input-error border-[var(--error)]' : ''
              }`}
              placeholder="Jean"
              disabled={isLoading}
              required
            />
            {validationErrors.firstname && (
              <p className="text-sm mt-1 text-[var(--error)] flex items-center gap-1">
                <AlertCircle size={14} />
                {validationErrors.firstname}
              </p>
            )}
          </div>

          {/* NOM */}
          <div>
            <label htmlFor="lastname" className="label label-required text-[var(--text-secondary)]">
              Nom
            </label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className={`input mt-1 text-[var(--text-primary)] bg-[var(--surface)] border-[var(--border)] focus:border-[var(--primary)] ${
                validationErrors.lastname ? 'input-error border-[var(--error)]' : ''
              }`}
              placeholder="Dupont"
              disabled={isLoading}
              required
            />
            {validationErrors.lastname && (
              <p className="text-sm mt-1 text-[var(--error)] flex items-center gap-1">
                <AlertCircle size={14} />
                {validationErrors.lastname}
              </p>
            )}
          </div>
        </div>

        {/* 📧 EMAIL */}
        <div>
          <label htmlFor="email" className="label label-required text-[var(--text-secondary)]">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`input mt-1 text-[var(--text-primary)] bg-[var(--surface)] border-[var(--border)] focus:border-[var(--primary)] ${
              validationErrors.email ? 'input-error border-[var(--error)]' : ''
            }`}
            placeholder="jean.dupont@citeformations.com"
            disabled={isLoading}
            required
          />
          {validationErrors.email && (
            <p className="text-sm mt-1 text-[var(--error)] flex items-center gap-1">
              <AlertCircle size={14} />
              {validationErrors.email}
            </p>
          )}
          <p className="text-xs mt-1 text-[var(--text-muted)]">
            Doit être au format @citeformations.com
          </p>
        </div>

        {/* 🔒 MOT DE PASSE */}
        <div>
          <label htmlFor="password" className={`label text-[var(--text-secondary)] ${!isEditMode ? 'label-required' : ''}`}>
            {isEditMode ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`input pr-10 text-[var(--text-primary)] bg-[var(--surface)] border-[var(--border)] focus:border-[var(--primary)] ${
                validationErrors.password ? 'input-error border-[var(--error)]' : ''
              }`}
              placeholder={isEditMode ? 'Laisser vide pour ne pas changer' : 'Minimum 6 caractères'}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {validationErrors.password && (
            <p className="text-sm mt-1 text-[var(--error)] flex items-center gap-1">
              <AlertCircle size={14} />
              {validationErrors.password}
            </p>
          )}
          {isEditMode && (
            <p className="text-xs mt-1 text-[var(--text-muted)]">
              Laisser vide pour conserver le mot de passe actuel
            </p>
          )}
        </div>

        {/* 🎯 RÔLE ET SPÉCIALISATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* RÔLE */}
          <div>
            <label htmlFor="role" className="label label-required text-[var(--text-secondary)]">
              Rôle
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input mt-1 text-[var(--text-primary)] bg-[var(--surface)] border-[var(--border)] focus:border-[var(--primary)]"
              disabled={isLoading}
            >
              <option value="user">Formateur</option>
              <option value="manager">Manager</option>
              <option value="superAdmin">Super Admin</option>
            </select>
          </div>

          {/* SPÉCIALISATION */}
          <div>
            <label htmlFor="specialization" className="label label-required text-[var(--text-secondary)]">
              Spécialisation
            </label>
            <select
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="input mt-1 text-[var(--text-primary)] bg-[var(--surface)] border-[var(--border)] focus:border-[var(--primary)]"
              disabled={isLoading}
            >
              <option value="cuisine">👨‍🍳 Cuisine</option>
              <option value="service">🍽️ Service</option>
            </select>
          </div>
        </div>

        {/* ✅ STATUT ACTIF */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 rounded border-2 border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
            disabled={isLoading}
          />
          <label htmlFor="isActive" className="label !mb-0 text-[var(--text-secondary)] flex items-center gap-2">
            Compte actif
            {formData.isActive && <CheckCircle size={16} className="text-[var(--success)]" />}
          </label>
        </div>

        {/* 🎯 BOUTONS D'ACTION */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)]">
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
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {isEditMode ? 'Modification...' : 'Création...'}
              </span>
            ) : (
              isEditMode ? 'Modifier' : 'Créer'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserForm