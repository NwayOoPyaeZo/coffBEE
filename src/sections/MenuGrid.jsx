import { useEffect, useState } from 'react'
import ProductModal from '../components/ProductModal'

const coffeeMenu = [
  {
    id: 1,
    name: 'Espresso Noir',
    description: 'Our signature dark roast with notes of chocolate and molasses.',
    price: '$3.50',
    image:
      'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=600&q=80',
    tag: 'Classic',
  },
  {
    id: 2,
    name: 'Matcha Cloud Latte',
    description: 'Premium ceremonial matcha topped with a silky vanilla cold foam.',
    price: '$5.25',
    image:
      'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80',
    tag: 'Trending',
  },
  {
    id: 3,
    name: 'Honeybee Macchiato',
    description: 'Double shot espresso, steamed oat milk, and local organic honey.',
    price: '$4.75',
    image:
      'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80',
    tag: 'Signature',
  },
  {
    id: 4,
    name: 'Cold Brew Float',
    description: '12-hour steeped cold brew served with a scoop of Madagascar vanilla.',
    price: '$5.50',
    image:
      'https://images.unsplash.com/photo-1461023058943-07fcaf1835e7?auto=format&fit=crop&w=600&q=80',
    tag: 'Cold',
  },
]

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function formatPrice(value) {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return '฿0.00'
  }

  return `฿${numericValue.toFixed(2)}`
}

function toTitleCase(text) {
  if (!text) {
    return 'Special'
  }

  return text
    .toString()
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function MenuGrid({ role = 'guest' }) {
  const [menu, setMenu] = useState(coffeeMenu)
  const [error, setError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/products`)

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const data = await response.json()

        if (!Array.isArray(data) || data.length === 0 || !isMounted) {
          return
        }

        const mappedMenu = data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          numericPrice: Number(item.price) || 0,
          price: formatPrice(item.price),
          image: item.image_url || coffeeMenu[0].image,
          rawImageUrl: item.image_url || '',
          tag: toTitleCase(item.category),
        }))

        if (import.meta.env.DEV) {
          mappedMenu.forEach((product) => {
            console.log('product.image_url:', product.rawImageUrl)
          })
        }

        setMenu(mappedMenu)
        setError('')
      } catch {
        if (!isMounted) {
          return
        }

        setError('Could not load live menu. Showing fallback items.')
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section id="menu" className="bg-honey-light py-20 dark:bg-[#241612]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-4xl font-bold text-honey-deep dark:text-honey">The Coffbee Menu</h2>
          <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-honey" />
          <p className="mx-auto max-w-2xl italic text-[#5d4037] dark:text-honey-light/80">
            Handpicked beans roasted in small batches, delivered from farm to cup.
          </p>
          {error && <p className="mt-3 text-sm text-orange-600 dark:text-orange-300">{error}</p>}
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {menu.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-[#2d1b18]"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(event) => {
                    console.error('Image failed:', item.rawImageUrl || item.image)
                    if (event.currentTarget.src !== coffeeMenu[0].image) {
                      event.currentTarget.src = coffeeMenu[0].image
                    }
                  }}
                />
                <span className="absolute top-4 right-4 rounded-full bg-honey px-3 py-1 text-xs font-bold tracking-widest text-honey-deep uppercase">
                  {item.tag}
                </span>
              </div>

              <div className="p-6">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-honey-deep dark:text-honey-light">{item.name}</h3>
                  <span className="font-serif text-lg font-semibold text-[#8D6E63] dark:text-honey">{item.price}</span>
                </div>
                <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-honey-light/75">{item.description}</p>

                <button
                  onClick={() => {
                    if (role === 'guest') {
                      return
                    }

                    setSelectedProduct({
                      id: item.id,
                      name: item.name,
                      description: item.description,
                      image: item.image,
                      image_url: item.rawImageUrl || item.image,
                      price: item.numericPrice,
                      numericPrice: item.numericPrice,
                    })
                  }}
                  className="w-full rounded-lg border-2 border-honey-deep py-3 font-bold text-honey-deep transition-colors duration-300 hover:bg-honey-deep hover:text-white dark:border-honey dark:text-honey dark:hover:bg-honey dark:hover:text-honey-deep"
                  type="button"
                >
                  {role === 'guest' ? 'Login to Order' : 'Select Options'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <ProductModal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} />
      </div>
    </section>
  )
}

export default MenuGrid
