import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart } from '../context/useCart'

function CartSidebar({ isOpen, onClose, onCheckout }) {
  const { cart, addToCart, decreaseQuantity, removeFromCart, clearCart, cartTotal } = useCart()

  return (
    <>
      <div
        className={`fixed inset-0 z-80 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-90 flex w-full max-w-md transform flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-[#1A1210] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between border-b border-honey/20 p-6">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-bold text-honey-deep dark:text-honey">
            <ShoppingBag size={24} /> Your Order
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-honey/10 hover:text-honey-deep"
            type="button"
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="mt-10 text-center text-gray-500 dark:text-honey-light/70">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-25" />
              <p>Your cart is empty.</p>
              <button onClick={onClose} className="mt-4 font-bold text-honey hover:underline" type="button">
                Start brewing
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <article key={item.cartItemId || item.id} className="rounded-2xl border border-honey/10 bg-honey/5 p-3">
                <div className="flex gap-4">
                  <img src={item.image_url || item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="leading-tight font-bold text-honey-deep dark:text-white">{item.name}</h3>
                        {item.customizations && (
                          <div className="mt-1 space-y-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                            <p>
                              {item.customizations.size} • {item.customizations.milk}
                            </p>
                            <p>Sweetness: {item.customizations.sweetness}</p>
                            {Number(item.customizations.extraShot) > 0 && (
                              <p className="font-bold text-honey">+{item.customizations.extraShot} Extra Shot</p>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartItemId || String(item.id))}
                        className="text-red-400 transition-colors hover:text-red-600"
                        type="button"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold dark:text-honey-light">฿{Number(item.price).toFixed(2)}</span>

                      <div className="flex items-center gap-3 rounded-lg border border-honey/20 bg-white px-2 py-1 dark:bg-[#2D1B18]">
                        <button
                          onClick={() => decreaseQuantity(item.cartItemId || String(item.id))}
                          className="text-gray-500 transition-colors hover:text-honey"
                          type="button"
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-4 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="text-gray-500 transition-colors hover:text-honey"
                          type="button"
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <footer className="border-t border-honey/20 bg-honey-light/30 p-6 dark:bg-honey-deep/40">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-bold text-gray-600 dark:text-gray-300">Total</span>
              <span className="text-2xl font-bold text-honey-deep dark:text-honey">฿{cartTotal.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={clearCart}
                className="rounded-xl border border-honey/40 py-3 font-bold text-honey-deep transition-colors hover:bg-honey/10 dark:text-honey"
                type="button"
              >
                Clear
              </button>
              <button
                onClick={onCheckout}
                className="rounded-xl bg-honey py-3 font-bold text-honey-deep shadow-lg transition-all hover:bg-honey-dark active:scale-95"
                type="button"
              >
                Checkout (฿{cartTotal.toFixed(2)})
              </button>
            </div>
          </footer>
        )}
      </aside>
    </>
  )
}

export default CartSidebar
