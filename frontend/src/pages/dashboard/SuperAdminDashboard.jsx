// frontend/src/components/dashboard/SuperAdminDashboard.jsx
import { useState } from 'react'
import { useGetUserStatsQuery } from '../../store/api/usersApi'
import UserTable from '../users/UserTable'

/**
 * DASHBOARD SUPER ADMIN
 * 
 * FONCTIONNALITÉS :
 * - Statistiques globales des utilisateurs
 * - Cartes de métriques importantes
 * - Actions rapides (création utilisateur, rappels mot de passe)
 * - Tableau de gestion complet des utilisateurs
 * - Design responsive avec palette Terracotta
 */

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  
  // RÉCUPÉRATION DES STATISTIQUES
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useGetUserStatsQuery()

  // CARTES DE STATISTIQUES
  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    trend = null,
    colorClass = 'primary' 
  }) => (
    <div className="card">
      <div className="card-content">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              {title}
            </h3>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {statsLoading ? '...' : value}
            </div>
            {subtitle && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${
                trend.type === 'positive' ? 'text-success' : 'text-error'
              }`}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={trend.type === 'positive' 
                      ? "M7 17l9.2-9.2M17 17V7m0 0H7" 
                      : "M7 7l9.2 9.2M17 7v10m0 0H7"
                    } 
                  />
                </svg>
                {trend.value}
              </div>
            )}
          </div>
          <div 
            className={`p-3 rounded-lg bg-${colorClass}-pale`}
            style={{ backgroundColor: `var(--${colorClass}-pale)` }}
          >
            {icon}
          </div>
        </div>
      </div>
    </div>
  )

  // ACTIONS RAPIDES
  const QuickAction = ({ title, description, icon, onClick, variant = 'primary' }) => (
    <button
      onClick={onClick}
      className={`btn btn-${variant} w-full justify-start text-left h-auto py-4 px-6`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{title}</div>
          <div className="text-sm opacity-80 mt-1">{description}</div>
        </div>
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )

  return (
    <div className="space-y-8">
      {/* HEADER DU DASHBOARD */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Dashboard Super Admin
          </h1>
          <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
            Gestion globale de la plateforme et des utilisateurs
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Exporter les données
          </button>
          <button className="btn btn-primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* NAVIGATION PAR ONGLETS */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
            { id: 'users', label: 'Gestion Utilisateurs', icon: '👥' },
            { id: 'analytics', label: 'Analytiques', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm
                transition-colors duration-200
                ${activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border'
                }
              `}
              style={{
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                borderColor: activeTab === tab.id ? 'var(--primary)' : 'transparent'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENU DES ONGLETS */}
      
      {/* ONGLET VUE D'ENSEMBLE */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* STATISTIQUES PRINCIPALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Utilisateurs"
              value={stats?.total || 0}
              subtitle="Tous rôles confondus"
              icon={
                <svg className="w-6 h-6" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V9a3 3 0 00-6 0v2.5l-2 2v6l2 2h6l2-2v-6l-2-2V9z" />
                </svg>
              }
              colorClass="primary"
            />

            <StatCard
              title="Formateurs"
              value={stats?.formateurs || 0}
              subtitle={`${stats?.cuisine || 0} cuisine, ${stats?.service || 0} service`}
              icon={
                <svg className="w-6 h-6" style={{ color: 'var(--info)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              colorClass="info"
            />

            <StatCard
              title="Comptes Actifs"
              value={stats?.active || 0}
              subtitle={`${stats?.inactive || 0} inactifs`}
              trend={{
                type: 'positive',
                value: '+5 cette semaine'
              }}
              icon={
                <svg className="w-6 h-6" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              colorClass="success"
            />

            <StatCard
              title="Mots de passe temporaires"
              value={stats?.temporaryPasswords || 0}
              subtitle="Nécessitent un changement"
              icon={
                <svg className="w-6 h-6" style={{ color: 'var(--warning)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              colorClass="warning"
            />
          </div>

          {/* ACTIONS RAPIDES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Actions Utilisateurs
              </h3>
              
              <QuickAction
                title="Créer un utilisateur"
                description="Ajouter un nouveau formateur ou administrateur"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                }
                onClick={() => console.log('Créer utilisateur')}
              />

              <QuickAction
                title="Rappels mots de passe"
                description="Envoyer des emails de rappel pour les mots de passe temporaires"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                onClick={() => console.log('Envoyer rappels')}
                variant="secondary"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semib"></h3>
              </div>