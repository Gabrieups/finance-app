"use client"

import type React from "react"
import { useState } from "react"
import { View, TouchableOpacity, StyleSheet, Modal, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"
import ExpenseForm from "./ExpenseForm"

const AddExpenseButton: React.FC = () => {
  const { colors } = useTheme()
  const { isLocked } = useFinance()
  const [showOptions, setShowOptions] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isVariable, setIsVariable] = useState(false)

  const handleAddExpense = (isVariableExpense: boolean) => {
    if (isLocked) return
    setIsVariable(isVariableExpense)
    setShowOptions(false)
    setShowForm(true)
  }

  const handleSubmit = (expense) => {
    // O formulário já chama as funções de adicionar do contexto
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
    optionsContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      width: "80%",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    optionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
      textAlign: "center",
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastOption: {
      borderBottomWidth: 0,
    },
    optionText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    cancelButton: {
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.border,
      borderRadius: 8,
      alignItems: "center",
    },
    cancelText: {
      color: colors.text,
      fontWeight: "bold",
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

  if (isLocked) return null

  if (showForm) {
    return (
      <View style={styles.formContainer}>
        <ExpenseForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} isVariable={isVariable} />
      </View>
    )
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={() => setShowOptions(true)}>
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Modal visible={showOptions} transparent={true} animationType="fade" onRequestClose={() => setShowOptions(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.optionsContainer}>
            <Text style={styles.optionTitle}>Adicionar Despesa</Text>

            <TouchableOpacity style={styles.option} onPress={() => handleAddExpense(false)}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <Text style={styles.optionText}>Despesa Fixa</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.option, styles.lastOption]} onPress={() => handleAddExpense(true)}>
              <Ionicons name="cart" size={24} color={colors.primary} />
              <Text style={styles.optionText}>Despesa Variável</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowOptions(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}

export default AddExpenseButton

