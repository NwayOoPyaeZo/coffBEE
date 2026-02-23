import { useState } from 'react'
import { Lock, Mail, User, X } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function LoginModal({ setUser, closeModal }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
    const payload = isLogin
      ? { username: formData.username, password: formData.password }
      : { email: formData.email, password: formData.password, username: formData.username }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Authentication failed')
        return
      }

      setUser(data.user)
    } catch {
      setError('Could not connect to auth server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl border border-honey/20 bg-honey-light p-8 shadow-2xl dark:bg-honey-deep">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-honey-deep dark:text-honey"
          type="button"
          aria-label="Close login modal"
        >
          <X size={24} />
        </button>

        <h2 className="mb-2 text-center font-serif text-3xl font-bold text-honey-deep dark:text-honey">
          {isLogin ? 'Welcome Back' : 'Join Coffbee'}
        </h2>
        <p className="mb-8 text-center text-sm text-honey-deep/60 dark:text-honey/60">
          {isLogin ? 'The honey is waiting for you.' : 'Start earning Honey Drops today.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute top-3 left-3 text-honey" size={20} />
            <input
              type="text"
              placeholder="Username"
              className="w-full rounded-xl border border-honey/10 bg-white py-3 pr-4 pl-10 focus:border-honey focus:outline-none dark:bg-[#2D1B18]"
              value={formData.username}
              onChange={(event) => handleChange('username', event.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <Mail className="absolute top-3 left-3 text-honey" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-xl border border-honey/10 bg-white py-3 pr-4 pl-10 focus:border-honey focus:outline-none dark:bg-[#2D1B18]"
                value={formData.email}
                onChange={(event) => handleChange('email', event.target.value)}
                required
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute top-3 left-3 text-honey" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-honey/10 bg-white py-3 pr-4 pl-10 focus:border-honey focus:outline-none dark:bg-[#2D1B18]"
              value={formData.password}
              onChange={(event) => handleChange('password', event.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-500/20 dark:text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-honey py-4 font-bold text-honey-deep shadow-lg transition-all hover:bg-honey-dark disabled:cursor-not-allowed disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm dark:text-white/60">
          {isLogin ? "Don't have an account?" : 'Already a member?'}{' '}
          <button
            onClick={() => {
              setIsLogin((previous) => !previous)
              setError('')
            }}
            className="font-bold text-honey hover:underline"
            type="button"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginModal
