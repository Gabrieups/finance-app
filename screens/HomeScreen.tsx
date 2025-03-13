"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useFinance, type Expense } from "../context/FinanceContext"
import BudgetProgressBar from "../components/BudgetProgressBar"
import ExpenseItem from "../components/ExpenseItem"
import MonthNavigator from "../components/MonthNavigator"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const HomeScreen: React.FC = () => {
  const { colors } = useTheme()
  const {
    monthlyBudget,
    totalSpent,
    remainingBudget,
    fixedExpenses,
    variableExpenses,
    isLocked,
    updateFixedExpense,
    customCategories,
    getCategoryBudget,
    getCategorySpent,
    getCategoryRemaining,
    getCategoryProgress,
    getExpenseStatus,
    monthlyHistory,
    currentMonth,
    isDateInMonth,
    getFixedExpensesForMonth,
    setExpensePaymentStatus,
  } = useFinance()
  const navigation = useNavigation()

  // Estado para controlar o filtro de despesas fixas (pagas/não pagas/atrasadas)
  const [fixedExpensesFilter, setFixedExpensesFilter] = useState<"PENDING" | "PAID" | "OVERDUE">("PENDING")

  // Estado para armazenar os dados do mês atual ou histórico
  const [displayData, setDisplayData] = useState<{
    fixedExpenses: Expense[]
    variableExpenses: Expense[]
    totalSpent: number
    budget: number
  }>({
    fixedExpenses: [],
    variableExpenses: [],
    totalSpent: 0,
    budget: 0,
  })

  // Atualizar os dados exibidos quando o mês atual mudar
  useEffect(() => {
    // Verificar se estamos visualizando o mês atual
    const today = new Date()
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`

    console.log("HomeScreen - Current Month:", currentMonth)
    console.log("HomeScreen - Current Month Key:", currentMonthKey)
    console.log(
      "HomeScreen - Monthly History:",
      monthlyHistory.map((h) => h.id),
    )

    if (currentMonth === currentMonthKey) {
      // For current month, use the actual fixed expenses and calculate totals
      const fixedExpensesForCurrentMonth = getFixedExpensesForMonth(currentMonth)

      setDisplayData({
        fixedExpenses: fixedExpensesForCurrentMonth,
        variableExpenses,
        totalSpent,
        budget: monthlyBudget,
      })
      console.log("HomeScreen - Using current data")
    } else {
      // Buscar dados históricos
      const historicalData = monthlyHistory.find((data) => data.id === currentMonth)

      if (historicalData) {
        setDisplayData({
          fixedExpenses: historicalData.fixedExpenses,
          variableExpenses: historicalData.variableExpenses,
          totalSpent: historicalData.totalSpent,
          budget: historicalData.budget,
        })
        console.log("HomeScreen - Using historical data:", historicalData.id)
      } else {
        // If no historical data, generate fixed expenses for this month
        const fixedExpensesForMonth = getFixedExpensesForMonth(currentMonth)

        // For future months, we only have fixed expenses
        const variableExpensesForMonth = isFutureMonth()
          ? []
          : variableExpenses.filter((expense) => expense.date && isDateInMonth(expense.date, currentMonth))

        // Calculate total spent for this month
        const fixedExpenseTotal = fixedExpensesForMonth
          .filter((expense) => expense.isPaid)
          .reduce((sum, expense) => sum + expense.amount, 0)

        const variableExpenseTotal = variableExpensesForMonth.reduce((sum, expense) => sum + expense.amount, 0)

        setDisplayData({
          fixedExpenses: fixedExpensesForMonth,
          variableExpenses: variableExpensesForMonth,
          totalSpent: fixedExpenseTotal + variableExpenseTotal,
          budget: monthlyBudget,
        })
        console.log("HomeScreen - Generated data for month:", currentMonth)
      }
    }
  }, [
    currentMonth,
    fixedExpenses,
    variableExpenses,
    totalSpent,
    monthlyBudget,
    monthlyHistory,
    getFixedExpensesForMonth,
  ])

  // Filtrar despesas fixas com base no status e no mês atual
  const filteredFixedExpenses = displayData.fixedExpenses.filter((expense) => {
    const status = getExpenseStatus(expense)
    // Only show fixed expenses for the current viewing month
    const isInCurrentMonth = expense.dueDate && isDateInMonth(expense.dueDate, currentMonth)
    return status === fixedExpensesFilter && isInCurrentMonth
  })

  // Ordenar por data de vencimento
  const sortedFixedExpenses = [...filteredFixedExpenses].sort((a, b) => {
    const dateA = new Date(a.dueDate || "")
    const dateB = new Date(b.dueDate || "")
    return dateA.getTime() - dateB.getTime()
  })

  // Pegar as 5 despesas variáveis mais recentes
  const recentVariableExpenses = [...displayData.variableExpenses]
    .filter((expense) => expense.date && isDateInMonth(expense.date, currentMonth))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Pegar as 3 categorias mais utilizadas
  const topCategories = [...customCategories]
    .sort((a, b) => {
      const spentA = getCategorySpent(a.id)
      const spentB = getCategorySpent(b.id)
      return spentB - spentA
    })
    .slice(0, 3)

  const handleTogglePaid = (expense) => {
    if (isLocked) return

    // If this is a recurring expense (has an underscore in the ID)
    if (expense.id.includes("_")) {
      // Extract the original ID
      const originalId = expense.id.split("_")[0]

      // Update the payment status for this specific month
      setExpensePaymentStatus(originalId, currentMonth, !expense.isPaid)
    } else {
      // For the original month, update the expense directly
      const updatedExpense = {
        ...expense,
        isPaid: !expense.isPaid,
      }
      updateFixedExpense(updatedExpense)
    }
  }

  const navigateToExpenses = () => {
    navigation.navigate("Expenses")
  }

  // Atualizar a função navigateToCategories no HomeScreen
  const navigateToCategories = () => {
    navigation.navigate("Settings", { screen: "Categories" })
  }

  // Verificar se estamos visualizando o mês atual
  const today = new Date()
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  const isViewingCurrentMonth = currentMonth === currentMonthKey

  // Check if the month is in the future
  const isFutureMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number)
    const currentDate = new Date()
    const viewingDate = new Date(year, month - 1, 1)
    return viewingDate > currentDate
  }

  // No componente HomeScreen, adicionar uma verificação para meses sem dados
  const noDataForMonth =
    !isViewingCurrentMonth && displayData.fixedExpenses.length === 0 && displayData.variableExpenses.length === 0

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text + "99",
    },

    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
    },
    budgetContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    budgetLabel: {
      fontSize: 16,
      color: colors.text,
    },
    budgetValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    remainingValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: displayData.budget - displayData.totalSpent >= 0 ? colors.success : colors.danger,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    categoryItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryName: {
      fontSize: 16,
      color: colors.text,
    },
    categoryAmount: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    recentExpensesCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    recentExpenseItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    expenseName: {
      fontSize: 16,
      color: colors.text,
    },
    expenseAmount: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.danger,
    },
    noExpensesText: {
      fontSize: 16,
      color: colors.text + "99",
      textAlign: "center",
      marginVertical: 16,
    },
    lockStatus: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    lockStatusText: {
      fontSize: 14,
      color: isLocked ? colors.warning : colors.success,
      marginLeft: 4,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    sectionHeaderFixed: {
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      marginLeft: 4,
      marginBottom: 4,
    },
    filterButtonsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    filterButtonActive: {
      backgroundColor: colors.primary + "20",
    },
    filterText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 4,
    },
    filterTextActive: {
      color: colors.primary,
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      alignSelf: "center",
    },
    viewAllText: {
      color: colors.primary,
      fontSize: 14,
      marginRight: 4,
    },
    categoryProgressContainer: {
      marginBottom: 12,
    },
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    categoryTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    categoryBudgetInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    categoryBudgetText: {
      fontSize: 14,
      color: colors.text + "99",
    },
    categoryColorIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    historicalDataBanner: {
      backgroundColor: colors.warning + "30",
      padding: 8,
      borderRadius: 8,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    historicalDataText: {
      color: colors.warning,
      marginLeft: 8,
      flex: 1,
    },
    noDataBanner: {
      backgroundColor: colors.warning + "20",
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    noDataText: {
      color: colors.warning,
      marginLeft: 8,
      flex: 1,
      fontWeight: "500",
    },
    futureMonthBanner: {
      backgroundColor: colors.warning + "20",
      padding: 8,
      borderRadius: 8,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    futureMonthText: {
      color: colors.warning,
      marginLeft: 8,
      flex: 1,
    },
  })

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        {/* Navegador de meses */}
        <MonthNavigator />

        {noDataForMonth && (
          <View style={styles.noDataBanner}>
            <Ionicons name="information-circle" size={20} color={colors.warning} />
            <Text style={styles.noDataText}>Não há dados disponíveis para este mês.</Text>
          </View>
        )}

        {/* Banner for historical data */}
        {!isViewingCurrentMonth && !isFutureMonth() && (
          <View style={styles.historicalDataBanner}>
            <Ionicons name="information-circle" size={20} color={colors.warning} />
            <Text style={styles.historicalDataText}>
              Você está visualizando dados históricos. Algumas ações estão desabilitadas.
            </Text>
          </View>
        )}

        {/* Banner for future months */}
        {isFutureMonth() && (
          <View style={styles.futureMonthBanner}>
            <Ionicons name="calendar" size={20} color={colors.warning} />
            <Text style={styles.futureMonthText}>
              Você está visualizando um mês futuro. Adicione despesas fixas com antecedência.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Orçamento Mensal</Text>

          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Orçamento Total:</Text>
            <Text style={styles.budgetValue}>R$ {displayData.budget.toFixed(2)}</Text>
          </View>

          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Gasto Total:</Text>
            <Text style={styles.budgetValue}>R$ {displayData.totalSpent.toFixed(2)}</Text>
          </View>

          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Saldo Restante:</Text>
            <Text style={styles.remainingValue}>R$ {(displayData.budget - displayData.totalSpent).toFixed(2)}</Text>
          </View>

          <BudgetProgressBar
            current={displayData.totalSpent}
            total={displayData.budget}
            label="Progresso do Orçamento"
          />
        </View>

        {/* Seção de Categorias Principais */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorias Principais</Text>
          <TouchableOpacity style={styles.filterButton} onPress={navigateToCategories}>
            <Ionicons name="options" size={16} color={colors.text} />
            <Text style={styles.filterText}>Gerenciar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {topCategories.length > 0 ? (
            <>
              {topCategories.map((category) => {
                const budget = getCategoryBudget(category.id)
                const spent = getCategorySpent(category.id)
                const remaining = getCategoryRemaining(category.id)

                return (
                  <View key={category.id} style={styles.categoryProgressContainer}>
                    <View style={styles.categoryHeader}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={[styles.categoryColorIndicator, { backgroundColor: category.color }]} />
                        <Text style={styles.categoryTitle}>{category.name}</Text>
                      </View>
                      <Text
                        style={[
                          styles.categoryBudgetText,
                          { fontWeight: "bold", color: remaining >= 0 ? colors.success : colors.danger },
                        ]}
                      >
                        R$ {remaining.toFixed(2)}
                      </Text>
                    </View>

                    <BudgetProgressBar current={spent} total={budget} />
                  </View>
                )
              })}

              <TouchableOpacity style={styles.viewAllButton} onPress={navigateToCategories}>
                <Text style={styles.viewAllText}>Ver todas as categorias</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.noExpensesText}>Nenhuma categoria com gastos encontrada.</Text>
          )}
        </View>

        {/* Seção de Despesas Fixas */}
        <View style={styles.sectionHeaderFixed}>
          <Text style={styles.sectionTitle}>Despesas Fixas</Text>
          <View style={styles.filterButtonsContainer}>
            <TouchableOpacity
              style={[styles.filterButton, fixedExpensesFilter === "PENDING" && styles.filterButtonActive]}
              onPress={() => setFixedExpensesFilter("PENDING")}
            >
              <Ionicons
                name="ellipse-outline"
                size={16}
                color={fixedExpensesFilter === "PENDING" ? colors.primary : colors.text}
              />
              <Text style={[styles.filterText, fixedExpensesFilter === "PENDING" && styles.filterTextActive]}>
                Pendentes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, fixedExpensesFilter === "OVERDUE" && styles.filterButtonActive]}
              onPress={() => setFixedExpensesFilter("OVERDUE")}
            >
              <Ionicons
                name="alert-circle"
                size={16}
                color={fixedExpensesFilter === "OVERDUE" ? colors.primary : colors.danger}
              />
              <Text style={[styles.filterText, fixedExpensesFilter === "OVERDUE" && styles.filterTextActive]}>
                Atrasadas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, fixedExpensesFilter === "PAID" && styles.filterButtonActive]}
              onPress={() => setFixedExpensesFilter("PAID")}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={fixedExpensesFilter === "PAID" ? colors.primary : colors.success}
              />
              <Text style={[styles.filterText, fixedExpensesFilter === "PAID" && styles.filterTextActive]}>Pagas</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          {sortedFixedExpenses.length > 0 ? (
            <>
              {sortedFixedExpenses.slice(0, 3).map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onEdit={() => isViewingCurrentMonth && navigation.navigate("Expenses")}
                  onDelete={() => {}}
                  onTogglePaid={() => isViewingCurrentMonth && handleTogglePaid(expense)}
                />
              ))}

              {sortedFixedExpenses.length > 3 && (
                <TouchableOpacity style={styles.viewAllButton} onPress={navigateToExpenses}>
                  <Text style={styles.viewAllText}>Ver todas as despesas fixas</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text style={styles.noExpensesText}>
              Nenhuma despesa fixa{" "}
              {fixedExpensesFilter === "PENDING" ? "pendente" : fixedExpensesFilter === "OVERDUE" ? "atrasada" : "paga"}{" "}
              encontrada.
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Despesas Recentes</Text>
        <View style={styles.recentExpensesCard}>
          {recentVariableExpenses.length > 0 ? (
            recentVariableExpenses.map((expense) => (
              <View key={expense.id} style={styles.recentExpenseItem}>
                <Text style={styles.expenseName}>{expense.name}</Text>
                <Text style={styles.expenseAmount}>R$ {expense.amount.toFixed(2)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noExpensesText}>Nenhuma despesa recente</Text>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

export default HomeScreen