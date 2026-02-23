import NavBar from '../components/navBar'
import Hero from '../sections/Hero'
import MenuGrid from '../sections/MenuGrid'

function HomePage({ user, onOpenLogin, onOpenCart, onLogout }) {
  return (
    <div className="min-h-screen bg-honey-light font-sans text-honey-deep dark:bg-[#1d120f] dark:text-honey-light">
      <NavBar user={user} onOpenLogin={onOpenLogin} onOpenCart={onOpenCart} onLogout={onLogout} />
      <main>
        <Hero />
        <MenuGrid role={user.role} />
        <section id="story" className="bg-honey-light px-6 py-16 dark:bg-[#241612]">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-3 font-serif text-3xl font-bold text-honey-deep dark:text-honey">Our Story</h2>
            <p className="text-honey-deep/80 dark:text-honey-light/80">
              Coffbee started as a tiny Bangkok brew lab focused on honey-forward espresso profiles.
            </p>
          </div>
        </section>
        <section id="visit" className="bg-honey-light px-6 py-16 dark:bg-[#241612]">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-3 font-serif text-3xl font-bold text-honey-deep dark:text-honey">Visit</h2>
            <p className="text-honey-deep/80 dark:text-honey-light/80">
              Open daily in Bangkok for pickup, tasting flights, and seasonal honey pairings.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
