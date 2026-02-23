import NavBar from '../components/navBar'
import Hero from '../sections/Hero'
import MenuGrid from '../sections/MenuGrid'
import OurStory from '../sections/OurStory'
import VisitUs from '../sections/VisitUs'

function HomePage({ user, onOpenLogin, onOpenCart, onLogout }) {
  return (
    <div className="min-h-screen bg-honey-light font-sans text-honey-deep dark:bg-[#1d120f] dark:text-honey-light">
      <NavBar user={user} onOpenLogin={onOpenLogin} onOpenCart={onOpenCart} onLogout={onLogout} />
      <main>
        <Hero />
        <MenuGrid role={user.role} />
        <OurStory />
        <VisitUs />
      </main>
    </div>
  )
}

export default HomePage
