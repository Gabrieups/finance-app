"use client"

import type React from "react"
import { useState } from "react"
import { View, TouchableOpacity, StyleSheet, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"
import ExpenseForm from "./ExpenseForm"

const AddExpenseButton: React.FC = () => {
  const { colors } = useTheme()
  const { isLocked, addVariableExpense } = useFinance()
  const [showForm, setShowForm] = useState(false)

  // Modificar para abrir diretamente o formulário de despesa variável
  const handleAddExpense = () => {
    if (isLocked) return
    setShowForm(true)
  }

  const handleSubmit = (expense) => {
    // Sempre adicionar como despesa variável
    addVariableExpense(expense)
    setShowForm(false)
  }

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      alignItems: "center",
      bottom: 0,
      left: 0,
      right: 0,
    },
    button: {
      backgroundColor: colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      bottom: 30,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      borderWidth: 3,
      borderColor: colors.background,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  })

  if (isLocked) return null

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {showForm && (
        <Modal visible={showForm} transparent={true} animationType="fade" onRequestClose={() => setShowForm(false)}>
          <View style={styles.modalContainer}>
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 16,
                width: "90%",
                maxHeight: "80%",
              }}
            >
              <ExpenseForm
                initialValues={{ isFixed: false }}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                isVariable={true}
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  )
}

export default AddExpenseButton