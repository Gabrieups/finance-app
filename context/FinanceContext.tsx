"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export type PaymentMethod = "PIX" | "CARD" | "CASH" | "OTHER"
export type Category = string
export type ExpenseStatus = "PAID" | "PENDING" | "OVERDUE"

export interface CustomCategory {
  id: string
  name: string
  budget: number
  color: string 
}

export interface Expense {
  id: string
  name: string
  amount: number
  category: Category
  paymentMethod: PaymentMethod
  date: string
  dueDate?: string
  isPaid?: boolean
  isFixed: boolean
  isRecurring?: boolean // Nova propriedade para indicar se a despesa é recorrente
}

// Interface para armazenar dados históricos mensais
export interface MonthlyData {
  id: string // formato: YYYY-MM
  month: number
  year: number
  fixedExpenses: Expense[]
  variableExpenses: Expense[]
  totalSpent: number
  budget: number
}

// Adicionar novas interfaces e tipos para as configurações personalizáveis
export interface TabNames {
  home: string
  fixed: string
  variable: string
  analytics: string
  settings: string
}

export interface CategoryBudgetPercentages {
  [key: string]: number
}

interface FinanceContextType {
  monthlyBudget: number
  setMonthlyBudget: (budget: number) => void
  fixedExpenses: Expense[]
  addFixedExpense: (expense: Omit<Expense, "id">) => void
  updateFixedExpense: (expense: Expense) => void
  deleteFixedExpense: (id: string) => void
  variableExpenses: Expense[]
  addVariableExpense: (expense: Omit<Expense, "id">) => void
  updateVariableExpense: (expense: Expense) => void
  deleteVariableExpense: (id: string) => void
  isLocked: boolean
  toggleLock: () => void
  totalSpent: number
  remainingBudget: number
  expensesByCategory: Record<string, number>
  expensesByPaymentMethod: Record<PaymentMethod, number>
  syncWithFirebase: boolean
  toggleFirebaseSync: () => void
  customTabNames: TabNames
  updateTabName: (tab: keyof TabNames, name: string) => void
  resetTabNames: () => void
  categoryBudgetPercentages: CategoryBudgetPercentages
  updateCategoryPercentage: (category: Category, percentage: number) => void
  resetCategoryPercentages: () => void
  // Novas funções para gerenciar categorias personalizadas
  customCategories: CustomCategory[]
  addCategory: (category: Omit<CustomCategory, "id">) => string | null
  updateCategory: (category: CustomCategory) => void
  deleteCategory: (id: string) => void
  getCategoryBudget: (categoryId: string) => number
  getCategorySpent: (categoryId: string) => number
  getCategoryRemaining: (categoryId: string) => number
  getCategoryProgress: (categoryId: string) => number
  // Nova função para obter o status de uma despesa
  getExpenseStatus: (expense: Expense) => ExpenseStatus
  // Novas funções para gerenciar o reset mensal e histórico
  resetDay: number
  setResetDay: (day: number) => void
  monthlyHistory: MonthlyData[]
  currentMonth: string // formato: YYYY-MM
  setCurrentMonth: (month: string) => void
  navigateToMonth: (direction: "prev" | "next") => void
  // Função para verificar se já existe uma despesa similar no próximo mês
  hasSimilarExpenseNextMonth: (expense: Expense) => boolean
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}

