import { useState } from 'react'
import { CreditCard, MapPin, X } from 'lucide-react'
import { useCart } from '../context/useCart'
import BrandBee from './BrandBee'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function CheckoutCard({ isOpen, onClose, user, onCheckoutSuccess }) {
  const { cart, cartTotal, clearCart } = useCart()
  const [step, setStep] = useState('summary')
  const [error, setError] = useState('')

  if (!isOpen) {
    return null
  }

  const handleConfirmPayment = async () => {
    if (cart.length === 0 || step === 'processing') {
      return
    }

    setStep('processing')
    setError('')

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations || {},
          })),
          totalAmount: cartTotal,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Checkout failed. Please try again.')
        setStep('summary')
        return
      }

      const newOrder = {
        id: data.orderId,
        status: 'pending',
        total_amount: data.totalAmount,
      }

      clearCart()
      onCheckoutSuccess?.(newOrder)
      handleClose()
    } catch {
      setError('Network error. Please try again.')
      setStep('summary')
    }
  }

  const handleClose = () => {
    setTimeout(() => {
      setStep('summary')
      setError('')
    }, 300)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-500 dark:bg-[#1A1210]">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-gray-400 transition-colors hover:text-honey-deep dark:hover:text-honey"
          type="button"
          aria-label="Close checkout"
        >
          <X size={24} />
        </button>

        {step === 'summary' && (
          <div className="p-8">
            <h2 className="mb-6 font-serif text-2xl font-bold text-honey-deep dark:text-white">Checkout</h2>

            <div className="mb-6 space-y-4">
              <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-honey/10 dark:bg-[#2D1B18]">
                <MapPin className="mt-1 text-honey" size={20} />
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">Pickup Location</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Coffbee Bangkok (Sukhumvit Branch)</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-honey/10 dark:bg-[#2D1B18]">
                <CreditCard className="mt-1 text-honey" size={20} />
                <div className="w-full">
                  <p className="mb-2 font-bold text-gray-800 dark:text-white">Payment Method</p>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 dark:border-honey/20 dark:bg-[#1A1210]">
                    <span className="text-sm font-medium dark:text-gray-300">PromptPay / Credit Card</span>
                    <div className="h-4 w-6 rounded-sm bg-blue-900" />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="mb-6 border-t border-dashed border-gray-200 pt-4 dark:border-honey/20">
              <div className="flex justify-between text-lg font-bold text-honey-deep dark:text-white">
                <span>Total Amount</span>
                <span className="text-honey">฿{cartTotal.toFixed(2)}</span>
              </div>
              {!!user?.id && (
                <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                  Earn +{Math.floor(cartTotal / 10)} Drops
                </p>
              )}
            </div>

            <button
              onClick={handleConfirmPayment}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-honey py-4 text-lg font-bold text-honey-deep shadow-lg transition-all hover:bg-honey-dark active:scale-95"
              type="button"
            >
              Confirm &amp; Pay
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-honey/20 text-honey-deep shadow-inner dark:text-honey">
              <BrandBee size={40} className="animate-buzz" />
              <div className="absolute top-8 -left-4 h-1 w-6 animate-pulse rounded-full bg-honey/40" />
              <div
                className="absolute top-12 -left-2 h-1 w-4 animate-pulse rounded-full bg-honey/40"
                style={{ animationDelay: '0.2s' }}
              />
            </div>
            <h2 className="text-xl font-bold text-honey-deep dark:text-white">Connecting to Hive...</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Processing your payment securely</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutCard
