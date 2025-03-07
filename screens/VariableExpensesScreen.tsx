"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"
import ExpenseItem from "../components/ExpenseItem"
import ExpenseForm from "../components/ExpenseForm"
import { Ionicons } from "@expo/vector-icons"

const VariableExpensesScreen: React.FC = () => {
  const { colors } = useTheme()
  const { variableExpenses, addVariableExpense, updateVariableExpense, deleteVariableExpense, isLocked } = useFinance()

  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  const handleAddExpense = () => {
    if (isLocked) return
    setEditingExpense(null)
    setShowForm(true)
  }

  const handleEditExpense = (expense) => {
    if (isLocked) return
    setEditingExpense(expense)
    setShowForm(true)
  }

  const handleDeleteExpense = (id) => {
    if (isLocked) return
    Alert.alert("Confirmar exclusão", "Tem certeza que deseja excluir esta despesa?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => deleteVariableExpense(id) },
    ])
  }

  const handleSubmit = (expense) => {
    if (expense.id) {
      updateVariableExpense(expense)
    } else {
      addVariableExpense(expense)
    }
    setShowForm(false)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    listContainer: {
      padding: 16,
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
  })

  if (showForm) {
    return (
      <View style={styles.formContainer}>
        <ExpenseForm
          initialValues={editingExpense || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          isVariable={true}
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Despesas Variáveis</Text>
        {!isLocked && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {variableExpenses.length > 0 ? (
        <FlatList
          data={variableExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseItem
              expense={item}
              onEdit={() => handleEditExpense(item)}
              onDelete={() => handleDeleteExpense(item.id)}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={colors.text + "40"} />
          <Text style={styles.emptyText}>
            Nenhuma despesa variável cadastrada. {!isLocked ? "Toque no botão + para adicionar." : ""}
          </Text>
        </View>
      )}
    </View>
  )
}

export default VariableExpensesScreen

