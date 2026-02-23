import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { useCart } from '../context/useCart'

function ProductModal({ isOpen, onClose, product }) {
  const { addToCart } = useCart()

  const [temperature, setTemperature] = useState('Hot')
  const [cupSize, setCupSize] = useState('Regular')
  const [milk, setMilk] = useState('Whole Milk')
  const [sweetness, setSweetness] = useState('100%')
  const [extraShot, setExtraShot] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setTemperature('Hot')
    setCupSize('Regular')
    setMilk('Whole Milk')
    setSweetness('100%')
    setExtraShot(0)
    setQuantity(1)
  }, [product])

  const basePrice = useMemo(() => Number(product?.numericPrice ?? product?.price ?? 0) || 0, [product])

  const finalUnitPrice = useMemo(() => {
    let modifierPrice = 0

    if (temperature === 'Iced') {
      modifierPrice += 10
    }

    if (temperature === 'Frappe') {
      modifierPrice += 20
    }

    if (cupSize === 'Large') {
      modifierPrice += 5
    }

    if (milk === 'Oat Milk' || milk === 'Almond Milk') {
      modifierPrice += 20
    }

    modifierPrice += extraShot * 20

    return basePrice + modifierPrice
  }, [basePrice, temperature, cupSize, milk, extraShot])

  const totalPrice = finalUnitPrice * quantity

  if (!isOpen || !product) {
    return null
  }

  const handleAddToCart = () => {
    const customizations = {
      temperature,
      cupSize,
      size: `${temperature} (${cupSize})`,
      milk,
      sweetness,
      extraShot,
    }

    addToCart(
      {
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.image_url || product.image,
        price: finalUnitPrice,
        customizations,
        cartItemId: `${product.id}-${JSON.stringify(customizations)}`,
      },
      quantity,
    )

    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm md:items-center" onClick={onClose}>
      <div
        className="animate-in slide-in-from-bottom-8 relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl duration-300 md:zoom-in md:rounded-3xl dark:bg-[#1A1210]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-48 w-full">
          <img src={product.image_url || product.image} alt={product.name} className="h-full w-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-black"
            type="button"
            aria-label="Close product customization"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-honey-deep dark:text-white">{product.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{product.description}</p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold tracking-wider text-gray-800 uppercase dark:text-gray-200">Temperature</h3>
            <div className="grid grid-cols-3 gap-3">
              {['Hot', 'Iced', 'Frappe'].map((option) => (
                <button
                  key={option}
                  onClick={() => setTemperature(option)}
                  className={`rounded-xl border-2 px-1 py-2 text-sm font-bold transition-all ${
                    temperature === option
                      ? 'border-honey bg-honey/10 text-honey-deep dark:text-honey'
                      : 'border-gray-200 text-gray-500 dark:border-honey/10'
                  }`}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex justify-between text-sm font-bold tracking-wider text-gray-800 uppercase dark:text-gray-200">
              Cup Size <span className="text-xs font-normal text-gray-400">Large +฿5</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {['Regular', 'Large'].map((option) => (
                <button
                  key={option}
                  onClick={() => setCupSize(option)}
                  className={`rounded-xl border-2 px-1 py-2 text-sm font-bold transition-all ${
                    cupSize === option
                      ? 'border-honey bg-honey/10 text-honey-deep dark:text-honey'
                      : 'border-gray-200 text-gray-500 dark:border-honey/10'
                  }`}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex justify-between text-sm font-bold tracking-wider text-gray-800 uppercase dark:text-gray-200">
              Milk <span className="text-xs font-normal text-gray-400">Alternative +฿20</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {['Whole Milk', 'Oat Milk', 'Almond Milk'].map((option) => (
                <button
                  key={option}
                  onClick={() => setMilk(option)}
                  className={`rounded-xl border-2 px-1 py-2 text-sm font-bold transition-all ${
                    milk === option
                      ? 'border-honey bg-honey/10 text-honey-deep dark:text-honey'
                      : 'border-gray-200 text-gray-500 dark:border-honey/10'
                  }`}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold tracking-wider text-gray-800 uppercase dark:text-gray-200">Sweetness Level</h3>
            <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-2">
              {['0%', '25%', '50%', '100%', '120%'].map((option) => (
                <button
                  key={option}
                  onClick={() => setSweetness(option)}
                  className={`rounded-xl border-2 px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
                    sweetness === option
                      ? 'border-honey bg-honey/10 text-honey-deep dark:text-honey'
                      : 'border-gray-200 text-gray-500 dark:border-honey/10'
                  }`}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-honey/10 dark:bg-[#2D1B18]">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Extra Espresso Shot</h3>
              <p className="text-xs text-gray-500">+฿20 per shot</p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-2 py-1 dark:border-honey/20 dark:bg-[#1A1210]">
              <button
                onClick={() => setExtraShot((current) => Math.max(0, current - 1))}
                className="p-1 text-gray-500 hover:text-honey"
                type="button"
                aria-label="Decrease extra shots"
              >
                <Minus size={16} />
              </button>
              <span className="w-4 text-center font-bold dark:text-white">{extraShot}</span>
              <button
                onClick={() => setExtraShot((current) => current + 1)}
                className="p-1 text-gray-500 hover:text-honey"
                type="button"
                aria-label="Increase extra shots"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center gap-4 border-t border-gray-100 bg-white p-6 dark:border-honey/10 dark:bg-[#1A1210]">
          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-honey/10 dark:bg-[#2D1B18]">
            <button
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="text-gray-500 hover:text-honey-deep dark:hover:text-honey"
              type="button"
              aria-label="Decrease quantity"
            >
              <Minus size={20} />
            </button>
            <span className="w-4 text-center text-lg font-bold dark:text-white">{quantity}</span>
            <button
              onClick={() => setQuantity((current) => current + 1)}
              className="text-gray-500 hover:text-honey-deep dark:hover:text-honey"
              type="button"
              aria-label="Increase quantity"
            >
              <Plus size={20} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex flex-1 justify-between rounded-xl bg-honey px-6 py-4 text-lg font-bold text-honey-deep shadow-md transition-all hover:bg-honey-dark active:scale-95"
            type="button"
          >
            <span>Add to Cart</span>
            <span>฿{totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
