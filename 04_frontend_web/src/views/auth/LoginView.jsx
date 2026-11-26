// src/views/auth/LoginView.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import AlertMessage from '../common/AlertMessage'
import LoginHeader from './LoginHeader'
import LoginFooter from './LoginFooter'
import '../../styles/Login.css'

const LoginView = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!credentials.email || !credentials.password) {
      setError('Por favor complete todos los campos')
      return
    }
    
    setLoading(true)
    
    try {
      const result = await login(credentials)
      console.log('✅ Login exitoso:', result)
      navigate('/dashboard')
    } catch (err) {
      console.error('❌ Error en login:', err)
      setError(err.error || 'Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <LoginHeader />

        {error && (
          <AlertMessage 
            type="error" 
            message={error} 
            onClose={() => setError('')}
          />
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="usuario@ejemplo.com"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <LoginFooter />
      </div>
    </div>
  )
}

export default LoginView