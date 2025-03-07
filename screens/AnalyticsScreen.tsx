import type React from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"
import CategoryChart from "../components/CategoryChart"
import PaymentMethodChart from "../components/PaymentMethodChart"
import BudgetProgressBar from "../components/BudgetProgressBar"

const AnalyticsScreen: React.FC = () => {
  const { colors } = useTheme()
  const { monthlyBudget, totalSpent, remainingBudget, expensesByCategory } = useFinance()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 16,
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
      color: remainingBudget >= 0 ? colors.success : colors.danger,
    },
    categoryProgressContainer: {
      marginTop: 8,
    },
    categoryTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
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

  // Calculate category budget percentages
  const categoryBudgetPercentages = {
    MONTHLY_BILLS: 0.5, // 50% for monthly bills
    GROCERIES: 0.2, // 20% for groceries
    LEISURE: 0.1, // 10% for leisure
    FUEL: 0.1, // 10% for fuel
    OTHER: 0.1, // 10% for other
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Visão Geral do Orçamento</Text>

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

        <CategoryChart />

        <PaymentMethodChart />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Progresso por Categoria</Text>

          {Object.entries(expensesByCategory).map(([category, amount]) => {
            const categoryBudget = monthlyBudget * categoryBudgetPercentages[category]
            return (
              <View key={category} style={styles.categoryProgressContainer}>
                <Text style={styles.categoryTitle}>{getCategoryLabel(category)}</Text>
                <BudgetProgressBar current={amount} total={categoryBudget} />
              </View>
            )
          })}
        </View>
      </View>
    </ScrollView>
  )
}

export default AnalyticsScreen

