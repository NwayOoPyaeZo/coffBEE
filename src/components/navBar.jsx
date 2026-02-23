import { useEffect, useState } from 'react'
import { Moon, Sun, Menu, ShoppingBag, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'
import BrandBee from './BrandBee'

function NavBar({ user, onOpenLogin, onOpenCart, onLogout }) {
  const [darkMode, setDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { totalItems } = useCart()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const navLinks = [
    { name: 'Menu', href: '#menu' },
    { name: 'Our Story', href: '#story' },
    { name: 'Visit Us', href: '#visit' },
  ]

  return (
    <>
      <nav className="sticky top-0 left-0 z-50 w-full border-b border-honey/20 bg-honey-light/80 backdrop-blur-md transition-colors duration-300 dark:bg-honey-deep/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          {/* Logo Area */}
          <button
            className="flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
            type="button"
            aria-label="Coffbee logo"
          >
            <div className="rounded-lg bg-honey p-2">
              <BrandBee className="text-honey-deep" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-honey-deep dark:text-honey">
              COFF<span className="text-honey dark:text-white">BEE</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 font-medium md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-honey-deep transition-colors hover:text-honey dark:text-honey-light"
              >
                {link.name}
              </a>
            ))}

            {user.role === 'member' && (
              <Link
                to="/profile"
                className="rounded border border-honey px-3 py-1 font-bold text-honey transition-colors hover:bg-honey hover:text-honey-deep"
              >
                Profile
              </Link>
            )}

            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="rounded border border-honey px-3 py-1 font-bold text-honey transition-colors hover:bg-honey hover:text-honey-deep"
              >
                Admin Panel
              </Link>
            )}

            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="rounded-full bg-honey-deep/5 p-2 text-honey-deep transition-transform hover:scale-110 dark:bg-white/10 dark:text-honey"
              type="button"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={onOpenCart}
              className="relative rounded-full bg-honey-deep/5 p-2 text-honey-deep dark:bg-white/10 dark:text-honey"
              type="button"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 rounded-full bg-honey px-1.5 text-[10px] font-bold leading-5 text-honey-deep">
                  {totalItems}
                </span>
              )}
            </button>

            {user.role === 'guest' ? (
              <button
                onClick={onOpenLogin}
                className="rounded-full bg-honey px-5 py-2 font-bold text-honey-deep shadow-lg shadow-honey/20 transition-colors hover:bg-honey-dark"
                type="button"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="rounded-full bg-honey px-5 py-2 font-bold text-honey-deep shadow-lg shadow-honey/20 transition-colors hover:bg-honey-dark"
                type="button"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Actions (Toggle & Hamburger) */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="text-honey-deep dark:text-honey"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={onOpenCart}
              className="relative text-honey-deep dark:text-honey"
              type="button"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-honey px-1.5 text-[10px] font-bold leading-5 text-honey-deep">
                  {totalItems}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-honey-deep dark:text-honey"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      
      {/* Backdrop Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar Content */}
      <div className={`fixed top-0 right-0 z-[70] h-full w-72 bg-honey-light p-8 shadow-2xl transition-transform duration-300 ease-in-out dark:bg-honey-deep md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex justify-end mb-8">
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-honey-deep dark:text-honey">
            <X size={32} />
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-bold text-honey-deep dark:text-honey-light hover:text-honey transition-colors"
            >
              {link.name}
            </a>
          ))}

          {user.role === 'member' && (
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl border border-honey px-4 py-3 text-center text-lg font-bold text-honey"
            >
              Profile
            </Link>
          )}

          {user.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl border border-honey px-4 py-3 text-center text-lg font-bold text-honey"
            >
              Admin Panel
            </Link>
          )}

          {user.role === 'guest' ? (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                onOpenLogin()
              }}
              className="mt-4 rounded-xl bg-honey py-4 text-center font-bold text-honey-deep shadow-lg"
              type="button"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                onLogout()
              }}
              className="mt-4 rounded-xl bg-honey py-4 text-center font-bold text-honey-deep shadow-lg"
              type="button"
            >
              Logout
            </button>
          )}
        </div>

        {/* Decorative Honeybee Element */}
        <div className="absolute bottom-10 left-8 opacity-10 dark:opacity-20">
          <BrandBee size={120} className="text-honey-deep dark:text-honey" />
        </div>
      </div>
    </>
  )
}

export default NavBar