// Categorias padrão
const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: "MONTHLY_BILLS", name: "Contas Mensais", budget: 0, color: "#FF6384" },
  { id: "GROCERIES", name: "Mercado", budget: 0, color: "#36A2EB" },
  { id: "LEISURE", name: "Lazer", budget: 0, color: "#FFCE56" },
  { id: "FUEL", name: "Gasolina", budget: 0, color: "#4BC0C0" },
  { id: "OTHER", name: "Outros", budget: 0, color: "#9966FF" },
]

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0)
  const [fixedExpenses, setFixedExpenses] = useState<Expense[]>([])
  const [variableExpenses, setVariableExpenses] = useState<Expense[]>([])
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [syncWithFirebase, setSyncWithFirebase] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [customTabNames, setCustomTabNames] = useState<TabNames>({
    home: "Dashboard",
    fixed: "Despesas Fixas",
    variable: "Despesas Variáveis",
    analytics: "Análise",
    settings: "Configurações",
  })
  const [categoryBudgetPercentages, setCategoryBudgetPercentages] = useState<CategoryBudgetPercentages>({
    MONTHLY_BILLS: 0.5,
    GROCERIES: 0.2,
    LEISURE: 0.1,
    FUEL: 0.1,
    OTHER: 0.1,
  })

  // Estado para categorias personalizadas
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(DEFAULT_CATEGORIES)

  // Novos estados para reset mensal e histórico
  const [resetDay, setResetDay] = useState<number>(1) // Dia 1 por padrão
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyData[]>([])

  // Estado para controlar o mês atual sendo visualizado
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
  )

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const budgetData = await AsyncStorage.getItem("monthlyBudget")
        const fixedData = await AsyncStorage.getItem("fixedExpenses")
        const variableData = await AsyncStorage.getItem("variableExpenses")
        const lockedData = await AsyncStorage.getItem("isLocked")
        const syncData = await AsyncStorage.getItem("syncWithFirebase")
        const customTabNamesData = await AsyncStorage.getItem("customTabNames")
        const categoryPercentagesData = await AsyncStorage.getItem("categoryBudgetPercentages")
        const customCategoriesData = await AsyncStorage.getItem("customCategories")
        const resetDayData = await AsyncStorage.getItem("resetDay")
        const monthlyHistoryData = await AsyncStorage.getItem("monthlyHistory")

        if (budgetData) setMonthlyBudget(Number.parseFloat(budgetData))
        if (fixedData) setFixedExpenses(JSON.parse(fixedData))
        if (variableData) setVariableExpenses(JSON.parse(variableData))
        if (lockedData) setIsLocked(JSON.parse(lockedData))
        if (syncData) setSyncWithFirebase(JSON.parse(syncData))
        if (customTabNamesData) setCustomTabNames(JSON.parse(customTabNamesData))
        if (categoryPercentagesData) setCategoryBudgetPercentages(JSON.parse(categoryPercentagesData))
        if (customCategoriesData) setCustomCategories(JSON.parse(customCategoriesData))
        if (resetDayData) setResetDay(Number.parseInt(resetDayData))
        if (monthlyHistoryData) setMonthlyHistory(JSON.parse(monthlyHistoryData))
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadData()
  }, [])

  // Save data to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return

    const saveData = async () => {
      try {
        await AsyncStorage.setItem("monthlyBudget", monthlyBudget.toString())
        await AsyncStorage.setItem("fixedExpenses", JSON.stringify(fixedExpenses))
        await AsyncStorage.setItem("variableExpenses", JSON.stringify(variableExpenses))
        await AsyncStorage.setItem("isLocked", JSON.stringify(isLocked))
        await AsyncStorage.setItem("syncWithFirebase", JSON.stringify(syncWithFirebase))
        await AsyncStorage.setItem("customTabNames", JSON.stringify(customTabNames))
        await AsyncStorage.setItem("categoryBudgetPercentages", JSON.stringify(categoryBudgetPercentages))
        await AsyncStorage.setItem("customCategories", JSON.stringify(customCategories))
        await AsyncStorage.setItem("resetDay", resetDay.toString())
        await AsyncStorage.setItem("monthlyHistory", JSON.stringify(monthlyHistory))
      } catch (error) {
        console.error("Error saving data to AsyncStorage:", error)
      }
    }

    saveData()
  }, [
    monthlyBudget,
    fixedExpenses,
    variableExpenses,
    isLocked,
    syncWithFirebase,
    isLoaded,
    customTabNames,
    categoryBudgetPercentages,
    customCategories,
    resetDay,
    monthlyHistory,
  ])

  // Firebase sync would be implemented here
  useEffect(() => {
    if (syncWithFirebase) {
      // Firebase sync logic would go here
      console.log("Firebase sync enabled")
    }
  }, [syncWithFirebase, fixedExpenses, variableExpenses, monthlyBudget])

  // Atualizar orçamentos de categorias quando o orçamento mensal mudar
  useEffect(() => {
    if (!isLoaded) return

    // Atualizar o orçamento de cada categoria com base nas porcentagens
    const updatedCategories = customCategories.map((category) => ({
      ...category,
      budget: monthlyBudget * (categoryBudgetPercentages[category.id] || 0),
    }))

    setCustomCategories(updatedCategories)
  }, [monthlyBudget, categoryBudgetPercentages, isLoaded])

  // Verificar se já existe uma despesa similar no próximo mês
  const hasSimilarExpenseNextMonth = (expense: Expense): boolean => {
    if (!expense.isFixed || !expense.dueDate) return false

    // Obter a data de vencimento e calcular o próximo mês
    const dueDate = new Date(expense.dueDate)
    const nextMonth = new Date(dueDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    // Formatar a data do próximo mês para comparação
    const nextMonthFormatted = nextMonth.toISOString().split("T")[0]

    // Verificar se já existe uma despesa com o mesmo nome e vencimento no próximo mês
    return fixedExpenses.some(
      (e) =>
        e.name === expense.name &&
        e.amount === expense.amount &&
        e.category === expense.category &&
        e.dueDate &&
        new Date(e.dueDate).getMonth() === nextMonth.getMonth() &&
        new Date(e.dueDate).getFullYear() === nextMonth.getFullYear(),
    )
  }

  // Verificar despesas atrasadas e criar recorrências
  useEffect(() => {
    if (!isLoaded) return

    // Verificar se há despesas fixas que precisam ser recriadas para o próximo mês
    const today = new Date()

    // Verificar despesas fixas pagas que precisam ser recriadas para o próximo mês
    const updatedFixedExpenses = [...fixedExpenses]
    let hasChanges = false

    fixedExpenses.forEach((expense) => {
      if (expense.isFixed && expense.isPaid && !expense.isRecurring) {
        // Verificar se já existe uma despesa similar no próximo mês
        if (!hasSimilarExpenseNextMonth(expense)) {
          // Criar uma nova despesa para o próximo mês
          const dueDate = new Date(expense.dueDate || today)
          const nextMonth = new Date(dueDate)
          nextMonth.setMonth(nextMonth.getMonth() + 1)

          const newExpense: Expense = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            name: expense.name,
            amount: expense.amount,
            category: expense.category,
            paymentMethod: expense.paymentMethod,
            date: today.toISOString().split("T")[0],
            dueDate: nextMonth.toISOString().split("T")[0],
            isPaid: false,
            isFixed: true,
            isRecurring: false,
          }

          // Adicionar a nova despesa
          updatedFixedExpenses.push(newExpense)
          hasChanges = true
        }

        // Marcar a despesa original como recorrente para evitar duplicações
        const index = updatedFixedExpenses.findIndex((e) => e.id === expense.id)
        if (index !== -1) {
          updatedFixedExpenses[index] = {
            ...updatedFixedExpenses[index],
            isRecurring: true,
          }
          hasChanges = true
        }
      }
    })

    if (hasChanges) {
      setFixedExpenses(updatedFixedExpenses)
    }
  }, [fixedExpenses, isLoaded])

  // Verificar despesas atrasadas e criar novas despesas
  useEffect(() => {
    if (!isLoaded) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const updatedFixedExpenses = [...fixedExpenses]
    let hasChanges = false

    fixedExpenses.forEach((expense) => {
      if (expense.isFixed && !expense.isPaid && !expense.isRecurring) {
        const dueDate = new Date(expense.dueDate || today)
        dueDate.setHours(0, 0, 0, 0)

        // Criar uma data que é um dia após o vencimento
        const oneDayAfterDueDate = new Date(dueDate)
        oneDayAfterDueDate.setDate(oneDayAfterDueDate.getDate() + 1)

        // Se a data atual é pelo menos um dia após o vencimento, criar uma nova despesa
        if (today >= oneDayAfterDueDate) {
          // Verificar se já existe uma despesa similar no próximo mês
          if (!hasSimilarExpenseNextMonth(expense)) {
            // Criar uma nova despesa para o próximo mês
            const nextMonth = new Date(dueDate)
            nextMonth.setMonth(nextMonth.getMonth() + 1)

            const newExpense: Expense = {
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              name: expense.name,
              amount: expense.amount,
              category: expense.category,
              paymentMethod: expense.paymentMethod,
              date: today.toISOString().split("T")[0],
              dueDate: nextMonth.toISOString().split("T")[0],
              isPaid: false,
              isFixed: true,
              isRecurring: false,
            }

            // Adicionar a nova despesa
            updatedFixedExpenses.push(newExpense)
            hasChanges = true
          }

          // Marcar a despesa original como recorrente para evitar duplicações
          const index = updatedFixedExpenses.findIndex((e) => e.id === expense.id)
          if (index !== -1) {
            updatedFixedExpenses[index] = {
              ...updatedFixedExpenses[index],
              isRecurring: true,
            }
            hasChanges = true
          }
        }
      }
    })

    if (hasChanges) {
      setFixedExpenses(updatedFixedExpenses)
    }
  }, [fixedExpenses, isLoaded])

  // Verificar se é dia de reset e salvar dados históricos
  useEffect(() => {
    if (!isLoaded) return

    const today = new Date()
    const currentDay = today.getDate()

    // Se for o dia de reset, salvar os dados atuais no histórico e resetar
    if (currentDay === resetDay) {
      const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`

      // Verificar se já salvamos os dados deste mês
      const alreadySaved = monthlyHistory.some((data) => data.id === currentMonthYear)

      if (!alreadySaved) {
        // Calcular o total gasto no mês
        // MODIFICAÇÃO: Não considerar despesas fixas pagas no cálculo do total gasto
        const totalMonthlySpent =
          fixedExpenses
            .filter((expense) => !expense.isPaid) // Apenas despesas não pagas
            .reduce((sum, expense) => sum + expense.amount, 0) +
          variableExpenses.reduce((sum, expense) => sum + expense.amount, 0)

        // Criar o registro histórico
        const monthData: MonthlyData = {
          id: currentMonthYear,
          month: today.getMonth() + 1,
          year: today.getFullYear(),
          fixedExpenses: [...fixedExpenses],
          variableExpenses: [...variableExpenses],
          totalSpent: totalMonthlySpent,
          budget: monthlyBudget,
        }

        // Adicionar ao histórico
        setMonthlyHistory((prev) => [...prev, monthData])

        // Resetar apenas as despesas variáveis
        // As despesas fixas continuam para o próximo mês
        setVariableExpenses([])
      }
    }
  }, [isLoaded, resetDay, fixedExpenses, variableExpenses, monthlyBudget, monthlyHistory])

  // Função para navegar entre meses
  const navigateToMonth = (direction: "prev" | "next") => {
    const [year, month] = currentMonth.split("-").map(Number)

    let newMonth: number
    let newYear: number

    if (direction === "prev") {
      newMonth = month - 1
      newYear = year
      if (newMonth < 1) {
        newMonth = 12
        newYear--
      }
    } else {
      newMonth = month + 1
      newYear = year
      if (newMonth > 12) {
        newMonth = 1
        newYear++
      }
    }

    const newMonthFormatted = `${newYear}-${String(newMonth).padStart(2, "0")}`
    console.log(`Navigating from ${currentMonth} to ${newMonthFormatted}`)
    setCurrentMonth(newMonthFormatted)
  }

  const totalSpent =
    fixedExpenses
      .filter((expense) => !expense.isPaid)
      .reduce((sum, expense) => sum + expense.amount, 0) +
    variableExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const remainingBudget = monthlyBudget - totalSpent

  const expensesByCategory = {}

  customCategories.forEach((category) => {
    expensesByCategory[category.id] = 0
  })

  const expensesByPaymentMethod = {
    PIX: 0,
    CARD: 0,
    CASH: 0,
    OTHER: 0,
  }

  ;[
    ...fixedExpenses.filter((expense) => !expense.isPaid),
    ...variableExpenses,
  ].forEach((expense) => {
    expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount
    expensesByPaymentMethod[expense.paymentMethod] += expense.amount
  })

  const getExpenseStatus = (expense: Expense): ExpenseStatus => {
    if (!expense.isFixed) return "PENDING"

    if (expense.isPaid) return "PAID"

    const today = new Date()
    const dueDate = new Date(expense.dueDate || today)

    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    const oneDayAfterDueDate = new Date(dueDate)
    oneDayAfterDueDate.setDate(oneDayAfterDueDate.getDate() + 1)

    if (today >= oneDayAfterDueDate) {
      return "OVERDUE"
    }

    return "PENDING"
  }

  const addFixedExpense = (expense: Omit<Expense, "id">) => {
    if (isLocked) return
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      isFixed: true,
      isRecurring: false,
    }
    setFixedExpenses((prev) => [...prev, newExpense])
  }

  const updateFixedExpense = (expense: Expense) => {
    if (isLocked) return

    const originalExpense = fixedExpenses.find((e) => e.id === expense.id)
    if (originalExpense && !originalExpense.isPaid && expense.isPaid) {
      if (!hasSimilarExpenseNextMonth(expense)) {
        const dueDate = new Date(expense.dueDate || new Date())
        const nextMonth = new Date(dueDate)
        nextMonth.setMonth(nextMonth.getMonth() + 1)

        const newExpense: Expense = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
          paymentMethod: expense.paymentMethod,
          date: new Date().toISOString().split("T")[0],
          dueDate: nextMonth.toISOString().split("T")[0],
          isPaid: false,
          isFixed: true,
          isRecurring: false,
        }

        setFixedExpenses((prev) => [...prev, newExpense])
      }
      expense.isRecurring = true
    }

    setFixedExpenses((prev) => prev.map((item) => (item.id === expense.id ? expense : item)))
  }

  const deleteFixedExpense = (id: string) => {
    if (isLocked) return
    setFixedExpenses((prev) => prev.filter((item) => item.id !== id))
  }

  const addVariableExpense = (expense: Omit<Expense, "id">) => {
    if (isLocked) return
    const newExpense = { ...expense, id: Date.now().toString(), isFixed: false }
    setVariableExpenses((prev) => [...prev, newExpense])
  }

  const updateVariableExpense = (expense: Expense) => {
    if (isLocked) return
    setVariableExpenses((prev) => prev.map((item) => (item.id === expense.id ? expense : item)))
  }

  const deleteVariableExpense = (id: string) => {
    if (isLocked) return
    setVariableExpenses((prev) => prev.filter((item) => item.id !== id))
  }

  const toggleLock = () => {
    setIsLocked((prev) => !prev)
  }

  const toggleFirebaseSync = () => {
    setSyncWithFirebase((prev) => !prev)
  }

  const updateTabName = (tab: keyof TabNames, name: string) => {
    setCustomTabNames((prev) => ({
      ...prev,
      [tab]: name,
    }))
  }

  const resetTabNames = () => {
    setCustomTabNames({
      home: "Dashboard",
      fixed: "Despesas Fixas",
      variable: "Despesas Variáveis",
      analytics: "Análise",
      settings: "Configurações",
    })
  }

  const updateCategoryPercentage = (category: Category, percentage: number) => {
    setCategoryBudgetPercentages((prev) => ({
      ...prev,
      [category]: percentage,
    }))
  }

  const resetCategoryPercentages = () => {
    setCategoryBudgetPercentages({
      MONTHLY_BILLS: 0.5,
      GROCERIES: 0.2,
      LEISURE: 0.1,
      FUEL: 0.1,
      OTHER: 0.1,
    })
  }

  const addCategory = (category: Omit<CustomCategory, "id">): string | null => {
    if (isLocked) return null
    const newCategory = {
      ...category,
      id: Date.now().toString(),
      budget: monthlyBudget * (categoryBudgetPercentages[category.name] || 0),
    }
    setCustomCategories((prev) => [...prev, newCategory])

    setCategoryBudgetPercentages((prev) => ({
      ...prev,
      [newCategory.id]: 0.05,
    }))

    return newCategory.id
  }

  const updateCategory = (category: CustomCategory) => {
    if (isLocked) return
    setCustomCategories((prev) => prev.map((item) => (item.id === category.id ? category : item)))
  }

  const deleteCategory = (id: string) => {
    if (isLocked) return

    const isUsed = [...fixedExpenses, ...variableExpenses].some((expense) => expense.category === id)

    if (isUsed) {
      console.error("Não é possível excluir uma categoria que está sendo usada em despesas")
      return
    }

    setCustomCategories((prev) => prev.filter((item) => item.id !== id))
    setCategoryBudgetPercentages((prev) => {
      const newPercentages = { ...prev }
      delete newPercentages[id]
      return newPercentages
    })
  }

  const getCategoryBudget = (categoryId: string): number => {
    const category = customCategories.find((cat) => cat.id === categoryId)
    return category ? category.budget : 0
  }

  const getCategorySpent = (categoryId: string): number => {
    // Filtrar despesas fixas pagas
    const fixedExpensesAmount = fixedExpenses
      .filter((expense) => !expense.isPaid && expense.category === categoryId)
      .reduce((sum, expense) => sum + expense.amount, 0)

    // Somar com despesas variáveis
    const variableExpensesAmount = variableExpenses
      .filter((expense) => expense.category === categoryId)
      .reduce((sum, expense) => sum + expense.amount, 0)

    return fixedExpensesAmount + variableExpensesAmount
  }

  const getCategoryRemaining = (categoryId: string): number => {
    const budget = getCategoryBudget(categoryId)
    const spent = getCategorySpent(categoryId)
    return budget - spent
  }

  const getCategoryProgress = (categoryId: string): number => {
    const budget = getCategoryBudget(categoryId)
    const spent = getCategorySpent(categoryId)
    return budget > 0 ? (spent / budget) * 100 : 0
  }

  const value = {
    monthlyBudget,
    setMonthlyBudget,
    fixedExpenses,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    variableExpenses,
    addVariableExpense,
    updateVariableExpense,
    deleteVariableExpense,
    isLocked,
    toggleLock,
    totalSpent,
    remainingBudget,
    expensesByCategory,
    expensesByPaymentMethod,
    syncWithFirebase,
    toggleFirebaseSync,
    customTabNames,
    updateTabName,
    resetTabNames,
    categoryBudgetPercentages,
    updateCategoryPercentage,
    resetCategoryPercentages,
    customCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryBudget,
    getCategorySpent,
    getCategoryRemaining,
    getCategoryProgress,
    getExpenseStatus,
    resetDay,
    setResetDay,
    monthlyHistory,
    currentMonth,
    setCurrentMonth,
    navigateToMonth,
    hasSimilarExpenseNextMonth,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}