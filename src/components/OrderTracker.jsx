import { CheckCircle2, Clock, Coffee, PackageCheck } from 'lucide-react'

function OrderTracker({ status }) {
  const steps = [
    { id: 'pending', label: 'Order Received', icon: Clock },
    { id: 'brewing', label: 'Preparing Order', icon: Coffee },
    { id: 'completed', label: 'Ready for Pickup', icon: PackageCheck },
  ]

  const getStepIndex = (currentStatus) => {
    if (currentStatus === 'completed') {
      return 2
    }

    if (currentStatus === 'brewing') {
      return 1
    }

    return 0
  }

  const currentIndex = getStepIndex(status)

  if (status === 'cancelled') {
    return <div className="rounded-xl bg-red-50 p-4 font-bold text-red-500">Order Cancelled</div>
  }

  return (
    <div className="relative my-6 flex w-full items-center justify-between">
      <div className="absolute top-1/2 left-0 z-0 h-1 w-full -translate-y-1/2 rounded-full bg-honey/20" />

      <div
        className="absolute top-1/2 left-0 z-0 h-1 -translate-y-1/2 rounded-full bg-honey transition-all duration-500"
        style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <div
            key={step.id}
            className="relative z-10 flex flex-col items-center gap-2 bg-white px-2 dark:bg-[#2D1B18]"
          >
            <div
              className={`
                flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300
                ${isActive ? 'bg-honey text-honey-deep' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}
                ${isCurrent ? 'ring-4 ring-honey/30' : ''}
              `}
            >
              {isActive && !isCurrent ? <CheckCircle2 size={20} /> : <Icon size={20} />}
            </div>
            <span
              className={`w-20 text-center text-xs font-bold ${
                isActive ? 'text-honey-deep dark:text-honey' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default OrderTracker
