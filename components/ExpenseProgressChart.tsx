"use client"

import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"
import BudgetProgressBar from "./BudgetProgressBar"

interface ExpenseProgressChartProps {
  showFixedExpenses: boolean
  showVariableExpenses: boolean
}

const ExpenseProgressChart: React.FC<ExpenseProgressChartProps> = ({
  showFixedExpenses = true,
  showVariableExpenses = true,
}) => {
  const { colors } = useTheme()
  const {
    totalSpent,
    monthlyBudget,
    currentMonth,
    fixedExpenses,
    variableExpenses,
    getFixedExpensesForMonth,
    isDateInMonth,
  } = useFinance()

  // Calcular os totais de despesas fixas e variáveis para o mês atual
  const fixedExpensesForMonth = getFixedExpensesForMonth(currentMonth)
  const totalFixedExpenses = fixedExpensesForMonth
    .filter((expense) => expense.isPaid)
    .reduce((sum, expense) => sum + expense.amount, 0)

  const totalVariableExpenses = variableExpenses
    .filter((expense) => expense.date && isDateInMonth(expense.date, currentMonth))
    .reduce((sum, expense) => sum + expense.amount, 0)

  // Calcular a porcentagem do orçamento total
  const fixedPercentage = monthlyBudget > 0 ? (totalFixedExpenses / monthlyBudget) * 100 : 0
  const variablePercentage = monthlyBudget > 0 ? (totalVariableExpenses / monthlyBudget) * 100 : 0
  const totalPercentage = monthlyBudget > 0 ? ((totalFixedExpenses + totalVariableExpenses) / monthlyBudget) * 100 : 0

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 4,
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 8,
      marginHorizontal: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.text,
    },
    noDataText: {
      color: colors.text,
      fontSize: 16,
      textAlign: "center",
      marginVertical: 20,
    },
    subtotalContainer: {
      width: "100%",
    },
    subtotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    subtotalLabel: {
      fontSize: 14,
      color: colors.text,
    },
    subtotalValue: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.text,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    totalValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
    progressSection: {
      marginBottom: 4,
    },
    progressLabel: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.text,
    },
  })

  // Se não houver dados para mostrar, exibir uma mensagem
  const noData =
    (!showFixedExpenses || totalFixedExpenses === 0) && (!showVariableExpenses || totalVariableExpenses === 0)

  if (noData) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Não há despesas registradas</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Barras de progresso */}
      {showFixedExpenses && totalFixedExpenses > 0 && (
        <View style={styles.progressSection}>
          <BudgetProgressBar current={totalFixedExpenses} total={monthlyBudget} />
        </View>
      )}

      {showVariableExpenses && totalVariableExpenses > 0 && (
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Despesas Variáveis</Text>
          <BudgetProgressBar current={totalVariableExpenses} total={monthlyBudget} />
        </View>
      )}

      {showFixedExpenses && showVariableExpenses && (
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Total</Text>
          <BudgetProgressBar current={totalFixedExpenses + totalVariableExpenses} total={monthlyBudget} />
        </View>
      )}

      {/* Detalhes dos valores */}
      <View style={styles.subtotalContainer}>
        {showFixedExpenses && (
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Total Despesas Fixas:</Text>
            <Text style={styles.subtotalValue}>
              R$ {totalFixedExpenses.toFixed(2)} ({fixedPercentage.toFixed(1)}%)
            </Text>
          </View>
        )}

        {showVariableExpenses && (
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Total Despesas Variáveis:</Text>
            <Text style={styles.subtotalValue}>
              R$ {totalVariableExpenses.toFixed(2)} ({variablePercentage.toFixed(1)}%)
            </Text>
          </View>
        )}

        {showFixedExpenses && showVariableExpenses && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Geral:</Text>
            <Text style={styles.totalValue}>
              R$ {(totalFixedExpenses + totalVariableExpenses).toFixed(2)} ({totalPercentage.toFixed(1)}%)
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default ExpenseProgressChart
