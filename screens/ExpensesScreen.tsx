"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"
import ExpenseItem from "../components/ExpenseItem"
import ExpenseForm from "../components/ExpenseForm"
import { Ionicons } from "@expo/vector-icons"

type FilterType = "ALL" | "FIXED" | "VARIABLE"

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
  } = useFinance()

  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [filterType, setFilterType] = useState<FilterType>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [isVariable, setIsVariable] = useState(false)
  const [filteredExpensesState, setFilteredExpensesState] = useState([])

  // Combinar as despesas fixas e variáveis
  const allExpenses = [...fixedExpenses, ...variableExpenses]

  useEffect(() => {
    // Filtrar despesas com base no tipo e na busca
    const filtered = allExpenses.filter((expense) => {
      // Filtrar por tipo
      if (filterType === "FIXED" && !expense.isFixed) return false
      if (filterType === "VARIABLE" && expense.isFixed) return false

      // Filtrar por busca
      if (searchQuery && !expense.name.toLowerCase().includes(searchQuery.toLowerCase())) return false

      return true
    })

    // Ordenar despesas por data (mais recentes primeiro)
    const sorted = [...filtered].sort((a, b) => {
      const dateA = a.isFixed ? a.dueDate || "" : a.date
      const dateB = b.isFixed ? b.dueDate || "" : b.date
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    setFilteredExpensesState(sorted)
  }, [fixedExpenses, variableExpenses, filterType, searchQuery])

  // Função para adicionar despesa variável
  const handleAddVariableExpense = () => {
    if (isLocked) return
    setEditingExpense(null)
    setIsVariable(true)
    setShowForm(true)
  }

  // Função para adicionar despesa fixa
  const handleAddFixedExpense = () => {
    if (isLocked) return
    setEditingExpense(null)
    setIsVariable(false)
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
            deleteFixedExpense(expense.id)
          } else {
            deleteVariableExpense(expense.id)
          }

          // Forçar atualização da lista
          const updatedExpenses = filteredExpensesState.filter((item) => item.id !== expense.id)
          setFilteredExpensesState(updatedExpenses)
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
      if (expense.isFixed) {
        updateFixedExpense(expense)
      } else {
        updateVariableExpense(expense)
      }
    }
    setShowForm(false)
  }

  const handleTogglePaid = (expense) => {
    if (isLocked || !expense.isFixed) return
    const updatedExpense = {
      ...expense,
      isPaid: !expense.isPaid,
    }
    updateFixedExpense(updatedExpense)
  }

  const getFilterLabel = (filter: FilterType): string => {
    switch (filter) {
      case "ALL":
        return "Todas"
      case "FIXED":
        return "Fixas"
      case "VARIABLE":
        return "Variáveis"
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
    filterContainer: {
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
    },
    filterText: {
      color: colors.text,
      marginLeft: 4,
    },
    // Estilo para os botões de adicionar
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
      marginLeft: 4,
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
    filterOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastOption: {
      borderBottomWidth: 0,
    },
    filterOptionText: {
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
    typeTag: {
      position: "absolute",
      bottom: 25 ,
      left: 15,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      zIndex: 1,
    },
    fixedTag: {
      backgroundColor: colors.primary + "40",
    },
    variableTag: {
      backgroundColor: colors.warning + "40",
    },
    typeTagText: {
      fontSize: 12,
      fontWeight: "bold",
    },
    fixedTagText: {
      color: colors.primary,
    },
    variableTagText: {
      color: colors.warning,
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>

        {/* Barra de pesquisa */}
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

        {/* Filtros */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
            <Ionicons name="filter" size={20} color={colors.text} />
            <Text style={styles.filterText}>{getFilterLabel(filterType)}</Text>
          </TouchableOpacity>

          {/* Container para os dois botões de adicionar */}
          {!isLocked && (
            <View>
              {/* Botão para adicionar despesa fixa */}
              <TouchableOpacity style={styles.addButton} onPress={handleAddFixedExpense}>
                <Ionicons name="calendar" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Nova Despesa Fixa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {filteredExpensesState.length > 0 ? (
        <FlatList
          data={filteredExpensesState}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              {/* Tag de tipo de despesa */}
              <View style={[styles.typeTag, item.isFixed ? styles.fixedTag : styles.variableTag]}>
                <Text style={[styles.typeTagText, item.isFixed ? styles.fixedTagText : styles.variableTagText]}>
                  {item.isFixed ? "Fixa" : "Variável"}
                </Text>
              </View>

              <ExpenseItem
                expense={item}
                onEdit={() => handleEditExpense(item)}
                onDelete={() => handleDeleteExpense(item)}
                onTogglePaid={() => handleTogglePaid(item)}
              />
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={colors.text + "40"} />
          <Text style={styles.emptyText}>
            Nenhuma despesa encontrada. {!isLocked ? "Toque em um dos botões para adicionar." : ""}
          </Text>
        </View>
      )}

      {/* Modal de filtros */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar Despesas</Text>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                setFilterType("ALL")
                setShowFilterModal(false)
              }}
            >
              <Ionicons
                name={filterType === "ALL" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={filterType === "ALL" ? colors.primary : colors.text}
              />
              <Text style={[styles.filterOptionText, filterType === "ALL" && styles.selectedOption]}>
                Todas as Despesas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                setFilterType("FIXED")
                setShowFilterModal(false)
              }}
            >
              <Ionicons
                name={filterType === "FIXED" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={filterType === "FIXED" ? colors.primary : colors.text}
              />
              <Text style={[styles.filterOptionText, filterType === "FIXED" && styles.selectedOption]}>
                Despesas Fixas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, styles.lastOption]}
              onPress={() => {
                setFilterType("VARIABLE")
                setShowFilterModal(false)
              }}
            >
              <Ionicons
                name={filterType === "VARIABLE" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={filterType === "VARIABLE" ? colors.primary : colors.text}
              />
              <Text style={[styles.filterOptionText, filterType === "VARIABLE" && styles.selectedOption]}>
                Despesas Variáveis
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={() => setShowFilterModal(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default ExpensesScreen

