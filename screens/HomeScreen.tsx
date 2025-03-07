"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"
import BudgetProgressBar from "../components/BudgetProgressBar"
import ExpenseItem from "../components/ExpenseItem"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const HomeScreen: React.FC = () => {
  const { colors } = useTheme()
  const {
    monthlyBudget,
    totalSpent,
    remainingBudget,
    expensesByCategory,
    fixedExpenses,
    variableExpenses,
    isLocked,
    updateFixedExpense,
  } = useFinance()
  const navigation = useNavigation()

  // Estado para controlar o filtro de despesas fixas (pagas/não pagas)
  const [showPaidExpenses, setShowPaidExpenses] = useState(false)

  // Filtrar despesas fixas com base no status de pagamento
  const filteredFixedExpenses = fixedExpenses.filter((expense) => (showPaidExpenses ? expense.isPaid : !expense.isPaid))

  // Ordenar por data de vencimento
  const sortedFixedExpenses = [...filteredFixedExpenses].sort((a, b) => {
    const dateA = new Date(a.dueDate || "")
    const dateB = new Date(b.dueDate || "")
    return dateA.getTime() - dateB.getTime()
  })

  // Pegar as 5 despesas variáveis mais recentes
  const recentVariableExpenses = [...variableExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const handleTogglePaid = (expense) => {
    if (isLocked) return
    const updatedExpense = {
      ...expense,
      isPaid: !expense.isPaid,
    }
    updateFixedExpense(updatedExpense)
  }

  const navigateToExpenses = () => {
    navigation.navigate("Expenses")
  }

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
      marginBottom: 5,
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
      justifyContent: "center",
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
      color: remainingBudget >= 0 ? colors.success : colors.danger,
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
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    filterText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 4,
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
  })

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case "MONTHLY_BILLS":
        return "Contas Mensais"
      case "GROCERIES":
        return "Mercado"
      case "LEISURE":
        return "Lazer"
      case "FUEL":
        return "Gasolina"
      case "OTHER":
        return "Outros"
      default:
        return "Outros"
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Orçamento Mensal</Text>

          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Orçamento Total:</Text>
            <Text style={styles.budgetValue}>R$ {monthlyBudget.toFixed(2)}</Text>
          </View>

          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Gasto Total:</Text>
            <Text style={styles.budgetValue}>R$ {totalSpent.toFixed(2)}</Text>
          </View>

          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Saldo Restante:</Text>
            <Text style={styles.remainingValue}>R$ {remainingBudget.toFixed(2)}</Text>
          </View>

          <BudgetProgressBar current={totalSpent} total={monthlyBudget} label="Progresso do Orçamento" />
        </View>

        {/* Seção de Despesas Fixas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Despesas Fixas</Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowPaidExpenses(!showPaidExpenses)}>
            <Ionicons
              name={showPaidExpenses ? "checkmark-circle" : "ellipse-outline"}
              size={16}
              color={showPaidExpenses ? colors.success : colors.text}
            />
            <Text style={styles.filterText}>{showPaidExpenses ? "Pagas" : "Pendentes"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {sortedFixedExpenses.length > 0 ? (
            <>
              {sortedFixedExpenses.slice(0, 3).map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onEdit={() => navigation.navigate("Expenses")}
                  onDelete={() => {}}
                  onTogglePaid={() => handleTogglePaid(expense)}
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
              Nenhuma despesa fixa {showPaidExpenses ? "paga" : "pendente"} encontrada.
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
        <View style={styles.card}>
          {Object.entries(expensesByCategory).map(
            ([category, amount]) =>
              amount > 0 && (
                <View key={category} style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{getCategoryLabel(category)}</Text>
                  <Text style={styles.categoryAmount}>R$ {amount.toFixed(2)}</Text>
                </View>
              ),
          )}

          {Object.values(expensesByCategory).every((amount) => amount === 0) && (
            <Text style={styles.noExpensesText}>Nenhum gasto registrado</Text>
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

