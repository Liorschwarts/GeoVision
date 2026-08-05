import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) setMessage(error.message)
    setLoading(false)
  }

  return (
    <div
      className="min-h-svh flex flex-col items-center justify-center gap-8 px-8 py-12"
      style={{ background: 'linear-gradient(160deg, #0bbfaa 0%, #00796b 100%)' }}
    >
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white tracking-tight">GeoVision</h1>
        <p className="text-white/70 mt-2">Find cities with a similar visual character</p>
      </div>

      <form onSubmit={submit} className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800">
          {isSignUp ? 'Create account' : 'Welcome back'}
        </h2>

        <label className="block mt-5 text-sm font-medium text-gray-600">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#009e8e]"
          />
        </label>

        <label className="block mt-3 text-sm font-medium text-gray-600">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={event => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#009e8e]"
          />
        </label>

        {message && <p className="mt-3 text-sm text-gray-500">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 h-12 w-full rounded-xl bg-[#009e8e] font-semibold text-white disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Please wait...' : isSignUp ? 'Sign up' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(current => !current)
            setMessage('')
          }}
          className="mt-4 w-full text-sm text-[#00796b] cursor-pointer"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'New to GeoVision? Create an account'}
        </button>
      </form>
    </div>
  )
}
