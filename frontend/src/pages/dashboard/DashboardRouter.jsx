import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const DashboardRouter = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) return
        if (user.role === 'superAdmin') navigate('/admin/dashboard')
        else if (user.role === 'manager') navigate('/manager/dashboard')
        else if (user.role === 'user') navigate('/user/dashboard')
    }, [user, navigate])

    return null
}

export default DashboardRouter