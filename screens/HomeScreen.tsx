"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useFinance, type Expense, type HomeSection } from "../context/FinanceContext"
import BudgetProgressBar from "../components/BudgetProgressBar"
import ExpenseItem from "../components/ExpenseItem"
import MonthNavigator from "../components/MonthNavigator"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"

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
    homeSections,
    updateHomeSectionOrder,
    toggleHomeSectionVisibility,
  } = useFinance()
  const navigation = useNavigation()
  const route = useRoute()

  // Estado para controlar o modo de edição
  const [editMode, setEditMode] = useState(false)
  // Estado para controlar a expansão das categorias
  const [expandCategories, setExpandCategories] = useState(false)
  // Estado para controlar o filtro de despesas fixas (pagas/não pagas/atrasadas)
  const [fixedExpensesFilter, setFixedExpensesFilter] = useState<"PENDING" | "PAID" | "OVERDUE">("PENDING")
  // No bloco de estados do componente, adicione:
  const [expandedFixedExpenses, setExpandedFixedExpenses] = useState(false)
  const [expandedRecentExpenses, setExpandedRecentExpenses] = useState(false)

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

    if (currentMonth === currentMonthKey) {
      // For current month, use the actual fixed expenses and calculate totals
      const fixedExpensesForCurrentMonth = getFixedExpensesForMonth(currentMonth)

      setDisplayData({
        fixedExpenses: fixedExpensesForCurrentMonth,
        variableExpenses,
        totalSpent,
        budget: monthlyBudget,
      })
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

  // Pegar as categorias
  const categoriesToShow = expandCategories
    ? [...customCategories].sort((a, b) => {
        const spentA = getCategorySpent(a.id)
        const spentB = getCategorySpent(b.id)
        return spentB - spentA
      })
    : [...customCategories]
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

  const navigateToExpenses = (tab?: "FIXED" | "VARIABLE") => {
    if (tab) {
      navigation.navigate("Expenses", { initialTab: tab })
    } else {
      navigation.navigate("Expenses")
    }
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

  // Função para renderizar uma seção com base no tipo
  const renderSection = (section: HomeSection) => {
    if (!section.visible) return null

    switch (section.type) {
      case "budget":
        return (
          <View key={section.id} style={styles.sectionContainer}>
            {editMode && (
              <View style={styles.editSectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                <TouchableOpacity
                  style={styles.visibilityButton}
                  onPress={() => toggleHomeSectionVisibility(section.id)}
                >
                  <Ionicons name="eye-off-outline" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.card}>
              {!editMode && <Text style={styles.cardTitle}>{section.title}</Text>}

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
          </View>
        )

      case "fixedExpenses":
        return (
          <View key={section.id} style={styles.sectionContainer}>
            {editMode ? (
              <View style={styles.editSectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                <TouchableOpacity
                  style={styles.visibilityButton}
                  onPress={() => toggleHomeSectionVisibility(section.id)}
                >
                  <Ionicons name="eye-off-outline" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.sectionHeaderWithButton} onPress={() => navigateToExpenses("FIXED")}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}

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
                <Text style={[styles.filterText, fixedExpensesFilter === "PAID" && styles.filterTextActive]}>
                  Pagas
                </Text>
              </TouchableOpacity>
            </View>

            {/* Modifique a renderização das despesas fixas no método renderSection: */}
            {/* Altere o trecho que renderiza as fixedExpenses dentro do case "fixedExpenses": */}
            <TouchableOpacity style={styles.card} onPress={() => navigateToExpenses("FIXED")}>
              {sortedFixedExpenses.length > 0 ? (
                <>
                  {(expandedFixedExpenses ? sortedFixedExpenses : sortedFixedExpenses.slice(0, 3)).map((expense) => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      onEdit={() => isViewingCurrentMonth && navigation.navigate("Expenses")}
                      onDelete={() => {}}
                      onTogglePaid={() => isViewingCurrentMonth && handleTogglePaid(expense)}
                    />
                  ))}
                  {sortedFixedExpenses.length > 3 && (
                    <TouchableOpacity
                      style={styles.navigateButton}
                      onPress={() => setExpandedFixedExpenses(!expandedFixedExpenses)}
                    >
                      <Text style={styles.navigateButtonText}>
                        {expandedFixedExpenses ? "Mostrar menos" : "Ver todas"}
                      </Text>
                      <Ionicons
                        name={expandedFixedExpenses ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <Text style={styles.noExpensesText}>
                  Nenhuma despesa fixa{" "}
                  {fixedExpensesFilter === "PENDING"
                    ? "pendente"
                    : fixedExpensesFilter === "OVERDUE"
                      ? "atrasada"
                      : "paga"}{" "}
                  encontrada.
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )

      case "categories":
        return (
          <View key={section.id} style={styles.sectionContainer}>
            {editMode ? (
              <View style={styles.editSectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                <TouchableOpacity
                  style={styles.visibilityButton}
                  onPress={() => toggleHomeSectionVisibility(section.id)}
                >
                  <Ionicons name="eye-off-outline" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            )}

            <View style={styles.card}>
              {categoriesToShow.length > 0 ? (
                <>
                  {categoriesToShow.map((category) => {
                    const budget = getCategoryBudget(category.id)
                    const spent = getCategorySpent(category.id)
                    const remaining = getCategoryRemaining(category.id)

                    return (
                      <View key={category.id} style={styles.categoryProgressContainer}>
                        <View style={styles.categoryHeader}>
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View
                              style={[
                                styles.categoryColorIndicator,
                                { backgroundColor: category.color, alignItems: "center", justifyContent: "center" },
                              ]}
                            >
                              <Ionicons name={category.icon || "apps"} size={16} color={colors.text} />
                            </View>
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

                  <TouchableOpacity style={styles.viewAllButton} onPress={() => setExpandCategories(!expandCategories)}>
                    <Text style={styles.viewAllText}>
                      {expandCategories ? "Mostrar menos categorias" : "Expandir categorias"}
                    </Text>
                    <Ionicons
                      name={expandCategories ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.noExpensesText}>Nenhuma categoria com gastos encontrada.</Text>
              )}
            </View>
          </View>
        )

      case "recentExpenses":
        return (
          <View key={section.id} style={styles.sectionContainer}>
            {editMode ? (
              <View style={styles.editSectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                <TouchableOpacity
                  style={styles.visibilityButton}
                  onPress={() => toggleHomeSectionVisibility(section.id)}
                >
                  <Ionicons name="eye-off-outline" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.sectionHeaderWithButton} onPress={() => navigateToExpenses("VARIABLE")}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}

            {/* Faça a mesma alteração para as despesas recentes dentro do case "recentExpenses": */}
            <TouchableOpacity style={styles.recentExpensesCard} onPress={() => navigateToExpenses("VARIABLE")}>
              {recentVariableExpenses.length > 0 ? (
                <>
                  {(expandedRecentExpenses ? recentVariableExpenses : recentVariableExpenses.slice(0, 3)).map(
                    (expense) => (
                      <View key={expense.id} style={styles.recentExpenseItem}>
                        <Text style={styles.expenseName}>{expense.name}</Text>
                        <Text style={styles.expenseAmount}>R$ {expense.amount.toFixed(2)}</Text>
                      </View>
                    ),
                  )}
                  {recentVariableExpenses.length > 3 && (
                    <TouchableOpacity
                      style={styles.navigateButton}
                      onPress={() => setExpandedRecentExpenses(!expandedRecentExpenses)}
                    >
                      <Text style={styles.navigateButtonText}>
                        {expandedRecentExpenses ? "Mostrar menos" : "Ver todas"}
                      </Text>
                      <Ionicons
                        name={expandedRecentExpenses ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <Text style={styles.noExpensesText}>Nenhuma despesa recente</Text>
              )}
            </TouchableOpacity>
          </View>
        )

      default:
        return null
    }
  }

  // Função para alternar o modo de edição
  const toggleEditMode = () => {
    setEditMode(!editMode)
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 15,
      borderRadius: 8,
      marginHorizontal: 16,
      marginBottom: 125,
    },
    editButtonActive: {
      backgroundColor: colors.primary,
    },
    editButtonText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 4,
      fontWeight: "bold",
    },
    editButtonTextActive: {
      color: colors.text,
      fontWeight: "bold",
    },
    sectionContainer: {
      marginBottom: 16,
    },
    editSectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    visibilityButton: {
      padding: 4,
    },
    draggableItem: {
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    draggableItemContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    dragHandle: {
      marginRight: 12,
    },
    draggableItemText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
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
      marginBottom: 8,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    sectionHeaderWithButton: {
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
      marginBottom: 8,
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
    navigateButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      justifyContent: "center",
    },
    navigateButtonText: {
      fontSize: 14,
      color: colors.primary,
      marginRight: 4,
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
      width: 25,
      height: 25,
      borderRadius: 15,
      marginRight: 8,
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
    sectionOrderControls: {
      flexDirection: "column",
      marginRight: 12,
    },
    orderButton: {
      padding: 4,
    },
  })

  // Adicionar código para ativar o modo de edição quando navegado da tela de configurações
  // Adicionar este useEffect após os outros useEffects:

  // Ativar o modo de edição quando navegado da tela de configurações
  useEffect(() => {
    if (route?.params?.activateEditMode) {
      setEditMode(true)
      // Limpar o parâmetro para não ativar novamente se a tela for atualizada
      navigation.setParams({ activateEditMode: undefined })
    }
  }, [route?.params])

  // Alterar o return para evitar o aninhamento de FlatList dentro de ScrollView
  return (
    <View style={styles.container}>
      {editMode ? (
        // Quando estiver no modo de edição, usar apenas o FlatList
        <View style={{ flex: 1 }}>
          <View style={styles.content}>
            <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
              Toque para alterar a visibilidade das seções
            </Text>
          </View>

          <FlatList
            data={homeSections.sort((a, b) => a.order - b.order)}
            renderItem={({ item, index }) => (
              <View style={[styles.draggableItem, { backgroundColor: colors.card, marginHorizontal: 16 }]}>
                <View style={styles.draggableItemContent}>
                  <View style={styles.sectionOrderControls}>
                    <TouchableOpacity
                      style={styles.orderButton}
                      onPress={() => {
                        if (index > 0) {
                          // Move a seção para cima
                          const newSections = [...homeSections]
                          const temp = newSections[index].order
                          newSections[index].order = newSections[index - 1].order
                          newSections[index - 1].order = temp
                          updateHomeSectionOrder(newSections)
                        }
                      }}
                      disabled={index === 0}
                    >
                      <Ionicons name="arrow-up" size={20} color={index === 0 ? colors.text + "40" : colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.orderButton}
                      onPress={() => {
                        if (index < homeSections.length - 1) {
                          // Move a seção para baixo
                          const newSections = [...homeSections]
                          const temp = newSections[index].order
                          newSections[index].order = newSections[index + 1].order
                          newSections[index + 1].order = temp
                          updateHomeSectionOrder(newSections)
                        }
                      }}
                      disabled={index === homeSections.length - 1}
                    >
                      <Ionicons
                        name="arrow-down"
                        size={20}
                        color={index === homeSections.length - 1 ? colors.text + "40" : colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.draggableItemText}>{item.title}</Text>
                  <TouchableOpacity
                    style={styles.visibilityButton}
                    onPress={() => toggleHomeSectionVisibility(item.id)}
                  >
                    <Ionicons name={item.visible ? "eye-outline" : "eye-off-outline"} size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          <TouchableOpacity style={[styles.editButton, editMode && styles.editButtonActive]} onPress={toggleEditMode}>
            <Ionicons name={"checkmark"} size={20} color={colors.text} />
            <Text style={[styles.editButtonText, editMode && styles.editButtonTextActive]}>{"Concluir"}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Quando não estiver no modo de edição, usar o ScrollView
        <ScrollView>
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

            {/* Renderizar as seções na ordem definida */}
            {homeSections
              .filter((section) => section.visible)
              .sort((a, b) => a.order - b.order)
              .map((section) => renderSection(section))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

export default HomeScreen