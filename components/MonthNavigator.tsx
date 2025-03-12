import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"

const MonthNavigator: React.FC = () => {
  const { colors } = useTheme()
  const { currentMonth, setCurrentMonth, navigateToMonth, monthlyHistory } = useFinance()

  // Extrair mês e ano do formato YYYY-MM
  const [year, month] = currentMonth.split("-").map(Number)

  // Obter o nome do mês
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const monthName = monthNames[month - 1]

  // Verificar se é o mês atual
  const today = new Date()
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  const isCurrentMonth = currentMonth === currentMonthKey

  // Permitir navegação para qualquer mês
  const handlePrevMonth = () => {
    navigateToMonth("prev")
  }

  const handleNextMonth = () => {
    navigateToMonth("next")
  }

  // Verificar se o próximo mês é futuro (não permitir navegar para o futuro)
  const isNextMonthFuture = () => {
    const nextMonthDate = new Date(year, month, 1)
    const currentDate = new Date()
    currentDate.setDate(1) // Comparar apenas mês e ano
    return nextMonthDate > currentDate
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    monthContainer: {
      flex: 1,
      alignItems: "center",
    },
    monthText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    yearText: {
      fontSize: 14,
      color: colors.text + "99",
    },
    navButton: {
      padding: 8,
    },
    navButtonDisabled: {
      opacity: 0.3,
    },
    currentMonthIndicator: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 4,
    },
    currentMonthText: {
      color: "#FFFFFF",
      fontSize: 12,
    },
  })

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navButton} onPress={handlePrevMonth}>
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.monthContainer}>
        <Text style={styles.monthText}>{monthName}</Text>
        <Text style={styles.yearText}>{year}</Text>
        {isCurrentMonth && (
          <View style={styles.currentMonthIndicator}>
            <Text style={styles.currentMonthText}>Atual</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.navButton, isNextMonthFuture() && styles.navButtonDisabled]}
        onPress={handleNextMonth}
        disabled={isNextMonthFuture()}
      >
        <Ionicons name="chevron-forward" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  )
}

export default MonthNavigator

