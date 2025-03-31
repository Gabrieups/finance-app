"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Define types
export type PaymentMethod = "PIX" | "CARD" | "CASH" | "OTHER" | string
export type Category = string // Alterado para string para permitir categorias personalizadas

// Interface para representar uma categoria personalizada
export interface CustomCategory {
  id: string
  name: string
  budget: number // Orçamento alocado para esta categoria em valor monetário
  color: string // Cor para representação visual
  icon: string // Nome do ícone do Ionicons
}

// Logo após a definição da interface CustomCategory, adicionar a interface para métodos de pagamento personalizados
export interface CustomPaymentMethod {
  id: string
  name: string
  icon: string
  color: string
}

export type ExpenseStatus = "PAID" | "PENDING" | "OVERDUE"

// Atualizar a interface Expense para incluir a flag isFixed
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

// Nova interface para armazenar o status de pagamento de despesas fixas por mês
export interface MonthlyPaymentStatus {
  expenseId: string
  monthYear: string // formato: YYYY-MM
  isPaid: boolean
}

// Adicionar novas interfaces e tipos para as configurações personalizáveis
export interface TabNames {
  home: string
  fixed: string
  variable: string
  analytics: string
  settings: string
}

// Adicionar interface para as seções da tela Home
export interface HomeSection {
  id: string
  title: string
  type: "budget" | "fixedExpenses" | "categories" | "recentExpenses"
  visible: boolean
  order: number
}

interface FinanceContextType {
  monthlyBudget: number
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
  // Função para verificar se uma data está em um mês específico
  isDateInMonth: (dateString: string, monthYear: string) => boolean
  getFixedExpensesForMonth: (monthYear: string) => Expense[]
  // Novas funções para gerenciar o status de pagamento por mês
  getExpensePaymentStatus: (expenseId: string, monthYear: string) => boolean
  setExpensePaymentStatus: (expenseId: string, monthYear: string, isPaid: boolean) => void
  homeSections: HomeSection[]
  updateHomeSectionOrder: (sections: HomeSection[]) => void
  toggleHomeSectionVisibility: (sectionId: string) => void

  // Adicionar métodos de pagamento customizados
  customPaymentMethods: CustomPaymentMethod[]
  addPaymentMethod: (method: Omit<CustomPaymentMethod, "id">) => string | null
  updatePaymentMethod: (method: CustomPaymentMethod) => void
  deletePaymentMethod: (id: string) => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}

// Categorias padrão com orçamentos em valores monetários
const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: "MONTHLY_BILLS", name: "Contas Mensais", budget: 1000, color: "#FF6384", icon: "calendar" },
  { id: "GROCERIES", name: "Mercado", budget: 500, color: "#36A2EB", icon: "cart" },
  { id: "LEISURE", name: "Lazer", budget: 300, color: "#FFCE56", icon: "game-controller" },
  { id: "FUEL", name: "Gasolina", budget: 200, color: "#4BC0C0", icon: "car" },
  { id: "OTHER", name: "Outros", budget: 200, color: "#9966FF", icon: "apps" },
]

