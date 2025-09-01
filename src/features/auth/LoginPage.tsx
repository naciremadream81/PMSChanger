import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => api.login(data),
    onSuccess: (response) => {
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      queryClient.setQueryData(['user'], { data: response.user })
      navigate('/dashboard')
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        setError('root', {
          type: 'manual',
          message: 'Invalid email or password',
        })
      } else {
        setError('root', {
          type: 'manual',
          message: 'An error occurred. Please try again.',
        })
      }
    },
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Permit Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={cn(
                    'input',
                    errors.email && 'border-danger-300 focus:ring-danger-500 focus:border-danger-500'
                  )}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={cn(
                    'input pr-10',
                    errors.password && 'border-danger-300 focus:ring-danger-500 focus:border-danger-500'
                  )}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
                )}
              </div>
            </div>
          </div>

          {errors.root && (
            <div className="rounded-md bg-danger-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-danger-400" />
                <div className="ml-3">
                  <p className="text-sm text-danger-800">{errors.root.message}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full flex justify-center"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Florida County Permit Management System
          </p>
        </div>
      </div>
    </div>
  )
}
