import type React from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { BarChart } from "react-native-chart-kit"
import { useTheme } from "../context/ThemeContext"
import { type PaymentMethod, useFinance } from "../context/FinanceContext"

const PaymentMethodChart: React.FC = () => {
  const { colors, isDarkMode } = useTheme()
  const { expensesByPaymentMethod } = useFinance()

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

  // Definir cores diferentes para cada método de pagamento
  const paymentMethodColors = {
    PIX: "#4BC0C0", // Verde-azulado
    CARD: "#FF6384", // Rosa
    CASH: "#FFCE56", // Amarelo
    OTHER: "#9966FF", // Roxo
  }

  // Criar um array de cores baseado nos métodos de pagamento
  const chartColors = Object.keys(expensesByPaymentMethod).map((method) => paymentMethodColors[method as PaymentMethod])

  const chartData = {
    labels: Object.keys(expensesByPaymentMethod).map((method) => getPaymentMethodLabel(method as PaymentMethod)),
    datasets: [
      {
        data: Object.values(expensesByPaymentMethod),
        colors: chartColors.map((color) => () => color), // Função que retorna a cor para cada barra
      },
    ],
  }

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
      marginVertical: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.text,
    },
    noDataText: {
      color: colors.text,
      fontSize: 16,
      textAlign: "center",
      marginVertical: 20,
    },
    legendContainer: {
      marginTop: 16,
      width: "100%",
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    legendColor: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 8,
    },
    legendText: {
      color: colors.text,
      fontSize: 14,
    },
    legendAmount: {
      color: colors.text,
      fontSize: 14,
      marginLeft: "auto",
    },
  })

  if (Object.values(expensesByPaymentMethod).every((value) => value === 0)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Gastos por Forma de Pagamento</Text>
        <Text style={styles.noDataText}>Nenhum gasto registrado</Text>
      </View>
    )
  }
}

export default PaymentMethodChart

