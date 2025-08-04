// frontend/src/components/layout/Layout.jsx
import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import SessionSelector from '../common/SessionSelector'
import toast from 'react-hot-toast'
import ThemeToggle from '../common/ThemeToggle'
import {
  Menu,
  ChevronLeft,
  House,
  CalendarCog,
  CookingPot,
  Utensils,
  Users,
  CircleUserRound,
  Search,
  UserRoundPen,
  LogOut,
  Settings
} from 'lucide-react'

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
      { path: '/dashboard', label: 'DASHBOARD', icon: <House size={24} strokeWidth={1.25} /> },
      { path: '/items', label: 'ITEMS', icon: <CookingPot size={24} strokeWidth={1.25} /> },
      { path: '/services', label: 'SERVICES', icon: <CalendarCog size={24} strokeWidth={1.25} /> },
      { path: '/menus', label: 'MENUS', icon: <Utensils size={24} strokeWidth={1.25} /> },
      { path: '/settings', label: 'PARAMÉTRAGES', icon: <Settings size={24} strokeWidth={1.25} /> }
    ]

    if (isAdmin()) {
      baseItems.push({ path: '/users', label: 'UTILISATEURS', icon: <Users size={24} strokeWidth={1.25} /> })
    }

    return baseItems
  }

  const isActiveLink = (path) => {
    return location.pathname === path
  }

  const navigationItems = getNavigationItems()

  return (
    // 🔥 CONTAINER PRINCIPAL - Structure fixe
    <div className='main-container'>

      {/* 🔥 NAVBAR FIXE - Prend toute la largeur */}
      <header className='navbar-header'>

        {/* 🔥 TOGGLE SIDEBAR - Intégré dans la navbar */}
        <button
          onClick={toggleSidebar}
          className='toggle-sidebar'
          title={sidebarCollapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
        >
          {sidebarCollapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
        </button>

        {/* Logo */}
        <h1 className='logo'>
          Menu Manager
        </h1>

        {/* Barre de recherche */}
        <div className='search'>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-content"

          />
          <span className='search-icon'>
            <Search size={20} />
          </span>
        </div>

        {/* Actions utilisateur */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginLeft: 'auto'
        }}>
          {/* Toggle thème */}
          <ThemeToggle size="md" />
          {/*session Selector */}
          <SessionSelector/>
          {/* Infos utilisateur */}
          <div className='user-info-container'>
            <div className='user-info-avatar'>
              {user?.firstname?.charAt(0)}{user?.lastname?.charAt(0)}
            </div>
            <div>
              <div className='user-info-identity'>
                {user?.firstname} {user?.lastname}
              </div>
              <div className='user-info-role'>
                <span>Niveau d'accés : {getRoleDisplayName(user?.role)} </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn badge-primary"
            style={{ fontSize: '0.875rem' }}

          >
            <LogOut className='icon-lucid' size={20} />
            <span >Déconnexion</span>
          </button>
        </div>
      </header>

      {/* 🔥 CONTENU SOUS LA NAVBAR */}
      <div className='outlet-header'>

        {/* 🔥 SIDEBAR COULISSANTE - Position absolue */}
        <aside style={{
          position: 'fixed',
          left: 0,
          height: '100%',
          width: sidebarCollapsed ? '0' : '250px',
          backgroundColor: 'var(--surface)',
          borderRight: sidebarCollapsed ? 'none' : '1px solid var(--border)',
          boxShadow: sidebarCollapsed ? 'none' : 'var(--shadow-lg)',
          zIndex: 1020,
          display: 'flex',
          flexDirection: 'column',
          transform: sidebarCollapsed ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}>

          {/* 🔥 NAVIGATION */}
          <nav style={{
            flex: 1,
            padding: '1rem 0',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {navigationItems.map((item) => {
              const isActive = isActiveLink(item.path)

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`icon-button nav-button ${isActive ? 'nav-button-active' : 'nav-button-inactive'}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                    borderRadius: '0.375rem',
                    margin: '0.125rem 0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <span style={{
                    fontSize: '1.25rem',
                    minWidth: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </span>
                  <span style={{
                    whiteSpace: 'nowrap',
                    opacity: sidebarCollapsed ? 0 : 1,
                    transition: 'opacity 0.2s ease'
                  }}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Actions en bas */}
          <div className='btn-nav-section'>
            <button
              className="icon-button nav-button btn-nav"
              onClick={() => navigate('/profile')}

            >
              <CircleUserRound size={20} strokeWidth={1.25} />
              PARAMETRES
            </button>
            <button
              className="icon-button nav-button btn-nav"
              onClick={() => window.open('mailto:gregdevweb44500@gmail.com')}
            >
              <UserRoundPen size={20} strokeWidth={1.25} />
              CONTACT
            </button>
          </div>
        </aside>

        {/* 🔥 OVERLAY - Ferme la sidebar sur mobile */}
        {!sidebarCollapsed && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 1010,
              display: window.innerWidth <= 768 ? 'block' : 'none'
            }}
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        {/* 🔥 CONTENU PRINCIPAL - S'adapte à la sidebar */}
        <main style={{
          flex: 1,
          marginLeft: sidebarCollapsed ? '0' : (window.innerWidth <= 768 ? '0' : '250px'),
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1.5rem',
          backgroundColor: 'var(--background)'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout