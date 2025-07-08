// frontend/src/components/layout/Layout.jsx
import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import { useTheme } from '../../hooks/useTheme' // Import du hook thème
import ThemeToggle from '../common/ThemeToggle' 
import { Menu, ChevronLeft, House, GraduationCap, CalendarCog, Utensils, Users, CircleUserRound, Moon, Sun, Search, UserRoundPen } from 'lucide-react' 

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const {toggleTheme } = useTheme() // Récupération de l'état du thème
  
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() 
  const getRoleDisplayName = (role) => {
  const roleTranslations = {
    'user': 'Utilisateur',
    'manager': 'Manager', 
    'superAdmin': 'Super Admin'
  }
  return roleTranslations[role] || role
}

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      toast.success('Déconnexion réussie')
      navigate('/login')
    }
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }


  // Navigation items selon les rôles
  const getNavigationItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'DASHBOARD', icon: <House size={24} strokeWidth={1.25} />},
      { path: '/classrooms', label: 'CLASSES', icon: <GraduationCap size={24} strokeWidth={1.25} /> },
      { path: '/progressions', label: 'PROGRESSIONS', icon: <CalendarCog size={24} strokeWidth={1.25} /> },
      { path: '/menus', label: 'MENUS', icon: <Utensils size={24} strokeWidth={1.25} /> },
    ]

    if (isAdmin()) {
      baseItems.push({ path: '/users', label: 'UTILISATEURS', icon: <Users size={24} strokeWidth={1.25} />})
    }

    return baseItems
  }

  // Fonction pour vérifier si le lien est actif
  const isActiveLink = (path) => {
    return location.pathname === path
  }

  const navigationItems = getNavigationItems()

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--text-primary)'
    }}>
      {/* SIDEBAR avec animation fluide mais styles préservés */}
      <aside style={{
        width: sidebarCollapsed ? '60px' : '250px',
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        zIndex: 10,
        //transition plus fluide
        transition: 'width 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden' // Évite les débordements pendant l'animation
      }}>
        {/* Logo et toggle */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between'
        }}>
          {!sidebarCollapsed && (
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--primary)',
              margin: 0,
              whiteSpace: 'nowrap',
              transition: 'opacity 0.3s ease'
            }}>
              Menu Manager
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '0.375rem',
              padding: '0.5rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '1.125rem',
              transition: 'all 0.2s ease'
            }}
          >
            {sidebarCollapsed ?<Menu size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '1rem 0' }}>
          {navigationItems.map((item) => {
            const isActive = isActiveLink(item.path)
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-button ${isActive ? 'nav-button-active' : 'nav-button-inactive'}`}
                style={{
                  width: '100%',
                  padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '0.75rem',
                  transition: 'all 0.2s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  borderRadius: '0.375rem',
                  margin: '0.125rem 0.5rem'
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span style={{ 
                  fontSize: '1.5rem',
                  minWidth: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500',
                    opacity: 1,
                    transition: 'opacity 0.3s ease',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.label}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Actions en bas */}
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          right: '1rem',
          opacity: sidebarCollapsed ? 0 : 1,
          transition: 'opacity 0.3s ease',
          pointerEvents: sidebarCollapsed ? 'none' : 'auto'
        }}>
          {!sidebarCollapsed && (
            <>
              <button 
                className="action-button"
                onClick={() => navigate('/profile')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <CircleUserRound size={20} strokeWidth={1.25} />
                PARAMETRES
              </button>
              <button
                className="action-button"
                onClick={() => window.open('mailto:gregdevweb44500@gmail.com')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                   display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <UserRoundPen size={20} strokeWidth={1.25} /> CONTACT
              </button>
            </>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT collé à la sidebar */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column'
      }}>
        {/* HEADER */}
        <header style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0 1.5rem',
          height: '75px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-sm)'
        }}>
            {/* Barre de recherche */}
            <div style={{
              flex: 1,
              maxWidth: '400px',
              position: 'relative'
            }}>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  fontSize: '0.875rem'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                fontSize: '1rem'
              }}>
                <Search />
              </span>
            </div>

            {/* Actions utilisateur */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              {/* Toggle thème */}
              <ThemeToggle size="md" />
              <button
                onClick={toggleTheme}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  padding: '0.5rem'
                }}
                title="Changer de thème"
              >
              </button>

              {/* Infos utilisateur */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--background)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'var(--primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {user?.firstname?.charAt(0)}{user?.lastname?.charAt(0)}
                </div>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    {user?.firstname} {user?.lastname}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    {getRoleDisplayName(user?.role)}
                  </div>
                </div>
              </div>

              {/* Menu utilisateur */}
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ fontSize: '0.875rem' }}
              >
                Déconnexion
              </button>
          </div>
        </header>

        {/* CONTENU PRINCIPAL */}
        <main style={{
          flex: 1,
          padding: '1.5rem',
          backgroundColor: 'var(--background)',
          overflow: 'auto'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout