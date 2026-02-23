import { useEffect, useRef } from 'react'
import { CheckCircle, Coffee, X } from 'lucide-react'
import OrderTracker from './OrderTracker'

function TrackingModal({ isOpen, onClose, order }) {
  const completedButtonRef = useRef(null)
  const isCompleted = order?.status === 'completed'

  useEffect(() => {
    if (!isOpen || !isCompleted || !order) {
      return
    }

    const focusTimer = setTimeout(() => {
      completedButtonRef.current?.focus()
    }, 0)

    return () => {
      clearTimeout(focusTimer)
    }
  }, [isOpen, isCompleted, order])

  if (!isOpen || !order) {
    return null
  }

  const transactionId = String(order.id || '').split('-')[0].toUpperCase()

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="animate-in zoom-in relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl duration-300 dark:bg-[#1A1210]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-honey-deep dark:hover:text-honey"
          type="button"
          aria-label="Close tracking modal"
        >
          <X size={24} />
        </button>

        {isCompleted ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 py-6 duration-500">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-500 shadow-inner">
              <CheckCircle size={48} className="animate-bounce-short" />
            </div>

            <h2 className="mb-2 font-serif text-3xl font-bold text-honey-deep dark:text-white">Order Ready!</h2>
            <p className="mb-6 text-gray-500 dark:text-gray-400">Transaction #{transactionId}</p>

            <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-800/30 dark:bg-green-900/20">
              <p className="font-bold text-green-800 dark:text-green-400">
                Please head to the pickup counter to grab your order. Enjoy!
              </p>
            </div>

            <button
              ref={completedButtonRef}
              onClick={onClose}
              className="w-full rounded-xl bg-honey py-4 text-lg font-bold text-honey-deep shadow-lg transition-all hover:bg-honey-dark active:scale-95"
              type="button"
            >
              Got it, thanks!
            </button>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-honey/20 text-honey-deep shadow-inner dark:text-honey">
              <Coffee size={32} className={order.status === 'brewing' ? 'animate-pulse' : ''} />
            </div>

            <h2 className="mb-2 font-serif text-2xl font-bold text-honey-deep dark:text-white">
              {order.status === 'pending' ? 'Order Received!' : 'Brewing Now...'}
            </h2>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Transaction #{transactionId}</p>

            <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-6 dark:border-honey/10 dark:bg-[#2D1B18]">
              <OrderTracker status={order.status} />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              {order.status === 'pending'
                ? "We've got your order! Our baristas will start shortly."
                : 'Your coffee is being prepared carefully.'}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default TrackingModal