// Nos valores DEFAULT, adicionar os métodos de pagamento padrão
// Logo após DEFAULT_CATEGORIES, adicionar:
const DEFAULT_PAYMENT_METHODS: CustomPaymentMethod[] = [
  { id: "PIX", name: "PIX", icon: "flash", color: "#4BC0C0" },
  { id: "CARD", name: "Cartão", icon: "card", color: "#FF6384" },
  { id: "CASH", name: "Dinheiro", icon: "cash", color: "#FFCE56" },
  { id: "OTHER", name: "Outro", icon: "ellipsis-horizontal", color: "#9966FF" },
]

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Estado para categorias personalizadas
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(DEFAULT_CATEGORIES)

  // No FinanceProvider, adicionar o estado para os métodos de pagamento personalizados
  // Após a linha const [customCategories, setCustomCategories] = useState<CustomCategory[]>(DEFAULT_CATEGORIES)
  const [customPaymentMethods, setCustomPaymentMethods] = useState<CustomPaymentMethod[]>(DEFAULT_PAYMENT_METHODS)

  // Novos estados para reset mensal e histórico
  const [resetDay, setResetDay] = useState<number>(1) // Dia 1 por padrão
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyData[]>([])

  // Novo estado para armazenar o status de pagamento por mês
  const [monthlyPaymentStatus, setMonthlyPaymentStatus] = useState<MonthlyPaymentStatus[]>([])

  // Estado para controlar o mês atual sendo visualizado
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
  )

  // Adicionar estado para as seções da tela Home
  const [homeSections, setHomeSections] = useState<HomeSection[]>([
    { id: "budget", title: "Orçamento Mensal", type: "budget", visible: true, order: 0 },
    { id: "fixedExpenses", title: "Despesas Fixas", type: "fixedExpenses", visible: true, order: 1 },
    { id: "categories", title: "Progressos", type: "categories", visible: true, order: 2 },
    { id: "recentExpenses", title: "Despesas Recentes", type: "recentExpenses", visible: true, order: 3 },
  ])

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const fixedData = await AsyncStorage.getItem("fixedExpenses")
        const variableData = await AsyncStorage.getItem("variableExpenses")
        const lockedData = await AsyncStorage.getItem("isLocked")
        const syncData = await AsyncStorage.getItem("syncWithFirebase")
        const customTabNamesData = await AsyncStorage.getItem("customTabNames")
        const customCategoriesData = await AsyncStorage.getItem("customCategories")
        const resetDayData = await AsyncStorage.getItem("resetDay")
        const monthlyHistoryData = await AsyncStorage.getItem("monthlyHistory")
        const monthlyPaymentStatusData = await AsyncStorage.getItem("monthlyPaymentStatus")
        const homeSectionsData = await AsyncStorage.getItem("homeSections")

        // No useEffect que carrega dados do AsyncStorage, adicionar o carregamento dos métodos de pagamento
        // Dentro do bloco try do loadData
        const customPaymentMethodsData = await AsyncStorage.getItem("customPaymentMethods")

        if (fixedData) setFixedExpenses(JSON.parse(fixedData))
        if (variableData) setVariableExpenses(JSON.parse(variableData))
        if (lockedData) setIsLocked(JSON.parse(lockedData))
        if (syncData) setSyncWithFirebase(JSON.parse(syncData))
        if (customTabNamesData) setCustomTabNames(JSON.parse(customTabNamesData))
        if (customCategoriesData) setCustomCategories(JSON.parse(customCategoriesData))
        if (customPaymentMethodsData) setCustomPaymentMethods(JSON.parse(customPaymentMethodsData))
        if (resetDayData) setResetDay(Number.parseInt(resetDayData))
        if (monthlyHistoryData) setMonthlyHistory(JSON.parse(monthlyHistoryData))
        if (monthlyPaymentStatusData) setMonthlyPaymentStatus(JSON.parse(monthlyPaymentStatusData))
        if (homeSectionsData) setHomeSections(JSON.parse(homeSectionsData))
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
        await AsyncStorage.setItem("fixedExpenses", JSON.stringify(fixedExpenses))
        await AsyncStorage.setItem("variableExpenses", JSON.stringify(variableExpenses))
        await AsyncStorage.setItem("isLocked", JSON.stringify(isLocked))
        await AsyncStorage.setItem("syncWithFirebase", JSON.stringify(syncWithFirebase))
        await AsyncStorage.setItem("customTabNames", JSON.stringify(customTabNames))
        await AsyncStorage.setItem("customCategories", JSON.stringify(customCategories))
        await AsyncStorage.setItem("resetDay", resetDay.toString())
        await AsyncStorage.setItem("monthlyHistory", JSON.stringify(monthlyHistory))
        await AsyncStorage.setItem("monthlyPaymentStatus", JSON.stringify(monthlyPaymentStatus))

        // No useEffect que salva dados no AsyncStorage, adicionar a persistência dos métodos de pagamento
        // Dentro do bloco try do saveData
        await AsyncStorage.setItem("customPaymentMethods", JSON.stringify(customPaymentMethods))
      } catch (error) {
        console.error("Error saving data to AsyncStorage:", error)
      }
    }

    saveData()
  }, [
    fixedExpenses,
    variableExpenses,
    isLocked,
    syncWithFirebase,
    isLoaded,
    customTabNames,
    customCategories,
    // Atualizar a dependência do useEffect para incluir customPaymentMethods
    // No array de dependências:
    customPaymentMethods,
    resetDay,
    monthlyHistory,
    monthlyPaymentStatus,
  ])

  // Firebase sync would be implemented here
  useEffect(() => {
    if (syncWithFirebase) {
      // Firebase sync logic would go here
      console.log("Firebase sync enabled")
    }
  }, [syncWithFirebase, fixedExpenses, variableExpenses, customCategories, monthlyPaymentStatus])

  // Função para verificar se uma data está em um mês específico
  const isDateInMonth = (dateString: string, monthYear: string): boolean => {
    if (!dateString || !monthYear) return false

    const date = new Date(dateString)
    const [year, month] = monthYear.split("-").map(Number)

    return date.getMonth() + 1 === month && date.getFullYear() === year
  }

  // Função para obter o status de pagamento de uma despesa em um mês específico
  const getExpensePaymentStatus = (expenseId: string, monthYear: string): boolean => {
    // Primeiro, verificar se temos um status específico para este mês
    const statusEntry = monthlyPaymentStatus.find(
      (entry) => entry.expenseId === expenseId && entry.monthYear === monthYear,
    )

    if (statusEntry) {
      return statusEntry.isPaid
    }

    // Se não encontrarmos um status específico para este mês, verificamos o status original da despesa
    // mas apenas para o mês em que a despesa foi criada
    const expense = fixedExpenses.find((exp) => exp.id === expenseId)
    if (expense && expense.dueDate && isDateInMonth(expense.dueDate, monthYear)) {
      return expense.isPaid || false
    }

    // Para outros meses, o padrão é não pago
    return false
  }

  // Função para definir o status de pagamento de uma despesa em um mês específico
  const setExpensePaymentStatus = (expenseId: string, monthYear: string, isPaid: boolean): void => {
    // Verificar se já existe uma entrada para esta despesa e mês
    const existingEntryIndex = monthlyPaymentStatus.findIndex(
      (entry) => entry.expenseId === expenseId && entry.monthYear === monthYear,
    )

    if (existingEntryIndex >= 0) {
      // Atualizar a entrada existente
      setMonthlyPaymentStatus((prev) => {
        const updated = [...prev]
        updated[existingEntryIndex] = { ...updated[existingEntryIndex], isPaid }
        return updated
      })
    } else {
      // Criar uma nova entrada
      setMonthlyPaymentStatus((prev) => [...prev, { expenseId, monthYear, isPaid }])
    }
  }

  // Add this function after the isDateInMonth function
  const getFixedExpensesForMonth = (monthYear: string): Expense[] => {
    // Parse the target month and year
    const [targetYear, targetMonth] = monthYear.split("-").map(Number)
    const targetDate = new Date(targetYear, targetMonth - 1, 1)

    // Filter fixed expenses that should appear in this month
    return fixedExpenses
      .filter((expense) => {
        if (!expense.dueDate) return false

        // Parse the original due date
        const originalDate = new Date(expense.dueDate)
        const originalYear = originalDate.getFullYear()
        const originalMonth = originalDate.getMonth() + 1
        const originalDay = originalDate.getDate()

        // Create a date object for the expense creation month
        const expenseCreationMonth = `${originalYear}-${String(originalMonth).padStart(2, "0")}`

        // Don't show expenses in months before they were created
        const expenseDate = new Date(originalYear, originalMonth - 1, 1)
        if (targetDate < expenseDate) return false

        return true
      })
      .map((expense) => {
        // If we're looking at the original month, return the expense as is
        if (isDateInMonth(expense.dueDate, monthYear)) {
          return {
            ...expense,
            // Use the payment status from the original expense for its creation month
            isPaid: expense.isPaid,
          }
        }

        // Otherwise, create a new version with updated due date for the target month
        const originalDate = new Date(expense.dueDate)
        const originalDay = originalDate.getDate()

        // Create a new due date for the target month
        const [year, month] = monthYear.split("-").map(Number)

        // Handle month with fewer days (e.g., if original is 31st but target month only has 30 days)
        const lastDayOfMonth = new Date(year, month, 0).getDate()
        const adjustedDay = Math.min(originalDay, lastDayOfMonth)

        const newDueDate = `${year}-${String(month).padStart(2, "0")}-${String(adjustedDay).padStart(2, "0")}`

        // Get the payment status for this specific month
        const isPaid = getExpensePaymentStatus(expense.id, monthYear)

        // Return a modified version of the expense with the new due date
        // We don't modify the original expense, just create a derived version for display
        return {
          ...expense,
          dueDate: newDueDate,
          isPaid,
          // Keep the id the same but add a suffix to make it unique for this month
          id: `${expense.id}_${monthYear}`,
        }
      })
  }

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
        const fixedExpensesForMonth = getFixedExpensesForMonth(currentMonthYear)
        const totalMonthlySpent =
          fixedExpensesForMonth.filter((expense) => expense.isPaid).reduce((sum, expense) => sum + expense.amount, 0) +
          variableExpenses
            .filter((expense) => expense.date && isDateInMonth(expense.date, currentMonthYear))
            .reduce((sum, expense) => sum + expense.amount, 0)

        // Calcular o orçamento total como a soma dos orçamentos das categorias
        const totalBudget = customCategories.reduce((sum, category) => sum + category.budget, 0)

        // Criar o registro histórico
        const monthData: MonthlyData = {
          id: currentMonthYear,
          month: today.getMonth() + 1,
          year: today.getFullYear(),
          fixedExpenses: fixedExpensesForMonth,
          variableExpenses: [...variableExpenses],
          totalSpent: totalMonthlySpent,
          budget: totalBudget,
        }

        // Adicionar ao histórico
        setMonthlyHistory((prev) => [...prev, monthData])

        // Resetar apenas as despesas variáveis
        // As despesas fixas continuam para o próximo mês
        setVariableExpenses([])
      }
    }
  }, [isLoaded, resetDay, fixedExpenses, variableExpenses, customCategories, monthlyHistory])

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

  // Calcular o orçamento mensal como a soma dos orçamentos das categorias
  const monthlyBudget = customCategories.reduce((sum, category) => sum + category.budget, 0)

  // Calculate total spent for the current viewing month
  const totalSpent = (() => {
    // Get fixed expenses for the current month
    const fixedExpensesForMonth = getFixedExpensesForMonth(currentMonth)

    // Calculate total for fixed expenses that are paid
    const fixedExpensesAmount = fixedExpensesForMonth
      .filter((expense) => expense.isPaid)
      .reduce((sum, expense) => sum + expense.amount, 0)

    // Calculate total for variable expenses in the current month
    const variableExpensesAmount = variableExpenses
      .filter((expense) => expense.date && isDateInMonth(expense.date, currentMonth))
      .reduce((sum, expense) => sum + expense.amount, 0)

    return fixedExpensesAmount + variableExpensesAmount
  })()

  // Calculate remaining budget
  const remainingBudget = monthlyBudget - totalSpent

  // Calculate expenses by category for the current viewing month
  const expensesByCategory = {}

  // Inicializar todas as categorias com zero
  customCategories.forEach((category) => {
    expensesByCategory[category.id] = 0
  })

  // Calculate expenses by payment method for the current viewing month
  const expensesByPaymentMethod = {
    PIX: 0,
    CARD: 0,
    CASH: 0,
    OTHER: 0,
  }

  // Populate category and payment method totals for the current viewing month
  ;(() => {
    // Get fixed expenses for the current month
    const fixedExpensesForMonth = getFixedExpensesForMonth(currentMonth)

    // Process fixed expenses that are paid
    fixedExpensesForMonth
      .filter((expense) => expense.isPaid)
      .forEach((expense) => {
        expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount
        expensesByPaymentMethod[expense.paymentMethod] += expense.amount
      })

    // Process variable expenses for the current month
    variableExpenses
      .filter((expense) => expense.date && isDateInMonth(expense.date, currentMonth))
      .forEach((expense) => {
        expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount
        expensesByPaymentMethod[expense.paymentMethod] += expense.amount
      })
  })()

  // Função para determinar o status de uma despesa
  const getExpenseStatus = (expense: Expense): ExpenseStatus => {
    if (!expense.isFixed) return "PENDING" // Despesas variáveis não têm status

    if (expense.isPaid) return "PAID"

    // Verificar se a data de vencimento já passou há mais de um dia
    const today = new Date()
    const dueDate = new Date(expense.dueDate || today)

    // Remover a parte de hora para comparar apenas as datas
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    // Criar uma data que é um dia após o vencimento
    const oneDayAfterDueDate = new Date(dueDate)
    oneDayAfterDueDate.setDate(oneDayAfterDueDate.getDate() + 1)

    if (today >= oneDayAfterDueDate) {
      return "OVERDUE"
    }

    return "PENDING"
  }

  // No método addFixedExpense, adicionar a flag isFixed como true
  const addFixedExpense = (expense: Omit<Expense, "id">) => {
    if (isLocked) return
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      isFixed: true,
    }
    setFixedExpenses((prev) => [...prev, newExpense])
  }

  const getCategorySpent = (categoryId: string): number => {
    // Get fixed expenses for the current month
    const fixedExpensesForMonth = getFixedExpensesForMonth(currentMonth)

    // Filter fixed expenses that are paid with category matching
    const fixedExpensesAmount = fixedExpensesForMonth
      .filter((expense) => expense.isPaid && expense.category === categoryId)
      .reduce((sum, expense) => sum + expense.amount, 0)

    // Sum with variable expenses in the current viewing month
    const variableExpensesAmount = variableExpenses
      .filter((expense) => expense.category === categoryId && expense.date && isDateInMonth(expense.date, currentMonth))
      .reduce((sum, expense) => sum + expense.amount, 0)

    return fixedExpensesAmount + variableExpensesAmount
  }

  // Update fixed expense - removed the code that creates new expenses
  const updateFixedExpense = (expense: Expense) => {
    if (isLocked) return
    setFixedExpenses((prev) => prev.map((item) => (item.id === expense.id ? expense : item)))
  }

  // Delete fixed expense
  const deleteFixedExpense = (id: string) => {
    if (isLocked) return

    // Also delete any monthly payment status entries for this expense
    setMonthlyPaymentStatus((prev) => prev.filter((entry) => entry.expenseId !== id))

    setFixedExpenses((prev) => prev.filter((item) => item.id !== id))
  }

  // No método addVariableExpense, adicionar a flag isFixed como false
  const addVariableExpense = (expense: Omit<Expense, "id">) => {
    if (isLocked) return
    const newExpense = { ...expense, id: Date.now().toString(), isFixed: false }
    setVariableExpenses((prev) => [...prev, newExpense])
  }

  // Update variable expense
  const updateVariableExpense = (expense: Expense) => {
    if (isLocked) return
    setVariableExpenses((prev) => prev.map((item) => (item.id === expense.id ? expense : item)))
  }

  // Delete variable expense
  const deleteVariableExpense = (id: string) => {
    if (isLocked) return
    setVariableExpenses((prev) => prev.filter((item) => item.id !== id))
  }

  // Toggle lock
  const toggleLock = () => {
    setIsLocked((prev) => !prev)
  }

  // Toggle Firebase sync
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

  // Funções para gerenciar categorias personalizadas
  const addCategory = (category: Omit<CustomCategory, "id">): string | null => {
    if (isLocked) return null
    const newCategory = {
      ...category,
      id: Date.now().toString(),
    }
    setCustomCategories((prev) => [...prev, newCategory])
    return newCategory.id
  }

  const updateCategory = (category: CustomCategory) => {
    if (isLocked) return
    setCustomCategories((prev) => prev.map((item) => (item.id === category.id ? category : item)))
  }

  const deleteCategory = (id: string) => {
    if (isLocked) return

    // Verificar se a categoria está sendo usada em alguma despesa
    const isUsed = [...fixedExpenses, ...variableExpenses].some((expense) => expense.category === id)

    if (isUsed) {
      console.error("Não é possível excluir uma categoria que está sendo usada em despesas")
      return
    }

    setCustomCategories((prev) => prev.filter((item) => item.id !== id))
  }

  // Funções para cálculos de orçamento por categoria
  const getCategoryBudget = (categoryId: string): number => {
    const category = customCategories.find((cat) => cat.id === categoryId)
    return category ? category.budget : 0
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

  // Adicionar funções para gerenciar as seções da tela Home
  const updateHomeSectionOrder = (sections: HomeSection[]) => {
    setHomeSections(sections)
    AsyncStorage.setItem("homeSections", JSON.stringify(sections)).catch((err) =>
      console.error("Error saving home sections:", err),
    )
  }

  const toggleHomeSectionVisibility = (sectionId: string) => {
    setHomeSections((prev) => {
      const updated = prev.map((section) =>
        section.id === sectionId ? { ...section, visible: !section.visible } : section,
      )
      AsyncStorage.setItem("homeSections", JSON.stringify(updated)).catch((err) =>
        console.error("Error saving home sections:", err),
      )
      return updated
    })
  }

  // Adicionar as funções para gerenciar os métodos de pagamento
  // Após as funções de gerenciamento de categorias, adicionar:

  // Funções para gerenciar métodos de pagamento personalizados
  const addPaymentMethod = (method: Omit<CustomPaymentMethod, "id">): string | null => {
    if (isLocked) return null
    const newMethod = {
      ...method,
      id: Date.now().toString(),
    }
    setCustomPaymentMethods((prev) => [...prev, newMethod])
    return newMethod.id
  }

  const updatePaymentMethod = (method: CustomPaymentMethod) => {
    if (isLocked) return
    setCustomPaymentMethods((prev) => prev.map((item) => (item.id === method.id ? method : item)))
  }

  const deletePaymentMethod = (id: string) => {
    if (isLocked) return

    // Verificar se o método de pagamento está sendo usado em alguma despesa
    const isUsed = [...fixedExpenses, ...variableExpenses].some((expense) => expense.paymentMethod === id)

    if (isUsed) {
      console.error("Não é possível excluir um método de pagamento que está sendo usado em despesas")
      return
    }

    setCustomPaymentMethods((prev) => prev.filter((item) => item.id !== id))
  }

  const value = {
    monthlyBudget,
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
    isDateInMonth,
    getFixedExpensesForMonth,
    getExpensePaymentStatus,
    setExpensePaymentStatus,
    homeSections,
    updateHomeSectionOrder,
    toggleHomeSectionVisibility,
    // No objeto value do provider, adicionar os novos métodos
    customPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}