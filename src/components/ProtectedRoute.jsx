import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ user, children, allowedRoles = [] }) {
  const location = useLocation()

  if (!user || user.role === 'guest') {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/menu" replace />
  }

  return children
}

export default ProtectedRoute
