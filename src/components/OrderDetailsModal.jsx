import { Clock, X } from 'lucide-react'

function OrderDetailsModal({ isOpen, onClose, order, queueNumber }) {
  if (!isOpen || !order) {
    return null
  }

  const transactionId = String(order.id || '').split('-')[0].toUpperCase()
  const orderTime = new Date(order.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="animate-in zoom-in-95 relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl duration-200 dark:bg-[#1A1210]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 bg-gray-50 p-6 dark:border-honey/10 dark:bg-[#2D1B18]">
          <div className="flex items-center gap-4">
            {queueNumber && (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-honey text-2xl font-black text-honey-deep shadow-sm">
                {queueNumber}
              </div>
            )}

            <div>
              <h2 className="font-serif text-2xl font-bold text-honey-deep dark:text-white">Order #{transactionId}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock size={14} />
                Placed at {orderTime}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-white p-2 text-gray-400 shadow-sm transition-colors hover:text-honey-deep dark:bg-[#1A1210] dark:hover:text-honey"
            type="button"
            aria-label="Close order details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-gray-100 px-6 py-4 dark:border-honey/10">
          <p className="mb-1 text-sm font-bold tracking-wider text-gray-500 uppercase">Customer</p>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{order.customer_name || 'Guest Checkout'}</p>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-6">
          <p className="mb-4 text-sm font-bold tracking-wider text-gray-500 uppercase">Order Items</p>
          <ul className="space-y-4">
            {(Array.isArray(order.items) ? order.items : []).map((item, idx) => {
              let customizations = item.customizations

              if (typeof customizations === 'string') {
                try {
                  customizations = JSON.parse(customizations)
                } catch {
                  customizations = null
                }
              }

              if (!customizations || typeof customizations !== 'object' || Array.isArray(customizations)) {
                customizations = null
              }

              const hasCustomizations = !!customizations && Object.keys(customizations).length > 0
              const flavorProfile =
                customizations?.size ||
                `${customizations?.temperature || ''}${customizations?.cupSize ? ` (${customizations.cupSize})` : ''}`.trim()

              return (
                <li key={`${order.id}-${idx}`} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-honey/10 dark:bg-[#2D1B18]">
                  <div className="flex items-start justify-between">
                    <span className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
                      <span className="rounded-md bg-honey px-2 py-0.5 text-sm text-honey-deep">{item.quantity}x</span>
                      {item.name}
                    </span>
                  </div>

                  {hasCustomizations ? (
                    <div className="mt-3 ml-11 space-y-1 border-l-2 border-honey/50 pl-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                      {flavorProfile && <p>• {flavorProfile}</p>}
                      {customizations?.milk && <p>• {customizations.milk}</p>}
                      {customizations?.sweetness && <p>• {customizations.sweetness} Sweetness</p>}
                      {Number(customizations?.extraShot) > 0 && (
                        <p className="font-bold text-red-500">• +{customizations.extraShot} Espresso Shot</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 ml-11 pl-3 text-xs font-medium text-gray-400 italic dark:text-gray-500">
                      • Standard recipe (no modifiers)
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 p-6 dark:border-honey/10 dark:bg-[#1A1210]">
          <span className="font-bold text-gray-500 uppercase">Total</span>
          <span className="text-2xl font-black text-honey">฿{Number(order.total_amount || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsModal
