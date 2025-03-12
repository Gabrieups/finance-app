"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView, TextInput } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"

interface TabNames {
  fixed: string
  variable: string
}

const SettingsScreen: React.FC = () => {
  const { colors, themeMode, setThemeMode, isDarkMode } = useTheme()
  const {
    monthlyBudget,
    setMonthlyBudget,
    isLocked,
    toggleLock,
    syncWithFirebase,
    toggleFirebaseSync,
    customTabNames,
    updateTabName,
    resetTabNames,
    categoryBudgetPercentages,
    updateCategoryPercentage,
    resetCategoryPercentages,
    resetDay,
    setResetDay,
  } = useFinance()

  const navigation = useNavigation()

  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetValue, setBudgetValue] = useState(monthlyBudget.toString())
  const [editingResetDay, setEditingResetDay] = useState(false)
  const [resetDayValue, setResetDayValue] = useState(resetDay.toString())

  const handleSaveBudget = () => {
    const newBudget = Number.parseFloat(budgetValue)
    if (!isNaN(newBudget) && newBudget >= 0) {
      setMonthlyBudget(newBudget)
      setEditingBudget(false)
    } else {
      Alert.alert("Valor inválido", "Por favor, insira um valor numérico válido.")
    }
  }

  const handleSaveResetDay = () => {
    const newResetDay = Number.parseInt(resetDayValue)
    if (!isNaN(newResetDay) && newResetDay >= 1 && newResetDay <= 31) {
      setResetDay(newResetDay)
      setEditingResetDay(false)
    } else {
      Alert.alert("Valor inválido", "Por favor, insira um dia válido entre 1 e 31.")
    }
  }

  const handleExportData = async () => {
    try {
      const budgetData = await AsyncStorage.getItem("monthlyBudget")
      const fixedData = await AsyncStorage.getItem("fixedExpenses")
      const variableData = await AsyncStorage.getItem("variableExpenses")

      const exportData = {
        monthlyBudget: budgetData,
        fixedExpenses: fixedData ? JSON.parse(fixedData) : [],
        variableExpenses: variableData ? JSON.parse(variableData) : [],
        exportDate: new Date().toISOString(),
      }

      const exportString = JSON.stringify(exportData, null, 2)

      // In a real app, we would use Share API or file system to save this data
      Alert.alert(
        "Dados Exportados",
        "Os dados foram exportados com sucesso. Em um aplicativo real, você poderia salvar este arquivo ou compartilhá-lo.",
        [{ text: "OK" }],
      )

      console.log("Exported data:", exportString)
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao exportar os dados.")
      console.error("Export error:", error)
    }
  }

  const getCategoryLabel = (category: string): string => {
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

  const navigateToCategories = () => {
    navigation.navigate("Categories")
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text + "99",
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
    },
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.text,
    },
    budgetContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    budgetValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginRight: 8,
    },
    budgetInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      padding: 8,
      width: 120,
      color: colors.text,
    },
    buttonContainer: {
      flexDirection: "row",
      marginLeft: 8,
    },
    iconButton: {
      marginLeft: 8,
    },
    exportButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 16,
    },
    exportButtonText: {
      color: "#FFFFFF",
      fontWeight: "bold",
      fontSize: 16,
    },
    themeSelector: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    themeOption: {
      backgroundColor: colors.border,
      padding: 8,
      borderRadius: 4,
      flex: 1,
      marginHorizontal: 4,
      alignItems: "center",
    },
    themeOptionSelected: {
      backgroundColor: colors.primary,
    },
    themeOptionText: {
      color: colors.text,
    },
    themeOptionTextSelected: {
      color: "#FFFFFF",
    },
    // Adicionar novos estilos
    editorSection: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    resetButton: {
      backgroundColor: colors.warning,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
    },
    resetButtonText: {
      color: "#FFFFFF",
      fontWeight: "bold",
      fontSize: 14,
    },
    percentageInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      padding: 8,
      width: 80,
      color: colors.text,
    },
  })

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orçamento</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Orçamento Mensal</Text>
            {editingBudget ? (
              <View style={styles.budgetContainer}>
                <TextInput
                  style={styles.budgetInput}
                  value={budgetValue}
                  onChangeText={setBudgetValue}
                  keyboardType="numeric"
                  autoFocus
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.iconButton} onPress={handleSaveBudget}>
                    <Ionicons name="checkmark" size={24} color={colors.success} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      setBudgetValue(monthlyBudget.toString())
                      setEditingBudget(false)
                    }}
                  >
                    <Ionicons name="close" size={24} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.budgetContainer}>
                <Text style={styles.budgetValue}>R$ {monthlyBudget.toFixed(2)}</Text>
                {!isLocked && (
                  <TouchableOpacity style={styles.iconButton} onPress={() => setEditingBudget(true)}>
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aplicativo</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Bloquear Edições</Text>
            <Switch
              value={isLocked}
              onValueChange={toggleLock}
              trackColor={{ false: colors.border, true: colors.primary + "80" }}
              thumbColor={isLocked ? colors.primary : "#f4f3f4"}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.settingLabel}>Tema</Text>
          </View>

          <View style={styles.themeSelector}>
            <TouchableOpacity
              style={[styles.themeOption, themeMode === "light" && styles.themeOptionSelected]}
              onPress={() => setThemeMode("light")}
            >
              <Text style={[styles.themeOptionText, themeMode === "light" && styles.themeOptionTextSelected]}>
                Claro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeOption, themeMode === "dark" && styles.themeOptionSelected]}
              onPress={() => setThemeMode("dark")}
            >
              <Text style={[styles.themeOptionText, themeMode === "dark" && styles.themeOptionTextSelected]}>
                Escuro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeOption, themeMode === "system" && styles.themeOptionSelected]}
              onPress={() => setThemeMode("system")}
            >
              <Text style={[styles.themeOptionText, themeMode === "system" && styles.themeOptionTextSelected]}>
                Sistema
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={handleExportData}>
          <Text style={styles.exportButtonText}>Exportar Dados</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default SettingsScreen