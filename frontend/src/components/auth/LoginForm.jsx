// frontend/src/components/auth/LoginForm.jsx
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import {EyeClosed, Eye} from 'lucide-react'

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  
  const { login, isLoading, error, clearError } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Nettoie l'erreur quand l'utilisateur tape
    if (error) {
      clearError()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    // Toast de loading pendant la connexion
    const loadingToast = toast.loading('Connexion en cours...')

    const result = await login(formData)
    
    // Supprime le toast de loading
    toast.dismiss(loadingToast)
    
    if (result.success) {
      toast.success(`Bienvenue ${result.data.user.firstname} !`, {
        duration: 3000,
      })
      
      // Si changement de mot de passe requis
      if (result.data.requirePasswordChange) {
        setTimeout(() => {
          toast('Vous devez changer votre mot de passe temporaire', {
            duration: 5000,
            style: {
              background: 'var(--warning-bg)',
              color: 'var(--warning)',
              border: '1px solid var(--warning)',
            }
          })
        }, 1000)
      }
    } else {
      toast.error(result.error || 'Erreur de connexion')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)',
      padding: '1rem'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '400px',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div className="card-header" style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600',
            color: 'var(--primary)',
            marginBottom: '0.5rem'
          }}>
            Connexion
          </h1>
          <p style={{ 
            color: 'var(--text-muted)',
            fontSize: '0.875rem'
          }}>
            Accédez à votre espace de gestion
          </p>
        </div>

        <div className="card-content">
          <form onSubmit={handleSubmit}>
            {/* Champ Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label 
                htmlFor="email" 
                className="label label-required"
              >
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${error ? 'input-error' : ''}`}
                placeholder="votre.email@citeformations.com"
                required
                autoComplete="email"
                style={{ marginTop: '0.25rem' }}
              />
            </div>

            {/* Champ Mot de passe */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                htmlFor="password" 
                className="label label-required"
              >
                Mot de passe
              </label>
              <div style={{ 
                position: 'relative',
                marginTop: '0.25rem'
              }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input ${error ? 'input-error' : ''}`}
                  placeholder="Votre mot de passe"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  {showPassword ? <EyeClosed /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Affichage des erreurs */}
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`}
              disabled={isLoading || !formData.email || !formData.password}
              style={{ 
                width: '100%',
                marginBottom: '1rem'
              }}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>

            {/* Lien mot de passe oublié */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
                onClick={() => {
                  // TODO: Implémenter la réinitialisation de mot de passe
                  alert('Fonctionnalité à venir')
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginForm