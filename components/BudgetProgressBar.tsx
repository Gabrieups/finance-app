import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { useTheme } from "../context/ThemeContext"

interface BudgetProgressBarProps {
  current: number
  total: number
  label?: string
}

const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ current, total, label }) => {
  const { colors } = useTheme()

  const percentage = total > 0 ? (current / total) * 100 : 0
  const cappedPercentage = Math.min(percentage, 100)

  let barColor = colors.success
  if (percentage > 75 && percentage <= 90) {
    barColor = colors.warning
  } else if (percentage > 90) {
    barColor = colors.danger
  }

  const styles = StyleSheet.create({
    container: {
      marginVertical: 8,
    },
    labelContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    label: {
      fontSize: 14,
      color: colors.text,
    },
    percentageText: {
      fontSize: 14,
      color: colors.text,
    },
    progressBarContainer: {
      height: 12,
      backgroundColor: colors.border,
      borderRadius: 6,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      width: `${cappedPercentage}%`,
      backgroundColor: barColor,
      borderRadius: 6,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        {label && <Text style={styles.label}>{label}</Text>}
        <Text style={styles.percentageText}>{percentage.toFixed(0)}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar} />
      </View>
    </View>
  )
}

export default BudgetProgressBar

