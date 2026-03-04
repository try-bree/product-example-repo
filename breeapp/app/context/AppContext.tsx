import { createContext, FC, PropsWithChildren, useContext, useEffect, useState } from "react"

import { api } from "@/services/api"

export type AppContextType = {
  // User & Auth State
  user: User | null
  setUser: (user: User | null) => void

  // Loan Application State
  currentLoan: Loan | null
  setCurrentLoan: (loan: Loan | null) => void
  loanHistory: Loan[]
  setLoanHistory: (loans: Loan[]) => void
  selectedAmount: number
  setSelectedAmount: (amount: number) => void

  // UI State mixed with business state
  loading: boolean
  setLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  isEligible: boolean
  setIsEligible: (eligible: boolean) => void

  // Theme/UI state mixed in
  theme: string
  setTheme: (theme: string) => void
  notifications: string[]
  setNotifications: (notifications: string[]) => void

  // Business Logic Functions mixed in context (BAD!)
  calculateDefaultTip: (amount: number) => number
  calculateDueDate: (amount: number) => Date
  checkEligibility: (amount: number) => Promise<void>
  createLoan: (
    amount: number,
    tip: number,
    deliveryMethod?: "standard" | "express",
    deliveryFee?: number,
  ) => Promise<void>
  fetchLoanHistory: () => Promise<void>

  // API Configuration mixed in
  apiBaseUrl: string
  setApiBaseUrl: (url: string) => void
}

export type User = {
  id: number
  email: string
  name: string
  creditScore: number
  hasActiveLoan: boolean
}

export type Loan = {
  id: number
  userId: number
  amount: number
  tip: number
  dueDate: string
  status: "pending" | "approved" | "rejected" | "paid"
  createdAt: string
  deliveryMethod?: "standard" | "express"
  deliveryFee?: number
}

export const AppContext = createContext<AppContextType | null>(null)

export interface AppProviderProps {}

export const AppProvider: FC<PropsWithChildren<AppProviderProps>> = ({ children }) => {
  // Mix all types of state in one place (BAD PATTERN!)
  const [user, setUser] = useState<User | null>(null)
  const [currentLoan, setCurrentLoan] = useState<Loan | null>(null)
  const [loanHistory, setLoanHistory] = useState<Loan[]>([])
  const [selectedAmount, setSelectedAmount] = useState<number>(100)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isEligible, setIsEligible] = useState<boolean>(false)
  const [theme, setTheme] = useState<string>("light")
  const [notifications, setNotifications] = useState<string[]>([])
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("http://localhost:3001/api")

  // Business logic directly in context (BAD!)
  const calculateDefaultTip = (amount: number): number => {
    // Default to 10% tip for cash advances (modern standard)
    return Math.round(amount * 0.1)
  }

  const calculateDueDate = (amount: number): Date => {
    const days = amount > 200 ? 14 : 7
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + days)
    return dueDate
  }

  // API calls directly in context (BAD!)
  const checkEligibility = async (amount: number): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/check-eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, amount }),
      })
      const data = await response.json()
      setIsEligible(data.eligible)
    } catch {
      setError("Failed to check eligibility")
    }
    setLoading(false)
  }

  const createLoan = async (
    amount: number,
    tip: number,
    deliveryMethod: "standard" | "express" = "express",
    deliveryFee = 8.49,
  ): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/loans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          amount,
          tip,
          dueDate: calculateDueDate(amount).toISOString(),
          riskLevel: "Low Risk",
          deliveryMethod,
          deliveryFee,
        }),
      })
      const data = await response.json()
      setCurrentLoan(data)
      setNotifications([
        ...notifications,
        `Loan application submitted for $${amount} with $${tip} tip!`,
      ])
    } catch {
      setError("Failed to create loan")
    }
    setLoading(false)
  }

  const fetchLoanHistory = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await fetch(`${apiBaseUrl}/loans?userId=${user?.id}`)
      const data = await response.json()
      setLoanHistory(data)
    } catch {
      setError("Failed to fetch loan history")
    }
    setLoading(false)
  }

  // Auto-login demo user on mount (for interview convenience)
  useEffect(() => {
    const fetchDemoUser = async () => {
      try {
        setLoading(true)
        const userData = await api.getUser(1) // Fetch from backend
        const demoUser: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          creditScore: userData.credit_score, // From database!
          hasActiveLoan: userData.has_active_loan,
        }
        setUser(demoUser)
      } catch (error) {
        console.error("Failed to fetch demo user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDemoUser()
  }, [])

  const value: AppContextType = {
    // Expose everything (BAD PATTERN!)
    user,
    setUser,
    currentLoan,
    setCurrentLoan,
    loanHistory,
    setLoanHistory,
    selectedAmount,
    setSelectedAmount,
    loading,
    setLoading,
    error,
    setError,
    isEligible,
    setIsEligible,
    theme,
    setTheme,
    notifications,
    setNotifications,
    calculateDefaultTip,
    calculateDueDate,
    checkEligibility,
    createLoan,
    fetchLoanHistory,
    apiBaseUrl,
    setApiBaseUrl,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within an AppProvider")
  return context
}
