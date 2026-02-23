import NavBar from '../components/navBar'
import MenuGrid from '../sections/MenuGrid'

function MenuPage({ user, onOpenLogin, onOpenCart, onLogout }) {
  return (
    <div className="min-h-screen bg-honey-light font-sans text-honey-deep dark:bg-[#1d120f] dark:text-honey-light">
      <NavBar user={user} onOpenLogin={onOpenLogin} onOpenCart={onOpenCart} onLogout={onLogout} />
      <main>
        <MenuGrid role={user.role} />
      </main>
    </div>
  )
}

export default MenuPage
