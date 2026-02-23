import { ChevronRight, Coffee } from 'lucide-react'

function ActiveOrderBanner({ order, onClick }) {
  if (!order) {
    return null
  }

  const statusLabel =
    order.status === 'pending'
      ? 'Waiting in queue...'
      : order.status === 'brewing'
        ? 'Barista is brewing...'
        : 'Ready for pickup!'

  return (
    <div
      onClick={onClick}
      className="animate-bounce-short fixed bottom-6 left-1/2 z-40 flex w-[90%] max-w-md -translate-x-1/2 cursor-pointer items-center justify-between rounded-2xl bg-honey-deep p-4 text-white shadow-2xl transition-colors hover:bg-[#2A1810]"
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onClick()
        }
      }}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <Coffee size={20} className="text-honey" />
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-honey opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-honey" />
          </span>
        </div>
        <div>
          <p className="text-xs font-bold tracking-wider text-honey uppercase">Active Order</p>
          <p className="text-sm font-medium">{statusLabel}</p>
        </div>
      </div>
      <ChevronRight className="text-white/50" />
    </div>
  )
}

export default ActiveOrderBanner
