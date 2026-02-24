import { Coffee } from 'lucide-react'

function Preloader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-honey-light dark:bg-honey-deep">
      <div className="relative">
        <div className="absolute -top-24 left-1/2 h-24 w-16 -translate-x-1/2 animate-drip">
          <div className="honey-drop relative h-full w-full overflow-hidden rounded-[58%_58%_62%_62%/56%_56%_44%_44%]" />
        </div>

        <div className="relative flex h-24 w-24 animate-pulse items-center justify-center rounded-3xl bg-white shadow-2xl dark:bg-honey-deep/50">
          <Coffee className="text-honey" size={48} />
        </div>
      </div>

      <h2 className="mt-8 font-serif text-2xl font-bold tracking-widest text-honey-deep dark:text-honey">
        COFF<span className="text-honey">BEE</span>
      </h2>
      <p className="mt-2 animate-pulse text-sm font-medium text-honey-deep/40 dark:text-honey/40">
        Brewing your experience...
      </p>
    </div>
  )
}

export default Preloader
