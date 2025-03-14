"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useFinance, type ExpenseStatus } from "../context/FinanceContext"
import ExpenseItem from "../components/ExpenseItem"
import ExpenseForm from "../components/ExpenseForm"
import { Ionicons } from "@expo/vector-icons"
import MonthNavigator from "../components/MonthNavigator"

type TabType = "FIXED" | "VARIABLE"
type SortType = "DATE" | "NAME" | "AMOUNT"
type SortDirection = "ASC" | "DESC"

const ExpensesScreen: React.FC = () => {
  const { colors } = useTheme()
  const {
    fixedExpenses,
    variableExpenses,
    addFixedExpense,
    addVariableExpense,
    updateFixedExpense,
    updateVariableExpense,
    deleteFixedExpense,
    deleteVariableExpense,
    isLocked,
    currentMonth,
    monthlyHistory,
    isDateInMonth,
    getExpenseStatus,
    getFixedExpensesForMonth,
    setExpensePaymentStatus,
  } = useFinance()

  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("FIXED")
  const [sortType, setSortType] = useState<SortType>("DATE")
  const [sortDirection, setSortDirection] = useState<SortDirection>("DESC")
  const [showSortModal, setShowSortModal] = useState(false)
  const [showStatusFilterModal, setShowStatusFilterModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "ALL">("ALL")
  const [isVariable, setIsVariable] = useState(false)
  const [filteredExpensesState, setFilteredExpensesState] = useState([])

  // Check if we're viewing the current month or historical data
  const today = new Date()
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  const isViewingCurrentMonth = currentMonth === currentMonthKey

  useEffect(() => {
    // Filter expenses based on the active tab, search query, and current month
    let filtered = []

    if (activeTab === "FIXED") {
      // Get fixed expenses for the current viewing month
      const fixedExpensesForMonth = getFixedExpensesForMonth(currentMonth)

      filtered = fixedExpensesForMonth.filter((expense) => {
        // Filter by status if a status filter is active
        if (statusFilter !== "ALL") {
          const expenseStatus = getExpenseStatus(expense)
          if (expenseStatus !== statusFilter) return false
        }

        // Filter by search query
        if (searchQuery && !expense.name.toLowerCase().includes(searchQuery.toLowerCase())) return false

        return true
      })
    } else {
      filtered = variableExpenses.filter((expense) => {
        // Only show variable expenses for the current viewing month
        if (!expense.date || !isDateInMonth(expense.date, currentMonth)) return false

        // Filter by search query
        if (searchQuery && !expense.name.toLowerCase().includes(searchQuery.toLowerCase())) return false

        return true
      })
    }

    // Sort the filtered expenses
    const sorted = [...filtered].sort((a, b) => {
      if (sortType === "DATE") {
        const dateA = a.isFixed ? a.dueDate || "" : a.date
        const dateB = b.isFixed ? b.dueDate || "" : b.date
        return sortDirection === "ASC"
          ? new Date(dateA).getTime() - new Date(dateB).getTime()
          : new Date(dateB).getTime() - new Date(dateA).getTime()
      } else if (sortType === "NAME") {
        return sortDirection === "ASC" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else if (sortType === "AMOUNT") {
        return sortDirection === "ASC" ? a.amount - b.amount : b.amount - a.amount
      }
      return 0
    })

    setFilteredExpensesState(sorted)
  }, [
    activeTab,
    searchQuery,
    sortType,
    sortDirection,
    statusFilter,
    fixedExpenses,
    variableExpenses,
    currentMonth,
    getFixedExpensesForMonth,
  ])

  const handleAddExpense = () => {
    if (isLocked) return
    setEditingExpense(null)
    setIsVariable(activeTab === "VARIABLE")
    setShowForm(true)
  }

  const handleEditExpense = (expense) => {
    if (isLocked) return
    setEditingExpense(expense)
    setIsVariable(!expense.isFixed)
    setShowForm(true)
  }

  const handleDeleteExpense = (expense) => {
    if (isLocked) return
    Alert.alert("Confirmar exclusão", "Tem certeza que deseja excluir esta despesa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          if (expense.isFixed) {
            // If this is a recurring expense (has an underscore in the ID)
            if (expense.id.includes("_")) {
              // Extract the original ID
              const originalId = expense.id.split("_")[0]
              deleteFixedExpense(originalId)
            } else {
              deleteFixedExpense(expense.id)
            }
          } else {
            deleteVariableExpense(expense.id)
          }
        },
      },
    ])
  }

  const handleSubmit = (expense) => {
    const isNewExpense = !expense.id
    const isFixedExpense = !isVariable

    if (isNewExpense) {
      if (isFixedExpense) {
        addFixedExpense(expense)
      } else {
        addVariableExpense(expense)
      }
    } else {
      // If we're editing a recurring expense (has an underscore in the ID)
      if (expense.id.includes("_")) {
        // Extract the original ID
        const originalId = expense.id.split("_")[0]
        // Update the expense with the original ID
        const originalExpense = fixedExpenses.find((e) => e.id === originalId)
        if (originalExpense) {
          // Update with the original ID but keep the new values
          updateFixedExpense({
            ...expense,
            id: originalId,
          })
        }
      } else {
        // Regular update
        if (expense.isFixed) {
          updateFixedExpense(expense)
        } else {
          updateVariableExpense(expense)
        }
      }
    }
    setShowForm(false)
  }

  const handleTogglePaid = (expense) => {
    if (isLocked || !expense.isFixed) return

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

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC")
  }

  const getSortIcon = () => {
    return sortDirection === "ASC" ? "arrow-up" : "arrow-down"
  }

  const getStatusFilterLabel = () => {
    switch (statusFilter) {
      case "PAID":
        return "Pagas"
      case "PENDING":
        return "Pendentes"
      case "OVERDUE":
        return "Atrasadas"
      default:
        return "Todas"
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      height: 48,
      color: colors.text,
      fontSize: 16,
    },
    tabsContainer: {
      flexDirection: "row",
      marginBottom: 16,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    activeTab: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: 16,
      color: colors.text + "99",
    },
    activeTabText: {
      color: colors.primary,
      fontWeight: "bold",
    },
    filterRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginRight: 8,
    },
    filterText: {
      color: colors.text,
      marginLeft: 4,
    },
    addButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 4,
    },
    addButtonText: {
      color: "#FFFFFF",
      marginLeft: 4,
    },
    listContainer: {
      padding: 16,
      paddingTop: 0,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: colors.text + "99",
      textAlign: "center",
      marginTop: 16,
    },
    formContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background + "F5",
      padding: 16,
      justifyContent: "center",
      zIndex: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      width: "80%",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
    },
    sortOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastOption: {
      borderBottomWidth: 0,
    },
    sortOptionText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    selectedOption: {
      color: colors.primary,
      fontWeight: "bold",
    },
    closeButton: {
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.border,
      borderRadius: 8,
      alignItems: "center",
    },
    closeButtonText: {
      color: colors.text,
      fontWeight: "bold",
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
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
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

  if (showForm) {
    return (
      <View style={styles.formContainer}>
        <ExpenseForm
          initialValues={{
            ...editingExpense,
            isFixed: editingExpense?.isFixed || !isVariable,
          }}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          isVariable={isVariable}
        />
      </View>
    )
  }

  // Check if the month is in the future
  const isFutureMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number)
    const currentDate = new Date()
    const viewingDate = new Date(year, month - 1, 1)
    return viewingDate > currentDate
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "FIXED" && styles.activeTab]}
            onPress={() => setActiveTab("FIXED")}
          >
            <Text style={[styles.tabText, activeTab === "FIXED" && styles.activeTabText]}>Despesas Fixas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "VARIABLE" && styles.activeTab]}
            onPress={() => setActiveTab("VARIABLE")}
          >
            <Text style={[styles.tabText, activeTab === "VARIABLE" && styles.activeTabText]}>Despesas Variáveis</Text>
          </TouchableOpacity>
        </View>
        <MonthNavigator />

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

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text + "80"} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar despesa..."
            placeholderTextColor={colors.text + "80"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={colors.text + "80"} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter row */}
        <View style={styles.filterRow}>
          <View style={{ flexDirection: "row" }}>
            {/* Sort button */}
            <TouchableOpacity style={styles.filterButton} onPress={() => setShowSortModal(true)}>
              <Ionicons name="funnel" size={20} color={colors.text} />
              <Text style={styles.filterText}>
                {sortType === "DATE" ? "Data" : sortType === "NAME" ? "Nome" : "Valor"}
              </Text>
              <Ionicons name={getSortIcon()} size={16} color={colors.text} style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            {/* Status filter button - only for fixed expenses */}
            {activeTab === "FIXED" && (
              <TouchableOpacity style={styles.filterButton} onPress={() => setShowStatusFilterModal(true)}>
                <Ionicons name="options" size={20} color={colors.text} />
                <Text style={styles.filterText}>{getStatusFilterLabel()}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Add button */}
          {!isLocked && (
            <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Despesa Fixa</Text>
            </TouchableOpacity>

          )}
        </View>
      </View>

      {filteredExpensesState.length > 0 ? (
        <FlatList
          data={filteredExpensesState}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseItem
              expense={item}
              onEdit={() => handleEditExpense(item)}
              onDelete={() => handleDeleteExpense(item)}
              onTogglePaid={() => handleTogglePaid(item)}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={colors.text + "40"} />
          <Text style={styles.emptyText}>
            Nenhuma despesa {activeTab === "FIXED" ? "fixa" : "variável"} encontrada para este mês.
            {!isLocked ? " Toque no botão + para adicionar." : ""}
          </Text>
        </View>
      )}

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ordenar por</Text>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortType("DATE")
                setShowSortModal(false)
              }}
            >
              <Ionicons
                name={sortType === "DATE" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={sortType === "DATE" ? colors.primary : colors.text}
              />
              <Text style={[styles.sortOptionText, sortType === "DATE" && styles.selectedOption]}>Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortType("NAME")
                setShowSortModal(false)
              }}
            >
              <Ionicons
                name={sortType === "NAME" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={sortType === "NAME" ? colors.primary : colors.text}
              />
              <Text style={[styles.sortOptionText, sortType === "NAME" && styles.selectedOption]}>Nome</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortOption, styles.lastOption]}
              onPress={() => {
                setSortType("AMOUNT")
                setShowSortModal(false)
              }}
            >
              <Ionicons
                name={sortType === "AMOUNT" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={sortType === "AMOUNT" ? colors.primary : colors.text}
              />
              <Text style={[styles.sortOptionText, sortType === "AMOUNT" && styles.selectedOption]}>Valor</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }}>
              <Text style={styles.modalTitle}>Direção</Text>

              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => {
                  setSortDirection("ASC")
                  setShowSortModal(false)
                }}
              >
                <Ionicons
                  name={sortDirection === "ASC" ? "radio-button-on" : "radio-button-off"}
                  size={24}
                  color={sortDirection === "ASC" ? colors.primary : colors.text}
                />
                <Text style={[styles.sortOptionText, sortDirection === "ASC" && styles.selectedOption]}>Crescente</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sortOption, styles.lastOption]}
                onPress={() => {
                  setSortDirection("DESC")
                  setShowSortModal(false)
                }}
              >
                <Ionicons
                  name={sortDirection === "DESC" ? "radio-button-on" : "radio-button-off"}
                  size={24}
                  color={sortDirection === "DESC" ? colors.primary : colors.text}
                />
                <Text style={[styles.sortOptionText, sortDirection === "DESC" && styles.selectedOption]}>
                  Decrescente
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => setShowSortModal(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Status Filter Modal - only for fixed expenses */}
      <Modal
        visible={showStatusFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar por Status</Text>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setStatusFilter("ALL")
                setShowStatusFilterModal(false)
              }}
            >
              <Ionicons
                name={statusFilter === "ALL" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={statusFilter === "ALL" ? colors.primary : colors.text}
              />
              <Text style={[styles.sortOptionText, statusFilter === "ALL" && styles.selectedOption]}>Todas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setStatusFilter("PENDING")
                setShowStatusFilterModal(false)
              }}
            >
              <Ionicons
                name={statusFilter === "PENDING" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={statusFilter === "PENDING" ? colors.primary : colors.text}
              />
              <Text style={[styles.sortOptionText, statusFilter === "PENDING" && styles.selectedOption]}>
                Pendentes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setStatusFilter("PAID")
                setShowStatusFilterModal(false)
              }}
            >
              <Ionicons
                name={statusFilter === "PAID" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={statusFilter === "PAID" ? colors.primary : colors.text}
              />
              <Text style={[styles.sortOptionText, statusFilter === "PAID" && styles.selectedOption]}>Pagas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortOption, styles.lastOption]}
              onPress={() => {
                setStatusFilter("OVERDUE")
                setShowStatusFilterModal(false)
              }}
            >
              <Ionicons
                name={statusFilter === "OVERDUE" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={statusFilter === "OVERDUE" ? colors.primary : colors.text}
              />
              <Text style={[styles.sortOptionText, statusFilter === "OVERDUE" && styles.selectedOption]}>
                Atrasadas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={() => setShowStatusFilterModal(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default ExpensesScreen