"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { type Category, type Expense, type PaymentMethod, useFinance } from "../context/FinanceContext"

interface ExpenseItemProps {
  expense: Expense
  onEdit: () => void
  onDelete: () => void
  onTogglePaid?: () => void
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onEdit, onDelete, onTogglePaid }) => {
  const { colors } = useTheme()
  const { isLocked, getExpenseStatus, currentMonth, customPaymentMethods } = useFinance()

  const getAdjustedDueDate = (dueDate: string, currentMonth: string) => {
    const [year, month, day] = dueDate.split("-").map(Number)
    return `${currentMonth}-${day.toString().padStart(2, "0")}`
  }

  // Get the adjusted due date for fixed expenses
  const adjustedDueDate =
    expense.isFixed && expense.dueDate ? getAdjustedDueDate(expense.dueDate, currentMonth) : expense.dueDate

  // Obter o status da despesa usando a data ajustada
  const expenseStatus = expense.isFixed
    ? getExpenseStatus({
        ...expense,
        dueDate: adjustedDueDate,
      })
    : null

  const getCategoryLabel = (category: Category): string => {
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

  const getPaymentMethodInfo = (method: PaymentMethod) => {
    // Primeiro, procura nos métodos de pagamento personalizados
    const customMethod = customPaymentMethods.find((m) => m.id === method)

    if (customMethod) {
      return {
        label: customMethod.name,
        icon: customMethod.icon,
      }
    }

    // Fallback para o sistema antigo
    switch (method) {
      case "PIX":
        return { label: "PIX", icon: "flash" }
      case "CARD":
        return { label: "Cartão", icon: "card" }
      case "CASH":
        return { label: "Dinheiro", icon: "cash" }
      case "OTHER":
        return { label: "Outro", icon: "ellipsis-horizontal" }
      default:
        return { label: "Outro", icon: "ellipsis-horizontal" }
    }
  }

  const getCategoryIcon = (category: Category): string => {
    switch (category) {
      case "MONTHLY_BILLS":
        return "calendar"
      case "GROCERIES":
        return "cart"
      case "LEISURE":
        return "game-controller"
      case "FUEL":
        return "car"
      case "OTHER":
        return "apps"
      default:
        return "apps"
    }
  }

  // Obter o status da despesa
  // const expenseStatus = expense.isFixed ? getExpenseStatus(expense) : null

  // Definir ícone e cor com base no status
  const getStatusIcon = () => {
    if (!expense.isFixed) return null

    switch (expenseStatus) {
      case "PAID":
        return {
          icon: "checkmark-circle",
          color: colors.success,
        }
      case "OVERDUE":
        return {
          icon: "alert-circle",
          color: colors.danger,
        }
      case "PENDING":
        return {
          icon: "ellipse-outline",
          color: colors.text + "99",
        }
      default:
        return {
          icon: "ellipse-outline",
          color: colors.text + "99",
        }
    }
  }

  const getStatusLabel = () => {
    if (!expense.isFixed) return ""

    switch (expenseStatus) {
      case "PAID":
        return "Pago"
      case "OVERDUE":
        return "Atrasado"
      case "PENDING":
        return "Pendente"
      default:
        return "Pendente"
    }
  }

  const statusInfo = getStatusIcon()

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      flex: 1,
    },
    amount: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.danger,
    },
    details: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    detailText: {
      marginLeft: 4,
      color: colors.text + "99",
      fontSize: 14,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 12,
    },
    actionButton: {
      marginLeft: 16,
    },
    // Estilo para o status
    statusText: {
      fontSize: 14,
      marginLeft: 4,
    },
    statusPaid: {
      color: colors.success,
    },
    statusOverdue: {
      color: colors.danger,
    },
    statusPending: {
      color: colors.text + "99",
    },
  })

  const paymentMethodInfo = getPaymentMethodInfo(expense.paymentMethod)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{expense.name}</Text>
        <Text style={styles.amount}>R$ {expense.amount.toFixed(2)}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name={getCategoryIcon(expense.category)} size={16} color={colors.text + "99"} />
          <Text style={styles.detailText}>{getCategoryLabel(expense.category)}</Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name={paymentMethodInfo.icon} size={16} color={colors.text + "99"} />
          <Text style={styles.detailText}>{paymentMethodInfo.label}</Text>
        </View>

        {expense.date && !expense.isFixed && (
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.text + "99"} />
            <Text style={styles.detailText}>{expense.date}</Text>
          </View>
        )}
      </View>

      {/* Informações de vencimento e status para despesas fixas */}
      {expense.isFixed && adjustedDueDate && (
        <View style={[styles.details, { marginTop: 4 }]}>
          <View style={styles.detailItem}>
            <Ionicons name="alarm-outline" size={16} color={colors.text + "99"} />
            <Text style={styles.detailText}>Vence em: {adjustedDueDate}</Text>
          </View>

          {!isLocked && onTogglePaid ? (
            <TouchableOpacity style={styles.detailItem} onPress={onTogglePaid}>
              <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
              <Text
                style={[
                  styles.statusText,
                  expenseStatus === "PAID"
                    ? styles.statusPaid
                    : expenseStatus === "OVERDUE"
                      ? styles.statusOverdue
                      : styles.statusPending,
                ]}
              >
                {getStatusLabel()}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.detailItem}>
              <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
              <Text
                style={[
                  styles.statusText,
                  expenseStatus === "PAID"
                    ? styles.statusPaid
                    : expenseStatus === "OVERDUE"
                      ? styles.statusOverdue
                      : styles.statusPending,
                ]}
              >
                {getStatusLabel()}
              </Text>
            </View>
          )}
        </View>
      )}

      {!isLocked && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default ExpenseItem