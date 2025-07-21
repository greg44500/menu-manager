// frontend/src/router/index.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom'

// Composants de protection des routes
import ProtectedRoute from '../components/auth/ProtectedRoute'
import PublicRoute from '../components/auth/PublicRoute'

// Pages d'authentification
import LoginPage from '../pages/auth/Login'

// Layout principal pour les pages protégées
import Layout from '../components/layout/Layout'

// Pages principales
import DashboardRouter from '../pages/dashboard/DashboardRouter'
import SuperAdminDashboard from '../pages/dashboard/SuperAdminDashboard'
import DashboardManager from '../pages/dashboard/DashboardManager'
import DashboardUser from '../pages/dashboard/DashboardUser'
import ClassroomList from '../pages/classrooms/ClassroomList'
import ProgressionList from '../pages/services/ServicesList'
import UserList from '../pages/users/UserList'
import MenuList from '../pages/menus/MenuList'
import UserProfile from '../pages/users/UserProfile'
import ChangePassword from '../pages/auth/ChangePassword'
import SettingsDashboard from '../pages/settings/SettingsDashboard'

// Page 404
import NotFound from '../components/common/NotFound'
import ServicesList from '../pages/services/ServicesList'

// CONFIGURATION DES ROUTES
export const router = createBrowserRouter([
  // ROUTES PUBLIQUES (accessibles sans connexion)
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },

  // ROUTES PROTÉGÉES (nécessitent une connexion)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      // Redirection par défaut vers dashboard
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },

      // DASHBOARD (accessible à tous les utilisateurs connectés)
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedRoute requiredRoles={['superAdmin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'manager/dashboard',
        element: (
          <ProtectedRoute requiredRoles={['manager']}>
            <DashboardManager />
          </ProtectedRoute>
        )
      },
      {
        path: 'user/dashboard',
        element: (
          <ProtectedRoute requiredRoles={['user']}>
            <DashboardUser />
          </ProtectedRoute>
        )
      },

      // PROFIL UTILISATEUR (accessible à tous)
      {
        path: 'profile',
        element: <UserProfile />
      },

      // CHANGEMENT DE MOT DE PASSE (accessible à tous)
      {
        path: 'change-password',
        element: <ChangePassword />
      },

      // // GESTION DES CLASSES (superAdmin et manager uniquement)
      // {
      //   path: 'classrooms',
      //   element: (
      //     <ProtectedRoute requiredRoles={['superAdmin', 'manager']}>
      //       <ClassroomList />
      //     </ProtectedRoute>
      //   )
      // },
      // GESTION DES SeRVICES (accessible Admin et Manager)
      {
        path: 'services',
        element: (
          <ProtectedRoute requiredRoles={['superAdmin', 'manager']}>
            <ServicesList />
          </ProtectedRoute>
        )
      },

      // GESTION DES MENUS (accessible à tous les rôles)
      {
        path: 'menus',
        element: (
          <ProtectedRoute requiredRoles={['superAdmin', 'manager', 'user']}>
            <MenuList />
          </ProtectedRoute>
        )
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requiredRoles={['superAdmin', 'manager']}>
            <SettingsDashboard />
          </ProtectedRoute>
        )
      },

      // GESTION DES UTILISATEURS (manager et superAdmins uniquement)
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRoles={['manager', 'superAdmin']}>
            <UserList />
          </ProtectedRoute>
        )
      },
    ]
  },

  // PAGE 404 (route catch-all)
  {
    path: '*',
    element: <NotFound />
  }
])
