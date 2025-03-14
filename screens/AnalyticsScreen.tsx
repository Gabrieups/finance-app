import type React from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"
import CategoryChart from "../components/CategoryChart"
import PaymentMethodChart from "../components/PaymentMethodChart"
import BudgetProgressBar from "../components/BudgetProgressBar"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"

const AnalyticsScreen: React.FC = () => {
  const { colors } = useTheme()
  const {
    monthlyBudget,
    totalSpent,
    remainingBudget,
    customCategories,
    getCategoryBudget,
    getCategorySpent,
    getCategoryProgress,
  } = useFinance()

  // Adicionar a função de navegação para categorias, se necessário
  const navigation = useNavigation()

  const navigateToCategories = () => {
    navigation.navigate("Settings", { screen: "Categories" })
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
    categoryBudgetInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    categoryBudgetLabel: {
      fontSize: 14,
      color: colors.text + "99",
    },
    categoryBudgetValue: {
      fontSize: 14,
      color: colors.text,
    },
    categoryBudgetRemaining: {
      fontSize: 14,
      fontWeight: "bold",
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.card,
      marginTop: 16,
      alignSelf: "center",
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.primary,
      marginRight: 4,
    },
  })

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Progresso por Categoria</Text>

          {customCategories.map((category) => {
            const budget = getCategoryBudget(category.id)
            const spent = getCategorySpent(category.id)
            const remaining = budget - spent
            const progress = getCategoryProgress(category.id)

            return (
              <View key={category.id} style={styles.categoryProgressContainer}>
                <Text style={styles.categoryTitle}>{category.name}</Text>

                <View style={styles.categoryBudgetInfo}>
                  <Text style={styles.categoryBudgetLabel}>Orçamento:</Text>
                  <Text style={styles.categoryBudgetValue}>R$ {budget.toFixed(2)}</Text>
                </View>

                <View style={styles.categoryBudgetInfo}>
                  <Text style={styles.categoryBudgetLabel}>Gasto:</Text>
                  <Text style={styles.categoryBudgetValue}>R$ {spent.toFixed(2)}</Text>
                </View>

                <View style={styles.categoryBudgetInfo}>
                  <Text style={styles.categoryBudgetLabel}>Restante:</Text>
                  <Text
                    style={[styles.categoryBudgetRemaining, { color: remaining >= 0 ? colors.success : colors.danger }]}
                  >
                    R$ {remaining.toFixed(2)}
                  </Text>
                </View>

                <BudgetProgressBar current={spent} total={budget} />
              </View>
            )
          })}
          {/* Adicionar um botão para navegar para categorias, se necessário */}
          <TouchableOpacity style={styles.viewAllButton} onPress={navigateToCategories}>
            <Text style={styles.viewAllText}>Gerenciar categorias</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

export default AnalyticsScreen