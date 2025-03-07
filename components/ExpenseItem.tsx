import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { type Category, type Expense, type PaymentMethod, useFinance } from "../context/FinanceContext"

// Atualizar a interface ExpenseItemProps
interface ExpenseItemProps {
  expense: Expense
  onEdit: () => void
  onDelete: () => void
  onTogglePaid?: () => void // Opcional para despesas variáveis
}

// No componente, adicionar a opção de clicar no status para alternar
const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onEdit, onDelete, onTogglePaid }) => {
  const { colors } = useTheme()
  const { isLocked } = useFinance()

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

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case "PIX":
        return "PIX"
      case "CARD":
        return "Cartão"
      case "CASH":
        return "Dinheiro"
      case "OTHER":
        return "Outro"
      default:
        return "Outro"
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

  const getPaymentMethodIcon = (method: PaymentMethod): string => {
    switch (method) {
      case "PIX":
        return "flash"
      case "CARD":
        return "card"
      case "CASH":
        return "cash"
      case "OTHER":
        return "ellipsis-horizontal"
      default:
        return "ellipsis-horizontal"
    }
  }

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
  })

  // Atualizar o return para incluir os novos campos
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
          <Ionicons name={getPaymentMethodIcon(expense.paymentMethod)} size={16} color={colors.text + "99"} />
          <Text style={styles.detailText}>{getPaymentMethodLabel(expense.paymentMethod)}</Text>
        </View>

        {expense.date && (
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.text + "99"} />
            <Text style={styles.detailText}>{expense.date}</Text>
          </View>
        )}
      </View>

      {/* Adicionar informações de vencimento e pagamento para despesas fixas */}
      {expense.isFixed && expense.dueDate && (
        <View style={[styles.details, { marginTop: 4 }]}>
          <View style={styles.detailItem}>
            <Ionicons name="alarm-outline" size={16} color={colors.text + "99"} />
            <Text style={styles.detailText}>Vence em: {expense.dueDate}</Text>
          </View>

          {!isLocked && onTogglePaid ? (
            <TouchableOpacity style={styles.detailItem} onPress={onTogglePaid}>
              <Ionicons
                name={expense.isPaid ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={expense.isPaid ? colors.success : colors.text + "99"}
              />
              <Text style={[styles.detailText, expense.isPaid ? { color: colors.success } : {}]}>
                {expense.isPaid ? "Pago" : "Pendente"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.detailItem}>
              <Ionicons
                name={expense.isPaid ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={expense.isPaid ? colors.success : colors.text + "99"}
              />
              <Text style={[styles.detailText, expense.isPaid ? { color: colors.success } : {}]}>
                {expense.isPaid ? "Pago" : "Pendente"}
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

