import { useMemo, useState } from 'react'
import { CartContext } from './CartContextObject'

function toNumber(value) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.-]/g, '')
    const parsed = Number(normalized)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  return 0
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  const addToCart = (product, quantityToAdd = 1) => {
    const safeQuantityToAdd = Math.max(1, Number(quantityToAdd) || 1)

    setCart((previousCart) => {
      const productKey = product.cartItemId || String(product.id)
      const existingItem = previousCart.find((item) => (item.cartItemId || String(item.id)) === productKey)

      if (existingItem) {
        return previousCart.map((item) =>
          (item.cartItemId || String(item.id)) === productKey
            ? { ...item, quantity: item.quantity + safeQuantityToAdd }
            : item,
        )
      }

      return [
        ...previousCart,
        {
          ...product,
          cartItemId: productKey,
          price: toNumber(product.price),
          quantity: safeQuantityToAdd,
        },
      ]
    })
  }

  const removeFromCart = (productKey) => {
    setCart((previousCart) => previousCart.filter((item) => (item.cartItemId || String(item.id)) !== productKey))
  }

  const decreaseQuantity = (productKey) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          (item.cartItemId || String(item.id)) === productKey
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + toNumber(item.price) * item.quantity, 0),
    [cart],
  )

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      decreaseQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      totalItems,
    }),
    [cart, cartTotal, totalItems],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
