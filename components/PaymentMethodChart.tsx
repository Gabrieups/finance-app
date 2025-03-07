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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gastos por Forma de Pagamento</Text>
      <BarChart
        data={chartData}
        width={Dimensions.get("window").width - 64}
        height={220}
        yAxisLabel="R$"
        chartConfig={{
          backgroundColor: colors.background,
          backgroundGradientFrom: colors.background,
          backgroundGradientTo: colors.background,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => (isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`),
          style: {
            borderRadius: 16,
          },
          barPercentage: 0.7,
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        fromZero
      />

      {/* Adicionar legenda com cores */}
      <View style={styles.legendContainer}>
        {Object.entries(expensesByPaymentMethod).map(
          ([method, amount], index) =>
            amount > 0 && (
              <View key={method} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: paymentMethodColors[method as PaymentMethod] }]} />
                <Text style={styles.legendText}>{getPaymentMethodLabel(method as PaymentMethod)}</Text>
                <Text style={styles.legendAmount}>R$ {amount.toFixed(2)}</Text>
              </View>
            ),
        )}
      </View>
    </View>
  )
}

export default PaymentMethodChart

