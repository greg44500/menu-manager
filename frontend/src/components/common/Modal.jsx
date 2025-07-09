// frontend/src/components/common/Modal.jsx - VERSION ORIGINALE RESTAURÉE
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Users, Crown, Shield, User, Wifi, WifiOff, Eye, Edit, Trash2, Plus } from 'lucide-react'

const Modal = ({
  isOpen,
  onClose,
  title = "Gestion des Utilisateurs",
  children,
  usersData = [], // ← Props pour les utilisateurs
  currentUser = null,
  isLoading = false,
  error = null,
  onRefresh = () => {}
}) => {

  console.log('🔥 Modal avec usersData:', usersData.length, 'utilisateurs')

  // 🎯 GESTION TOUCHE ESCAPE
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // 🎯 UTILITAIRES POUR AFFICHAGE
  const getRoleIcon = (role) => {
    switch (role) {
      case 'superAdmin': return <Crown size={16} style={{ color: '#dc2626' }} />
      case 'manager': return <Shield size={16} style={{ color: '#ea580c' }} />
      case 'user': return <User size={16} style={{ color: '#2563eb' }} />
      default: return <User size={16} style={{ color: '#6b7280' }} />
    }
  }

  const getRoleLabel = (role) => {
    const labels = {
      'superAdmin': 'Super Admin',
      'manager': 'Manager',
      'user': 'Formateur'
    }
    return labels[role] || role
  }

  const getRoleBadge = (role) => {
    const configs = {
      'superAdmin': { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
      'manager': { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
      'user': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' }
    }
    const config = configs[role] || configs.user

    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        padding: '0.25rem 0.5rem',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        {getRoleIcon(role)}
        {getRoleLabel(role)}
      </span>
    )
  }

  const getStatusBadge = (isActive) => {
    return (
      <span style={{
        backgroundColor: isActive ? '#f0f9f4' : '#fef2f2',
        color: isActive ? '#166534' : '#dc2626',
        border: `1px solid ${isActive ? '#bbf7d0' : '#fecaca'}`,
        padding: '0.25rem 0.5rem',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        {isActive ? <Wifi size={12} /> : <WifiOff size={12} />}
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    )
  }

  const isCurrentUser = (user) => {
    return currentUser && user._id === currentUser.id
  }

  if (!isOpen) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(37, 36, 34, 0.4)',
        backdropFilter: 'blur(8px) saturate(180%)',
        WebkitBackdropFilter: 'blur(8px) saturate(180%)',
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {/* CONTENU MODAL */}
      <div
        style={{
          position: 'relative',
          width: '95%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-hover) 100%)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{
              margin: 0,
              color: 'var(--text-primary)',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              {title}
            </h2>
            <span style={{
              backgroundColor: 'var(--primary-pale)',
              color: 'var(--primary)',
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {usersData.length} utilisateur{usersData.length > 1 ? 's' : ''}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--error-bg)'
              e.target.style.color = 'var(--error)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = 'var(--text-muted)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENU TABLEAU */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem'
        }}>
          {/* GESTION DES ÉTATS */}
          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--border)',
                borderTop: '3px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p>Chargement des utilisateurs...</p>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--error)',
              backgroundColor: 'var(--error-bg)',
              borderRadius: '0.5rem',
              border: '1px solid var(--error)'
            }}>
              <h3>Erreur de chargement</h3>
              <p>{error.data?.message || 'Impossible de charger les utilisateurs'}</p>
              <button
                onClick={onRefresh}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Réessayer
              </button>
            </div>
          ) : usersData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-muted)'
            }}>
              <Users size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Aucun utilisateur trouvé
              </h3>
              <p>Les données utilisateurs n'ont pas pu être chargées.</p>
            </div>
          ) : (
            /* TABLEAU DES UTILISATEURS */
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-hover)' }}>
                    <th style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      Utilisateur
                    </th>
                    <th style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      Email
                    </th>
                    <th style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      Rôle
                    </th>
                    <th style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      Spécialisation
                    </th>
                    <th style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      Statut
                    </th>
                    <th style={{
                      padding: '0.75rem',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.map((user, index) => (
                    <tr
                      key={user._id || index}
                      style={{
                        backgroundColor: isCurrentUser(user)
                          ? 'var(--primary-pale)'
                          : index % 2 === 0 ? 'var(--surface)' : 'var(--surface-hover)',
                        borderBottom: index < usersData.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      {/* NOM PRÉNOM */}
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
                          </div>
                          <div>
                            <div style={{
                              fontWeight: '500',
                              color: 'var(--text-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              {user.firstname} {user.lastname}
                              {isCurrentUser(user) && (
                                <span style={{
                                  backgroundColor: 'var(--primary)',
                                  color: 'white',
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.625rem',
                                  fontWeight: '600'
                                }}>
                                  VOUS
                                </span>
                              )}
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)'
                            }}>
                              Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <span style={{
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          {user.email}
                        </span>
                      </td>

                      {/* RÔLE */}
                      <td style={{ padding: '1rem 0.75rem' }}>
                        {getRoleBadge(user.role)}
                      </td>

                      {/* SPÉCIALISATION */}
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <span style={{
                          backgroundColor: user.specialization === 'cuisine' ? '#fef3c7' : '#e0e7ff',
                          color: user.specialization === 'cuisine' ? '#92400e' : '#3730a3',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {user.specialization === 'cuisine' ? '👨‍🍳 Cuisine' : '🍽️ Service'}
                        </span>
                      </td>

                      {/* STATUT */}
                      <td style={{ padding: '1rem 0.75rem' }}>
                        {getStatusBadge(user.isActive)}
                      </td>

                      {/* ACTIONS */}
                      <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            style={{
                              background: 'none',
                              border: '1px solid var(--border)',
                              borderRadius: '0.375rem',
                              padding: '0.375rem',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              transition: 'all 0.2s ease'
                            }}
                            title="Voir les détails"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            style={{
                              background: 'none',
                              border: '1px solid var(--border)',
                              borderRadius: '0.375rem',
                              padding: '0.375rem',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              transition: 'all 0.2s ease'
                            }}
                            title="Modifier"
                          >
                            <Edit size={14} />
                          </button>

                          {!isCurrentUser(user) && (
                            <button
                              style={{
                                background: 'none',
                                border: '1px solid var(--border)',
                                borderRadius: '0.375rem',
                                padding: '0.375rem',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                transition: 'all 0.2s ease'
                              }}
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER AVEC ACTIONS */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--surface-hover)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)'
          }}>
            {usersData.filter(u => u.isActive).length} utilisateur(s) actif(s) sur {usersData.length}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--secondary)',
                color: 'var(--text-inverse)',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Fermer
            </button>
            <button 
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={16} />
              Nouvel utilisateur
            </button>
          </div>
        </div>
      </div>

      {/* ANIMATION CSS */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body
  )
}

export default Modal