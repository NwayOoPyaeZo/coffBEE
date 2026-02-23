import { useEffect, useState } from 'react'
import { Award, Mail, Receipt, X } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function CustomerDetailsModal({ isOpen, onClose, customer }) {
  const [orderHistory, setOrderHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !customer?.id) {
      return
    }

    const loadTimer = setTimeout(() => {
      setIsLoading(true)

      fetch(`${API_BASE}/api/orders/user/${customer.id}`)
        .then((response) => response.json())
        .then((data) => {
          setOrderHistory(Array.isArray(data) ? data : [])
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }, 0)

    return () => {
      clearTimeout(loadTimer)
    }
  }, [isOpen, customer])

  if (!isOpen || !customer) {
    return null
  }

  return (
    <div className="fixed inset-0 z-120 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="animate-in slide-in-from-right flex h-full w-full max-w-md flex-col bg-white shadow-2xl duration-300 dark:bg-[#1A1210]">
        <div className="flex items-start justify-between border-b border-gray-100 bg-gray-50 p-6 dark:border-honey/10 dark:bg-[#2D1B18]">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-2xl font-bold text-honey-deep dark:text-white">
              {customer.full_name}
              {customer.role === 'admin' && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 font-sans text-[10px] tracking-wider text-red-600 uppercase">
                  Staff
                </span>
              )}
            </h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <Mail size={14} /> {customer.email}
            </p>
            <p className="mt-2 text-xs text-gray-400">Joined {new Date(customer.created_at).toLocaleDateString()}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white p-2 text-gray-400 shadow-sm transition-colors hover:text-honey-deep dark:bg-[#1A1210] dark:hover:text-honey"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-gray-100 p-6 dark:border-honey/10">
          <div className="rounded-2xl border border-honey/20 bg-honey/10 p-4">
            <p className="mb-1 text-xs font-bold text-honey-deep/70 uppercase dark:text-honey/70">Lifetime Value</p>
            <p className="text-2xl font-black text-honey-deep dark:text-white">
              ฿{Number(customer.lifetime_value || 0).toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-honey/20 bg-honey/10 p-4">
            <p className="mb-1 text-xs font-bold text-honey-deep/70 uppercase dark:text-honey/70">Honey Drops</p>
            <div className="flex items-center gap-2 text-2xl font-black text-honey-deep dark:text-white">
              <Award className="text-honey" size={24} />
              {customer.honey_points}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 dark:bg-[#120C0A]">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-800 dark:text-white">
            <Receipt size={18} className="text-honey" /> Order History ({orderHistory.length})
          </h3>

          {isLoading ? (
            <div className="animate-pulse py-8 text-center text-honey-deep">Loading orders...</div>
          ) : orderHistory.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No completed orders found.</div>
          ) : (
            <div className="space-y-4">
              {orderHistory.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-honey/10 dark:bg-[#1A1210]"
                >
                  <div className="mb-2 flex items-start justify-between border-b border-gray-100 pb-2 dark:border-honey/10">
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">#{String(order.id).split('-')[0].toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-honey">฿{Number(order.total_amount || 0).toFixed(2)}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                      <li key={`${order.id}-${idx}`} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-bold text-honey">{item.quantity}x</span> {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerDetailsModal
