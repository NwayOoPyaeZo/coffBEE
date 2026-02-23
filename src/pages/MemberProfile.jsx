import { useEffect, useState } from 'react'
import { Award, Clock, ExternalLink, QrCode, Receipt, Share2 } from 'lucide-react'
import BackButton from '../components/BackButton'
import OrderTracker from '../components/OrderTracker'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function MemberProfile({ user }) {
  const [profileData, setProfileData] = useState(null)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const goal = 1000
  const profileName = profileData?.full_name || user.name || 'Member'
  const points = Number(profileData?.honey_points) || 0
  const progress = Math.min((points / goal) * 100, 100)
  const dropsNeeded = Math.max(goal - points, 0)
  const avatarSeed = encodeURIComponent(profileName)

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const [profileResponse, ordersResponse] = await Promise.all([
          fetch(`${API_BASE}/api/profile/${user.id}`),
          fetch(`${API_BASE}/api/orders/user/${user.id}`),
        ])

        if (!isMounted) {
          return
        }

        if (!profileResponse.ok) {
          throw new Error(`Request failed: ${profileResponse.status}`)
        }

        const profile = await profileResponse.json()
        setProfileData(profile)

        if (ordersResponse.ok) {
          const orderHistory = await ordersResponse.json()
          setOrders(Array.isArray(orderHistory) ? orderHistory : [])
        } else {
          setOrders([])
        }

        setError('')
      } catch {
        if (!isMounted) {
          return
        }

        setError('Could not load live profile data. Showing fallback values.')
        setOrders([])
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-honey-light pt-24 dark:bg-[#1A1210]">
        <div className="animate-pulse font-bold text-honey-deep dark:text-honey">Loading your rewards...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-honey-light pt-24 pb-12 dark:bg-[#1A1210]">
      <div className="mx-auto max-w-2xl px-6">
        <div className="mb-6">
          <BackButton fallbackPath="/" label="Back to Home" />
        </div>

        <div className="mb-8 flex items-center gap-6">
          <div className="h-24 w-24 rounded-full border-4 border-honey bg-honey-deep p-1">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
              alt="Avatar"
              className="h-full w-full rounded-full bg-honey-light"
            />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-honey-deep dark:text-white">
              Sawatdee, {profileName}!
            </h1>
            <p className="text-honey-deep/60 dark:text-honey/60">Member since Feb 2026 • Bangkok</p>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-orange-100 px-4 py-2 text-sm text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            {error}
          </p>
        )}

        <div className="relative overflow-hidden rounded-3xl bg-honey-deep p-8 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="mb-10 flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs tracking-[0.2em] text-honey/80 uppercase">Honey Rewards Balance</p>
                <p className="text-4xl font-bold text-honey">
                  {points} <span className="text-lg font-light text-white/60">drops</span>
                </p>
              </div>
              <Award className="text-honey" size={40} />
            </div>

            <div className="mb-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>Progress to free Gold Brew</span>
                <span>
                  {points}/{goal}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-honey shadow-[0_0_15px_rgba(255,179,0,0.6)] transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-xs italic text-white/40">
              {dropsNeeded > 0
                ? `*${dropsNeeded} more drops to reach your reward!`
                : '*Congratulations! You have earned a free drink!'}
            </p>
          </div>

          <div className="absolute -right-10 -bottom-10 opacity-10">
            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, index) => (
                <div key={index} className="h-16 w-16 rotate-45 rounded-lg bg-honey" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-sm transition-transform active:scale-95 dark:bg-honey-deep/40"
            type="button"
          >
            <QrCode className="mb-2 text-honey" size={32} />
            <span className="font-bold text-honey-deep dark:text-honey-light">Pay &amp; Collect</span>
          </button>
          <button
            className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-sm transition-transform active:scale-95 dark:bg-honey-deep/40"
            type="button"
          >
            <Clock className="mb-2 text-honey" size={32} />
            <span className="font-bold text-honey-deep dark:text-honey-light">Order History</span>
          </button>
        </div>

        <div className="mt-12">
          <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-honey-deep dark:text-white">
            <Clock size={20} className="text-honey" /> Recent Orders
          </h3>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-honey/10 bg-white/50 py-8 text-center dark:bg-honey-deep/20">
              <Receipt size={32} className="mx-auto mb-3 text-honey/50" />
              <p className="text-honey-deep/60 dark:text-honey/60">No orders yet. Time for a coffee run!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const orderTotal = Number(order.total_amount) || 0
                const transactionId = (String(order.id || '').split('-')[0] || 'N/A').toUpperCase()

                return (
                  <div
                    key={order.id}
                    className="mb-6 rounded-3xl border border-honey/10 bg-white p-6 shadow-md dark:bg-[#2D1B18]"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="mb-1 text-xs font-bold tracking-widest text-honey-deep/50 uppercase dark:text-honey/50">
                          Transaction #{transactionId}
                        </p>
                        <p className="text-lg font-bold text-honey-deep dark:text-white">
                          {new Date(order.order_date).toLocaleDateString('en-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Asia/Bangkok',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-honey">฿{orderTotal.toFixed(2)}</p>
                      </div>
                    </div>

                    <OrderTracker status={order.status} />

                    <div className="mb-4 space-y-2 rounded-2xl bg-honey/5 p-4">
                      {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                        <div
                          key={`${order.id}-${idx}`}
                          className="flex justify-between text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span>
                            <span className="font-bold text-honey-deep dark:text-honey">{item.quantity}x</span>{' '}
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-honey/10 pt-4">
                      <p className="text-sm font-bold text-honey-deep/60 dark:text-honey/60">
                        Earned +{Math.floor(orderTotal / 10)} Drops
                      </p>

                      <button
                        className="flex items-center gap-2 rounded-xl border-2 border-honey px-4 py-2 font-bold text-honey-deep transition-all hover:bg-honey hover:text-white active:scale-95 dark:text-honey"
                        type="button"
                      >
                        <Receipt size={16} />
                        Review Receipt
                        <ExternalLink size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-honey/30 bg-white/60 px-5 py-3 font-bold text-honey-deep transition-colors hover:bg-honey/15 dark:bg-honey-deep/30 dark:text-honey"
          type="button"
        >
          <Share2 size={18} /> Share Membership Card
        </button>
      </div>
    </div>
  )
}

export default MemberProfile
