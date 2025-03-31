"use client"

import type React from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { BarChart } from "react-native-chart-kit"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"

const PaymentMethodChart: React.FC = () => {
  const { colors, isDarkMode } = useTheme()
  const { expensesByPaymentMethod } = useFinance()

  const { customPaymentMethods } = useFinance()

  // Usar os métodos de pagamento personalizados para labels e cores
  const paymentMethodLabels = {}
  const paymentMethodColors = {}

  customPaymentMethods.forEach((method) => {
    paymentMethodLabels[method.id] = method.name
    paymentMethodColors[method.id] = method.color
  })

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

  const chartData = {
    labels: Object.keys(expensesByPaymentMethod).map((method) => paymentMethodLabels[method] || "Outro"),
    datasets: [
      {
        data: Object.values(expensesByPaymentMethod),
        colors: Object.keys(expensesByPaymentMethod).map((method) => () => paymentMethodColors[method] || "#9966FF"),
      },
    ],
  }

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
                <View style={[styles.legendColor, { backgroundColor: paymentMethodColors[method] || "#9966FF" }]} />
                <Text style={styles.legendText}>{paymentMethodLabels[method] || "Outro"}</Text>
                <Text style={styles.legendAmount}>R$ {amount.toFixed(2)}</Text>
              </View>
            ),
        )}
      </View>
    </View>
  )
}

export default PaymentMethodChart