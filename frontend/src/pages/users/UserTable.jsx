// src/components/users/UserTable.jsx
import { useGetAllUsersQuery } from '../../store/api/usersApi'
import { Edit3, Trash2, User, Plus } from 'lucide-react'

const UserTable = () => {
  const { data, isLoading, error } = useGetAllUsersQuery()
  const users = data?.users || []

  // ÉTATS DE CHARGEMENT avec votre système de couleurs
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '16rem',
        color: 'var(--text-muted)'
      }}>
        <div className="loading-spinner" style={{
          width: '3rem',
          height: '3rem',
          borderWidth: '3px'
        }}></div>
        <span style={{ marginLeft: '1rem' }}>Chargement des utilisateurs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <p style={{ fontWeight: '600' }}>Erreur de chargement des utilisateurs</p>
        <p>{error.data?.message || 'Une erreur est survenue'}</p>
      </div>
    )
  }

  //FONCTION POUR LES BADGES RÔLES
  const getRoleBadge = (role) => {
    const roleConfig = {
      superAdmin: { label: 'Super Admin', class: 'badge-error' },
      manager: { label: 'Manager', class: 'badge-warning' },
      user: { label: 'Formateur', class: 'badge-info' }
    }
    const config = roleConfig[role] || roleConfig.user
    return <span className={`badge ${config.class}`}>{config.label}</span>
  }

  // FONCTION POUR LES BADGES STATUT
  const getStatusBadge = (isActive) => (
    <span className={`badge ${isActive ? 'badge-success' : 'badge-error'}`}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        marginRight: '6px',
        display: 'inline-block'
      }}></span>
      {isActive ? 'Actif' : 'Inactif'}
    </span>
  )

  return (
    <div className="card theme-transition">
      {/* CONTENEUR RESPONSIVE pour le tableau */}
      <div style={{
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch' // Scroll fluide sur mobile
      }}>
        <table style={{
          width: '100%',
          minWidth: '700px' // Largeur minimum pour éviter le crush
        }}>
          <thead style={{
            backgroundColor: 'var(--surface-hover)',
            borderBottom: '1px solid var(--border)'
          }}>
            <tr>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                minWidth: '200px' // Largeur minimum pour la colonne
              }}>
                Utilisateur
              </th>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                minWidth: '200px'
              }}>
                Email
              </th>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                minWidth: '120px'
              }}>
                Rôle
              </th>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                minWidth: '100px'
              }}>
                Statut
              </th>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'right',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                minWidth: '100px'
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{
                  padding: '3rem 1.5rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      padding: '12px',
                      backgroundColor: 'var(--surface-alt)',
                      borderRadius: '50%'
                    }}>
                      <User size={32} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div>
                      <p style={{
                        color: 'var(--text-primary)',
                        fontWeight: '500',
                        margin: 0,
                        marginBottom: '4px'
                      }}>
                        Aucun utilisateur
                      </p>
                      <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem',
                        margin: 0
                      }}>
                        Commencez par ajouter votre premier utilisateur
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user._id}
                  style={{
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  {/* COLONNE UTILISATEUR responsive */}
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      minWidth: '180px' // Empêche le crush du contenu
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-inverse)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        boxShadow: 'var(--shadow-sm)',
                        flexShrink: 0 // Empêche la réduction de l'avatar
                      }}>
                        {user.firstname?.[0]?.toUpperCase()}{user.lastname?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}> {/* Permet la troncature du texte */}
                        <p style={{
                          color: 'var(--text-primary)',
                          fontWeight: '500',
                          margin: 0,
                          marginBottom: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {user.firstname} {user.lastname}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/*EMAIL responsive */}
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <p style={{
                      color: 'var(--text-primary)',
                      margin: 0,
                      fontSize: '0.875rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '200px'
                    }}>
                      {user.email}
                    </p>
                  </td>

                  {/* RÔLE avec badge système */}
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {getRoleBadge(user.role)}
                  </td>

                  {/*  STATUT avec badge système */}
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {getStatusBadge(user.isActive)}
                  </td>

                  {/*ACTIONS avec hover terracotta */}
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <button
                        title="Modifier l'utilisateur"
                        style={{
                          padding: '8px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--primary-pale)'
                          e.target.style.color = 'var(--primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                          e.target.style.color = 'var(--text-muted)'
                        }}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        title="Supprimer l'utilisateur"
                        style={{
                          padding: '8px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
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
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default UserTable