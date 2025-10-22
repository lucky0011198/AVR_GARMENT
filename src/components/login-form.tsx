// login-form.tsx
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAtom } from "jotai"
import { isLogin, userAtom, authLoadingAtom, authErrorAtom, authenticated } from "@/store/atoms"
import { useState, type FormEvent } from "react"
import { authService } from "@/service/authService"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [, setIsLoggedIn] = useAtom(isLogin)
  const [_, setIsAuthenticated] = useAtom(authenticated)
  const [, setUser] = useAtom(userAtom)
  const [isLoading, setIsLoading] = useAtom(authLoadingAtom)
  const [authError, setAuthError] = useAtom(authErrorAtom)
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    setErrors({})
    setAuthError(null)
    
    if (!validateForm()) {
      return
    }
    
    try {
      setIsLoading(true)
      
      // Only call login - don't call getAllUsers()
      const user = await authService.login({ email, password })
      setUser(user)
      setIsAuthenticated(true)
      console.log("Login successful:", user)
      
      // Optional: Navigate to dashboard or home page here
      // Example: navigate('/dashboard')
      
    } catch (error) {
      console.error("Login error:", error)
      setAuthError(
        error instanceof Error 
          ? error.message 
          : "Failed to login. Please check your credentials."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your email account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {authError && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm">
                  {authError}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
                  }}
                  disabled={isLoading}
                  className={cn(
                    errors.email && "border-red-500 focus-visible:ring-red-500"
                  )}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
                  }}
                  disabled={isLoading}
                  className={cn(
                    errors.password && "border-red-500 focus-visible:ring-red-500"
                  )}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </Field>

              <Field>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <a
                    className="cursor-pointer text-primary hover:underline font-medium"
                    onClick={() => setIsLoggedIn(false)}
                  >
                    Sign up
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
