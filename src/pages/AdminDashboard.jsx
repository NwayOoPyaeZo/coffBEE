import { useEffect, useState } from 'react'
import {
  Coffee,
  LayoutDashboard,
  ListOrdered,
  TrendingUp,
  Package,
  Users,
  Settings,
  Edit2,
  X,
  Save,
  Trash2,
  ChevronRight,
  Download,
  Search,
  Menu,
} from 'lucide-react'
import BackButton from '../components/BackButton'
import CustomerDetailsModal from '../components/CustomerDetailsModal'
import OrderDetailsModal from '../components/OrderDetailsModal'
import BrandBee from '../components/BrandBee'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function AdminDashboard({ user }) {
  const [activeModule, setActiveModule] = useState('overview')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/orders`),
        fetch(`${API_BASE}/api/products`),
        fetch(`${API_BASE}/api/admin/customers`),
      ])

      if (ordersRes.ok) {
        setOrders(await ordersRes.json())
      }

      if (productsRes.ok) {
        setProducts(await productsRes.json())
      }

      if (customersRes.ok) {
        setCustomers(await customersRes.json())
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err)
    }
  }

  useEffect(() => {
    const initialFetch = setTimeout(() => {
      fetchData()
    }, 0)

    const interval = setInterval(() => {
      if (!editingProduct) {
        fetchData()
      }
    }, 10000)

    return () => {
      clearTimeout(initialFetch)
      clearInterval(interval)
    }
  }, [editingProduct])

  const advanceStatus = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'brewing' : 'completed'

    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (res.ok) {
        setOrders((previousOrders) =>
          previousOrders.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)),
        )
      }
    } catch (err) {
      console.error('Status update failed', err)
    }
  }

  const getWaitTime = (dateString) => {
    const orderDate = new Date(dateString)
    const now = new Date()
    return Math.floor((now - orderDate) / 60000)
  }

  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm('Are you sure you want to cancel and delete this order?')

    if (!confirmed) {
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setOrders((previousOrders) => previousOrders.filter((order) => order.id !== orderId))
      } else {
        window.alert('Failed to delete order.')
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const handleSaveProduct = async (id) => {
    if (!editingProduct) {
      return
    }

    const payload = {
      price: Number(editingProduct.price),
      stock_level: Number(editingProduct.stock_level),
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setProducts((previousProducts) =>
          previousProducts.map((product) => (product.id === id ? { ...product, ...payload } : product)),
        )
        setEditingProduct(null)
      }
    } catch (err) {
      console.error('Failed to save product', err)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${userName}? Their financial history will be kept, but their account will be permanently erased.`,
    )

    if (!confirmed) {
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/customers/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-actor-user-id': user?.id || '',
        },
      })

      if (res.ok) {
        setCustomers((previousCustomers) => previousCustomers.filter((customer) => customer.id !== userId))
      } else {
        window.alert('Failed to delete user.')
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const handleDownloadCSV = () => {
    if (customers.length === 0) {
      return
    }

    const escapeCSV = (value) => {
      const stringValue = String(value ?? '')
      return `"${stringValue.replaceAll('"', '""')}"`
    }

    const headers = [
      'Customer ID',
      'Full Name',
      'Email',
      'Role',
      'Joined Date',
      'Total Orders',
      'Lifetime Value (THB)',
      'Honey Points',
    ]

    const rows = customers.map((customer) => [
      customer.id,
      escapeCSV(customer.full_name),
      escapeCSV(customer.email),
      customer.role,
      new Date(customer.created_at).toLocaleDateString(),
      customer.total_orders,
      Number(customer.lifetime_value || 0).toFixed(2),
      customer.honey_points,
    ])

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateString = new Date().toISOString().split('T')[0]

    link.href = url
    link.setAttribute('download', `coffbee_customers_export_${dateString}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
  const lowStockItems = products.filter((product) => Number(product.stock_level) < 30)
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = customerSearch.toLowerCase()
    return (
      (customer.full_name || '').toLowerCase().includes(searchLower) ||
      (customer.email || '').toLowerCase().includes(searchLower)
    )
  })
  const sortedActiveOrders = [...orders]
    .filter((order) => order.status !== 'completed')
    .sort((firstOrder, secondOrder) => new Date(firstOrder.order_date) - new Date(secondOrder.order_date))

  const getQueueNumber = (orderId) => {
    const orderIndex = sortedActiveOrders.findIndex((order) => order.id === orderId)
    return orderIndex >= 0 ? orderIndex + 1 : null
  }

  const navItems = [
    { id: 'overview', label: 'Overview & CMS', icon: LayoutDashboard },
    { id: 'orders', label: 'Live Orders', icon: ListOrdered },
    { id: 'customers', label: 'Customers & CRM', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="relative flex h-screen overflow-hidden bg-gray-50 dark:bg-[#120C0A]">
      <div className="absolute top-0 right-0 left-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden dark:border-honey/10 dark:bg-[#1A1210]">
        <h1 className="font-serif text-xl font-black tracking-widest text-honey-deep uppercase dark:text-white">
          Coffbee Admin
        </h1>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-gray-500 transition-colors hover:text-honey-deep dark:text-gray-400 dark:hover:text-honey"
          type="button"
        >
          <Menu size={24} />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 dark:border-honey/10 dark:bg-[#1A1210] ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-honey/10">
          <div>
            <h1 className="flex items-center gap-2 font-serif text-2xl font-black tracking-widest text-honey-deep uppercase dark:text-white">
              <BrandBee size={28} className="text-honey animate-float" />
              Coffbee
            </h1>
            <p className="mt-1 pl-9 text-xs text-gray-500">Admin Portal</p>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-400 transition-colors hover:text-honey-deep md:hidden"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeModule === item.id

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full rounded-xl px-4 py-3 text-left font-bold transition-all ${
                  isActive
                    ? 'bg-honey text-honey-deep shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2D1B18]'
                }`}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <Icon size={20} />
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-20 md:p-8">
        <div className="mb-6">
          <BackButton fallbackPath="/" label="Back to Home" />
        </div>

        {activeModule === 'overview' && (
          <div className="animate-in fade-in mx-auto max-w-6xl space-y-8 duration-300">
            <h2 className="font-serif text-3xl font-bold text-honey-deep dark:text-white">Business Snapshot</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-honey/10 dark:bg-[#1A1210]">
                <div className="rounded-2xl bg-green-100 p-4 text-green-600">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase">Total Revenue</p>
                  <p className="text-2xl font-black text-gray-800 dark:text-white">฿{totalRevenue.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-honey/10 dark:bg-[#1A1210]">
                <div className="rounded-2xl bg-honey/20 p-4 text-honey-deep">
                  <ListOrdered size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase">Total Orders</p>
                  <p className="text-2xl font-black text-gray-800 dark:text-white">{orders.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-honey/10 dark:bg-[#1A1210]">
                <div className="rounded-2xl bg-red-100 p-4 text-red-600">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase">Low Stock Alerts</p>
                  <p className="text-2xl font-black text-gray-800 dark:text-white">{lowStockItems.length} items</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-honey/10 dark:bg-[#1A1210]">
              <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-honey/10">
                <h2 className="text-xl font-bold text-honey-deep dark:text-white">Menu CMS &amp; Inventory</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-sm text-gray-500 uppercase dark:bg-[#2D1B18] dark:text-gray-400">
                    <tr>
                      <th className="p-4 font-bold">Product</th>
                      <th className="p-4 font-bold">Price (฿)</th>
                      <th className="p-4 font-bold">Stock Level</th>
                      <th className="p-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-honey/10">
                    {products.map((product) => {
                      const isEditing = editingProduct?.id === product.id

                      return (
                        <tr key={product.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-[#2D1B18]/50">
                          <td className="flex items-center gap-3 p-4 font-bold text-gray-800 dark:text-white">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                            {product.name}
                          </td>

                          <td className="p-4">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editingProduct.price}
                                onChange={(event) =>
                                  setEditingProduct({ ...editingProduct, price: event.target.value })
                                }
                                className="w-24 rounded-lg border border-honey p-2 focus:ring-2 focus:ring-honey focus:outline-none dark:bg-[#1A1210] dark:text-white"
                              />
                            ) : (
                              <span className="font-bold text-honey">฿{Number(product.price).toFixed(2)}</span>
                            )}
                          </td>

                          <td className="p-4">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editingProduct.stock_level}
                                onChange={(event) =>
                                  setEditingProduct({ ...editingProduct, stock_level: event.target.value })
                                }
                                className="w-20 rounded-lg border border-honey p-2 focus:ring-2 focus:ring-honey focus:outline-none dark:bg-[#1A1210] dark:text-white"
                              />
                            ) : (
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  Number(product.stock_level) < 30
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {product.stock_level} units
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setEditingProduct(null)}
                                  className="p-2 text-gray-400 transition-colors hover:text-red-500"
                                  type="button"
                                >
                                  <X size={20} />
                                </button>
                                <button
                                  onClick={() => handleSaveProduct(product.id)}
                                  className="rounded-lg bg-honey p-2 text-honey-deep transition-colors hover:bg-honey-dark"
                                  type="button"
                                >
                                  <Save size={20} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingProduct({ ...product })}
                                className="p-2 text-gray-400 transition-colors hover:text-honey"
                                type="button"
                              >
                                <Edit2 size={20} />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeModule === 'orders' && (
          <div className="animate-in fade-in mx-auto max-w-7xl duration-300">
            <h2 className="mb-8 font-serif text-3xl font-bold text-honey-deep dark:text-white">Fulfillment Board</h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {['pending', 'brewing', 'completed'].map((statusColumn) => (
                <div
                  key={statusColumn}
                  className="flex h-[calc(100vh-12rem)] flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-honey/10 dark:bg-[#1A1210]"
                >
                  <h2 className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 text-xl font-bold tracking-wider text-gray-500 uppercase dark:border-honey/10 dark:text-gray-400">
                    {statusColumn}
                    <span className="rounded-full bg-honey/20 px-3 py-1 text-sm text-honey-deep dark:text-honey">
                      {orders.filter((order) => order.status === statusColumn).length}
                    </span>
                  </h2>

                  <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                    {orders
                      .filter((order) => order.status === statusColumn)
                      .sort((firstOrder, secondOrder) => new Date(firstOrder.order_date) - new Date(secondOrder.order_date))
                      .map((order) => {
                        const waitTime = getWaitTime(order.order_date)
                        const isLate = waitTime >= 10 && order.status !== 'completed'
                        const queueNumber = getQueueNumber(order.id)

                        return (
                          <div
                            key={order.id}
                            onClick={() => setSelectedOrderDetails(order)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                setSelectedOrderDetails(order)
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Open order details for #${String(order.id).split('-')[0].toUpperCase()}`}
                            className={`cursor-pointer rounded-2xl border p-4 transition-all hover:shadow-md ${
                              isLate
                                ? 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10'
                                : 'border-gray-100 bg-gray-50 dark:border-honey/20 dark:bg-[#2D1B18]'
                            }`}
                          >
                            <div className="mb-3 flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                {queueNumber && (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-honey text-sm font-black text-honey-deep shadow-sm">
                                    {queueNumber}
                                  </div>
                                )}

                                <div>
                                  <span className="text-lg font-black text-honey-deep dark:text-white">
                                    #{String(order.id).split('-')[0].toUpperCase()}
                                  </span>
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500">
                                      {new Date(order.order_date).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>

                                    {order.status !== 'completed' && (
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                          isLate ? 'bg-red-200 text-red-800' : 'bg-honey/20 text-honey-deep dark:text-honey'
                                        }`}
                                      >
                                        {waitTime}m wait
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleDeleteOrder(order.id)
                                }}
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-red-500 dark:hover:bg-[#1A1210]"
                                title="Cancel Order"
                                type="button"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <p className="mb-3 border-b border-gray-200 pb-3 text-sm text-gray-600 dark:border-honey/10 dark:text-gray-300">
                              Customer: <span className="font-bold">{order.customer_name || 'Guest'}</span>
                            </p>

                            <ul className="mb-4 space-y-1">
                              {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                                <li key={`${order.id}-${idx}`} className="flex justify-between text-sm dark:text-gray-200">
                                  <span className="truncate pr-2">
                                    <span className="mr-1 font-bold text-honey">{item.quantity}x</span>
                                    {item.name}
                                  </span>
                                </li>
                              ))}
                            </ul>

                            {order.status !== 'completed' && (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation()
                                  advanceStatus(order.id, order.status)
                                }}
                                className="w-full rounded-xl bg-honey py-2 font-bold text-honey-deep shadow-sm transition-all hover:bg-honey-dark active:scale-95"
                                type="button"
                              >
                                {order.status === 'pending' ? 'Start Brewing' : 'Mark as Ready'}
                              </button>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeModule === 'customers' && (
          <div className="animate-in fade-in mx-auto max-w-6xl space-y-8 duration-300">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <h2 className="font-serif text-3xl font-bold text-honey-deep dark:text-white">Customer Database</h2>

              <div className="flex w-full flex-wrap items-center gap-4 md:w-auto">
                <div className="relative grow md:grow-0">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={customerSearch}
                    onChange={(event) => setCustomerSearch(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2 pr-4 pl-10 text-gray-800 shadow-sm transition-all focus:ring-2 focus:ring-honey focus:outline-none md:w-64 dark:border-honey/20 dark:bg-[#1A1210] dark:text-white"
                  />
                </div>

                <div className="rounded-xl bg-honey/10 px-4 py-2 font-bold whitespace-nowrap text-honey-deep dark:text-honey">
                  Total: {filteredCustomers.length}
                </div>

                <button
                  onClick={handleDownloadCSV}
                  disabled={customers.length === 0}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gray-800 px-4 py-2 font-bold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-800 dark:bg-[#2D1B18] dark:hover:bg-gray-800 dark:disabled:hover:bg-[#2D1B18]"
                  title={customers.length === 0 ? 'No customers to export yet' : 'Download as Spreadsheet'}
                  type="button"
                >
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>

            <p className="-mt-4 text-sm font-medium text-honey-deep/60 dark:text-honey/60">
              Tip: Click any customer row to view their full profile and order history.
            </p>

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-honey/10 dark:bg-[#1A1210]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-sm text-gray-500 uppercase dark:bg-[#2D1B18] dark:text-gray-400">
                    <tr>
                      <th className="p-4 font-bold">Customer</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold">Top Order</th>
                      <th className="p-4 font-bold">LTV &amp; Points</th>
                      <th className="p-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-honey/10">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-500">
                          No customers found matching "{customerSearch}"
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => {
                        const lifetimeValue = Number(customer.lifetime_value || 0)
                        const isVip = lifetimeValue > 500

                        return (
                          <tr
                            key={customer.id}
                            onClick={() => setSelectedCustomer(customer)}
                            className="group cursor-pointer transition-colors hover:bg-honey/5 dark:hover:bg-honey/10"
                          >
                            <td className="p-4">
                              <p className="flex items-center gap-2 font-bold text-gray-800 dark:text-white">
                                {customer.full_name}
                                {customer.role === 'admin' && (
                                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] tracking-wider text-red-600 uppercase">
                                    Staff
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">{customer.email}</p>
                              <p className="mt-1 text-[10px] text-gray-400">
                                Joined: {new Date(customer.created_at).toLocaleDateString()}
                              </p>
                            </td>

                            <td className="p-4">
                              {isVip ? (
                                <span className="rounded-full border border-yellow-200 bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                                  VIP Member
                                </span>
                              ) : (
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                                  Regular
                                </span>
                              )}

                              <div className="mt-2 text-xs font-medium text-gray-500">
                                {customer.total_orders} {Number(customer.total_orders) === 1 ? 'order' : 'orders'} total
                              </div>
                            </td>

                            <td className="p-4">
                              {customer.favorite_item ? (
                                <span className="flex items-center gap-2 text-sm font-bold text-honey-deep dark:text-honey-light">
                                  <Coffee size={14} className="text-honey" />
                                  {customer.favorite_item}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400 italic">No orders yet</span>
                              )}
                            </td>

                            <td className="p-4">
                              <p className="font-black text-honey-deep dark:text-white">฿{lifetimeValue.toFixed(2)}</p>
                              <p className="mt-1 text-xs font-bold text-honey">{customer.honey_points} drops</p>
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {customer.role !== 'admin' && (
                                  <button
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      handleDeleteUser(customer.id, customer.full_name)
                                    }}
                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                                    title="Delete User"
                                    type="button"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}

                                <span className="text-gray-300 transition-colors group-hover:text-honey dark:text-gray-600 dark:group-hover:text-honey">
                                  <ChevronRight size={16} />
                                </span>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeModule === 'settings' && (
          <div className="animate-in fade-in mx-auto max-w-6xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm duration-300 dark:border-honey/10 dark:bg-[#1A1210]">
            <h2 className="mb-2 font-serif text-3xl font-bold text-honey-deep dark:text-white">Settings</h2>
            <p className="text-gray-500 dark:text-gray-400">Portal settings module is ready for next sprint.</p>
          </div>
        )}

        <CustomerDetailsModal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          customer={selectedCustomer}
        />

        <OrderDetailsModal
          isOpen={!!selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
          order={selectedOrderDetails}
          queueNumber={selectedOrderDetails ? getQueueNumber(selectedOrderDetails.id) : null}
        />
      </div>
    </div>
  )
}

export default AdminDashboard
