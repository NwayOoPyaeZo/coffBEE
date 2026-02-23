import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import Preloader from './components/Preloader'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'
import HomePage from './pages/HomePage'
import MemberProfile from './pages/MemberProfile'
import MenuPage from './pages/MenuPage'
import LoginModal from './components/LoginModal'
import CartSidebar from './components/CartSidebar'
import CheckoutCard from './components/CheckoutCard'
import ActiveOrderBanner from './components/ActiveOrderBanner'
import TrackingModal from './components/TrackingModal'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function normalizeUser(rawUser) {
  if (!rawUser) {
    return { id: null, role: 'guest', name: '', email: '' }
  }

  return {
    id: rawUser.id || null,
    role: rawUser.role || 'guest',
    name: rawUser.name || rawUser.full_name || '',
    email: rawUser.email || '',
  }
}

function App() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('coffbee-user')

    if (!savedUser) {
      return { id: null, role: 'guest', name: '', email: '' }
    }

    return normalizeUser(JSON.parse(savedUser))
  })
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [activeOrder, setActiveOrder] = useState(null)
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false)
  const [orderNotice, setOrderNotice] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const isLoginRoute = location.pathname === '/login'

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem('coffbee-user', JSON.stringify(user))
  }, [user])

  useEffect(() => {
    let isMounted = true
    let clearCompletedOrderTimer
    let clearOrderNoticeTimer

    if (!user?.id || user.role !== 'member') {
      const resetStateTimer = setTimeout(() => {
        setActiveOrder(null)
        setIsTrackingModalOpen(false)
        setOrderNotice(null)
      }, 0)

      return () => {
        isMounted = false
        clearTimeout(resetStateTimer)
      }
    }

    const socket = io(API_BASE)

    const fetchActiveOrder = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/orders/user/${user.id}/active`)

        if (!response.ok) {
          return
        }

        const data = await response.json()

        if (!isMounted) {
          return
        }

        setActiveOrder(data || null)
      } catch (err) {
        console.error('Failed to fetch active order', err)
      }
    }

    fetchActiveOrder()

    socket.on('orderStatusUpdate', (data) => {
      setActiveOrder((previousOrder) => {
        if (!previousOrder || previousOrder.id !== data.orderId) {
          return previousOrder
        }

        if (clearCompletedOrderTimer) {
          clearTimeout(clearCompletedOrderTimer)
        }

        if (clearOrderNoticeTimer) {
          clearTimeout(clearOrderNoticeTimer)
        }

        if (data.status === 'cancelled') {
          setIsTrackingModalOpen(false)
          setOrderNotice({ type: 'error', message: 'Your order was cancelled by staff.' })

          clearOrderNoticeTimer = setTimeout(() => {
            setOrderNotice(null)
          }, 5000)

          return null
        }

        if (data.status === 'completed') {
          setIsTrackingModalOpen(true)
          setOrderNotice({ type: 'success', message: 'Your order is ready for pickup!' })

          clearOrderNoticeTimer = setTimeout(() => {
            setOrderNotice(null)
          }, 5000)

          clearCompletedOrderTimer = setTimeout(() => {
            setActiveOrder(null)
            setIsTrackingModalOpen(false)
          }, 5000)
        }

        return { ...previousOrder, status: data.status }
      })
    })

    return () => {
      isMounted = false
      if (clearCompletedOrderTimer) {
        clearTimeout(clearCompletedOrderTimer)
      }
      if (clearOrderNoticeTimer) {
        clearTimeout(clearOrderNoticeTimer)
      }
      socket.disconnect()
    }
  }, [user?.id, user?.role])

  const openLoginModal = () => {
    setIsLoginModalOpen(true)
  }

  const closeLoginModal = () => {
    setIsLoginModalOpen(false)

    if (isLoginRoute) {
      navigate('/', { replace: true })
    }
  }

  const handleSetUser = (nextUser) => {
    const normalizedUser = normalizeUser(nextUser)
    setUser(normalizedUser)
    setIsLoginModalOpen(false)

    const redirectFrom = location.state?.from?.pathname
    const roleDefaultPath = {
      guest: '/',
      member: '/profile',
      admin: '/admin',
    }

    if (redirectFrom === '/profile' && normalizedUser.role === 'member') {
      navigate('/profile', { replace: true })
      return
    }

    if (redirectFrom === '/admin' && normalizedUser.role === 'admin') {
      navigate('/admin', { replace: true })
      return
    }

    navigate(roleDefaultPath[normalizedUser.role] || '/', { replace: true })
  }

  const handleLogout = () => {
    setUser({ id: null, role: 'guest', name: '', email: '' })
    navigate('/', { replace: true })
  }

  const handleProceedToCheckout = () => {
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  const handleCheckoutSuccess = (newOrder) => {
    setActiveOrder(newOrder)
    setIsTrackingModalOpen(true)
  }

  if (loading) {
    return <Preloader />
  }

  return (
    <>
      {(isLoginRoute || isLoginModalOpen) && <LoginModal setUser={handleSetUser} closeModal={closeLoginModal} />}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleProceedToCheckout}
      />
      <CheckoutCard
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        user={user}
        onCheckoutSuccess={handleCheckoutSuccess}
      />
      <ActiveOrderBanner order={activeOrder} onClick={() => setIsTrackingModalOpen(true)} />
      <TrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        order={activeOrder}
      />

      {orderNotice && (
        <div
          className={`fixed right-6 bottom-6 z-120 max-w-sm rounded-xl border px-4 py-3 text-sm font-bold shadow-lg ${
            orderNotice.type === 'success'
              ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300'
              : 'border-red-300 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300'
          }`}
        >
          {orderNotice.message}
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={<HomePage user={user} onOpenLogin={openLoginModal} onOpenCart={() => setIsCartOpen(true)} onLogout={handleLogout} />}
        />
        <Route
          path="/menu"
          element={<MenuPage user={user} onOpenLogin={openLoginModal} onOpenCart={() => setIsCartOpen(true)} onLogout={handleLogout} />}
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} allowedRoles={['member', 'admin']}>
              <MemberProfile user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} allowedRoles={['admin']}>
              <AdminDashboard user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={<HomePage user={user} onOpenLogin={openLoginModal} onOpenCart={() => setIsCartOpen(true)} onLogout={handleLogout} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
