import { Clock, Mail, MapPin, Navigation, Phone } from 'lucide-react'

function VisitUs() {
  return (
    <section id="visit" className="bg-gray-50 py-20 dark:bg-[#1A1210]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">Come say hello.</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Whether you need a quiet corner to work or a quick espresso to go, our doors are open.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col justify-center space-y-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm lg:col-span-1 dark:border-honey/10 dark:bg-[#2D1B18]">
            <div className="flex gap-4">
              <div className="mt-1 text-honey">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Sukhumvit Branch</h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                  123 Sukhumvit Road
                  <br />
                  Khlong Toei, Bangkok 10110
                  <br />
                  Thailand
                </p>
                <a
                  href="https://maps.google.com/?q=123+Sukhumvit+Road+Bangkok"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center gap-2 text-sm font-bold text-honey-deep hover:underline dark:text-honey"
                >
                  <Navigation size={16} />
                  Get Directions
                </a>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-honey/10" />

            <div className="flex gap-4">
              <div className="mt-1 text-honey">
                <Clock size={24} />
              </div>
              <div className="w-full">
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Opening Hours</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex justify-between">
                    <span>Mon - Fri</span>
                    <span>7:00 AM - 7:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday</span>
                    <span>8:00 AM - 8:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </li>
                </ul>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-honey/10" />

            <div className="flex gap-4">
              <div className="mt-1 text-honey">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Contact</h3>
                <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">+66 2 123 4567</p>
                <a href="mailto:hello@coffbee.dev" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Mail size={14} />
                  hello@coffbee.dev
                </a>
              </div>
            </div>
          </div>

          <a
            href="https://maps.google.com/?q=123+Sukhumvit+Road+Bangkok"
            target="_blank"
            rel="noreferrer"
            className="group relative h-[400px] cursor-pointer overflow-hidden rounded-3xl border border-gray-100 shadow-sm lg:col-span-2 lg:h-auto dark:border-honey/10"
          >
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200"
              alt="Coffbee Cafe Exterior"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
              <div className="translate-y-4 rounded-xl bg-white/90 px-6 py-3 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-black/70">
                <p className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <MapPin size={18} className="text-honey" />
                  View on Maps
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}

export default VisitUs
