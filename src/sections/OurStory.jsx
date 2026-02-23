import { Heart, Leaf } from 'lucide-react'
import BrandBee from '../components/BrandBee'

function OurStory() {
  return (
    <section id="story" className="bg-honeycomb relative overflow-hidden py-20">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="relative w-full lg:w-1/2">
            <div className="relative z-10 overflow-hidden rounded-3xl border-4 border-white shadow-2xl dark:border-[#1A1210]">
              <img
                src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800"
                alt="Barista pouring latte art"
                className="h-[500px] w-full object-cover"
              />
            </div>

            <div className="absolute -bottom-8 -left-8 -z-10 h-64 w-64 rounded-full bg-honey/40 blur-3xl" />
          </div>

          <div className="relative w-full space-y-6 lg:w-1/2">
            <div className="absolute -top-12 right-0 text-honey/30 dark:text-honey/20">
              <BrandBee size={80} className="animate-float" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-honey/20 px-3 py-1 text-sm font-bold tracking-wider text-honey-deep uppercase backdrop-blur-sm dark:text-honey">
              <Heart size={16} />
              Our Heritage
            </div>

            <h2 className="font-serif text-4xl leading-tight font-bold text-gray-900 dark:text-white md:text-5xl">
              Brewed with passion, <br />
              <span className="text-honey">poured with purpose.</span>
            </h2>

            <p className="text-lg leading-relaxed font-medium text-gray-700 dark:text-gray-300">
              Coffbee started as a tiny pop-up in the heart of Bangkok. We believed that coffee shouldn&apos;t just
              be a morning rush—it should be a moment of connection.
            </p>

            <p className="mb-8 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              Today, we work directly with local farmers in Northern Thailand to source the most ethical,
              high-quality beans, roasting them in-house to ensure every drop in your cup tells a story.
            </p>

            <div className="grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 dark:border-honey/20 md:grid-cols-2">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-honey/20 text-honey-deep dark:text-honey">
                  <Leaf size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Ethically Sourced</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Direct trade with local Thai farmers.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-200 text-gray-800 dark:bg-[#2D1B18] dark:text-gray-300">
                  <BrandBee size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">The Hive Standard</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Small batches roasted perfectly every week.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OurStory
