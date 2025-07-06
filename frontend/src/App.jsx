// frontend/src/App.jsx
import { Provider } from 'react-redux'
import { store } from './store'
import { Toaster } from 'react-hot-toast'
import LoginForm from './components/auth/LoginForm'

// Import des styles globaux
import './styles/globals.css'
import './styles/theme.css'
import './styles/components.css'

function App() {
  return (
    <Provider store={store}>
      <div className="app theme-transition" style={{ 
        backgroundColor: 'var(--background)', 
        color: 'var(--text-primary)',
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <LoginForm />
        
        {/* Configuration React Hot Toast avec thème terracotta */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Styles par défaut pour tous les toasts
            duration: 4000,
            style: {
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              boxShadow: 'var(--shadow-lg)',
              padding: '16px',
            },
            // Toast de succès
            success: {
              duration: 4000,
              style: {
                background: 'var(--success-bg)',
                color: 'var(--success)',
                border: '1px solid var(--success)',
              },
              iconTheme: {
                primary: 'var(--success)',
                secondary: 'var(--success-bg)',
              },
            },
            // Toast d'erreur
            error: {
              duration: 5000,
              style: {
                background: 'var(--error-bg)',
                color: 'var(--error)',
                border: '1px solid var(--error)',
              },
              iconTheme: {
                primary: 'var(--error)',
                secondary: 'var(--error-bg)',
              },
            },
            // Toast d'info
            loading: {
              style: {
                background: 'var(--info-bg)',
                color: 'var(--info)',
                border: '1px solid var(--info)',
              },
            },
          }}
        />
      </div>
    </Provider>
  )
}

export default App