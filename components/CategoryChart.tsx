"use client"

import type React from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { PieChart } from "react-native-chart-kit"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"

const CategoryChart: React.FC = () => {
  const { colors, isDarkMode } = useTheme()
  const { expensesByCategory, totalSpent, customCategories } = useFinance()

  const chartData = customCategories
    .map((category) => {
      const amount = expensesByCategory[category.id] || 0
      return {
        name: category.name,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
        color: category.color,
        legendFontColor: isDarkMode ? "#FFF" : "#7F7F7F",
        legendFontSize: 12,
      }
    })
    .filter((item) => item.amount > 0)

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

  if (chartData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Gastos por Categoria</Text>
        <Text style={styles.noDataText}>Nenhum gasto registrado</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gastos por Categoria</Text>
      <PieChart
        data={chartData}
        width={Dimensions.get("window").width - 64}
        height={220}
        chartConfig={{
          backgroundColor: colors.background,
          backgroundGradientFrom: colors.background,
          backgroundGradientTo: colors.background,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => (isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`),
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="80"
        absolute
        hasLegend={false}
      />

      <View style={styles.legendContainer}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.name} ({item.percentage.toFixed(1)}%)
            </Text>
            <Text style={styles.legendAmount}>R$ {item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default CategoryChart

