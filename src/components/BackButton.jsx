import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function BackButton({ fallbackPath = '/', label = 'Back' }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1)
      return
    }

    navigate(fallbackPath, { replace: true })
  }

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 rounded-xl border border-honey/30 bg-white/70 px-4 py-2 font-semibold text-honey-deep transition-colors hover:bg-honey/20 dark:bg-honey-deep/30 dark:text-honey"
      type="button"
    >
      <ArrowLeft size={16} /> {label}
    </button>
  )
}

export default BackButton
