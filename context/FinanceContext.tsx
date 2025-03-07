"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Define types
export type PaymentMethod = "PIX" | "CARD" | "CASH" | "OTHER"
export type Category = "MONTHLY_BILLS" | "GROCERIES" | "LEISURE" | "FUEL" | "OTHER"

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
  isFixed: boolean // Nova flag para identificar o tipo de despesa
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
  MONTHLY_BILLS: number
  GROCERIES: number
  LEISURE: number
  FUEL: number
  OTHER: number
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
  expensesByCategory: Record<Category, number>
  expensesByPaymentMethod: Record<PaymentMethod, number>
  syncWithFirebase: boolean
  toggleFirebaseSync: () => void
  isEditorMode: boolean
  toggleEditorMode: () => void
  customTabNames: TabNames
  updateTabName: (tab: keyof TabNames, name: string) => void
  resetTabNames: () => void
  categoryBudgetPercentages: CategoryBudgetPercentages
  updateCategoryPercentage: (category: Category, percentage: number) => void
  resetCategoryPercentages: () => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0)
  const [fixedExpenses, setFixedExpenses] = useState<Expense[]>([])
  const [variableExpenses, setVariableExpenses] = useState<Expense[]>([])
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [syncWithFirebase, setSyncWithFirebase] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [isEditorMode, setIsEditorMode] = useState<boolean>(false)
  const [customTabNames, setCustomTabNames] = useState<TabNames>({
    home: "Dashboard",
    fixed: "Despesas Fixas",
    variable: "Despesas Variáveis",
    analytics: "Análise",
    settings: "Configurações",
  })
  const [categoryBudgetPercentages, setCategoryBudgetPercentages] = useState<CategoryBudgetPercentages>({
    MONTHLY_BILLS: 0.5, // 50% for monthly bills
    GROCERIES: 0.2, // 20% for groceries
    LEISURE: 0.1, // 10% for leisure
    FUEL: 0.1, // 10% for fuel
    OTHER: 0.1, // 10% for other
  })

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const budgetData = await AsyncStorage.getItem("monthlyBudget")
        const fixedData = await AsyncStorage.getItem("fixedExpenses")
        const variableData = await AsyncStorage.getItem("variableExpenses")
        const lockedData = await AsyncStorage.getItem("isLocked")
        const syncData = await AsyncStorage.getItem("syncWithFirebase")
        const editorModeData = await AsyncStorage.getItem("isEditorMode")
        const customTabNamesData = await AsyncStorage.getItem("customTabNames")
        const categoryPercentagesData = await AsyncStorage.getItem("categoryBudgetPercentages")

        if (budgetData) setMonthlyBudget(Number.parseFloat(budgetData))
        if (fixedData) setFixedExpenses(JSON.parse(fixedData))
        if (variableData) setVariableExpenses(JSON.parse(variableData))
        if (lockedData) setIsLocked(JSON.parse(lockedData))
        if (syncData) setSyncWithFirebase(JSON.parse(syncData))
        if (editorModeData) setIsEditorMode(JSON.parse(editorModeData))
        if (customTabNamesData) setCustomTabNames(JSON.parse(customTabNamesData))
        if (categoryPercentagesData) setCategoryBudgetPercentages(JSON.parse(categoryPercentagesData))
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
        await AsyncStorage.setItem("isEditorMode", JSON.stringify(isEditorMode))
        await AsyncStorage.setItem("customTabNames", JSON.stringify(customTabNames))
        await AsyncStorage.setItem("categoryBudgetPercentages", JSON.stringify(categoryBudgetPercentages))
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
    isEditorMode,
    customTabNames,
    categoryBudgetPercentages,
  ])

  // Firebase sync would be implemented here
  useEffect(() => {
    if (syncWithFirebase) {
      // Firebase sync logic would go here
      console.log("Firebase sync enabled")
    }
  }, [syncWithFirebase, fixedExpenses, variableExpenses, monthlyBudget])

  // Calculate total spent
  const totalSpent =
    fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0) +
    variableExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate remaining budget
  const remainingBudget = monthlyBudget - totalSpent

  // Calculate expenses by category
  const expensesByCategory = {
    MONTHLY_BILLS: 0,
    GROCERIES: 0,
    LEISURE: 0,
    FUEL: 0,
    OTHER: 0,
  }

  // Calculate expenses by payment method
  const expensesByPaymentMethod = {
    PIX: 0,
    CARD: 0,
    CASH: 0,
    OTHER: 0,
  }

  // Populate category and payment method totals
  ;[...fixedExpenses, ...variableExpenses].forEach((expense) => {
    expensesByCategory[expense.category] += expense.amount
    expensesByPaymentMethod[expense.paymentMethod] += expense.amount
  })

  // No método addFixedExpense, adicionar a flag isFixed como true
  const addFixedExpense = (expense: Omit<Expense, "id">) => {
    if (isLocked) return
    const newExpense = { ...expense, id: Date.now().toString(), isFixed: true }
    setFixedExpenses((prev) => [...prev, newExpense])
  }

  // Update fixed expense
  const updateFixedExpense = (expense: Expense) => {
    if (isLocked) return
    setFixedExpenses((prev) => prev.map((item) => (item.id === expense.id ? expense : item)))
  }

  // Delete fixed expense
  const deleteFixedExpense = (id: string) => {
    if (isLocked) return
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

  const toggleEditorMode = () => {
    setIsEditorMode((prev) => !prev)
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
    isEditorMode,
    toggleEditorMode,
    customTabNames,
    updateTabName,
    resetTabNames,
    categoryBudgetPercentages,
    updateCategoryPercentage,
    resetCategoryPercentages,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

