"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ScrollView , Modal} from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useFinance, type CustomCategory } from "../context/FinanceContext"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import BudgetProgressBar from "../components/BudgetProgressBar"

const CategoriesScreen: React.FC = () => {
  const { colors } = useTheme()
  const {
    customCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    isLocked,
    monthlyBudget,
    categoryBudgetPercentages,
    updateCategoryPercentage,
    getCategoryBudget,
    getCategorySpent,
    getCategoryRemaining,
    getCategoryProgress,
  } = useFinance()

  const navigation = useNavigation()

  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null)
  const [name, setName] = useState("")
  const [color, setColor] = useState("#FF6384")
  const [percentage, setPercentage] = useState("0")

  const predefinedColors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#8AC249",
    "#EA5545",
    "#F46A9B",
    "#EF9A9A",
  ]

  const handleAddCategory = () => {
    if (isLocked) return
    setEditingCategory(null)
    setName("")
    setColor(predefinedColors[0])
    setPercentage("0")
    setShowForm(true)
  }

  const handleEditCategory = (category: CustomCategory) => {
    if (isLocked) return
    setEditingCategory(category)
    setName(category.name)
    setColor(category.color)
    setPercentage(((categoryBudgetPercentages[category.id] || 0) * 100).toString())
    setShowForm(true)
  }

  const handleDeleteCategory = (category: CustomCategory) => {
    if (isLocked) return

    Alert.alert("Confirmar exclusão", `Tem certeza que deseja excluir a categoria "${category.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deleteCategory(category.id),
      },
    ])
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome da categoria é obrigatório")
      return
    }

    const percentageValue = Number.parseFloat(percentage) / 100
    if (isNaN(percentageValue) || percentageValue < 0 || percentageValue > 1) {
      Alert.alert("Erro", "A porcentagem deve ser um valor entre 0 e 100")
      return
    }

    if (editingCategory) {
      // Atualizar categoria existente
      updateCategory({
        ...editingCategory,
        name,
        color,
      })
      updateCategoryPercentage(editingCategory.id, percentageValue)
    } else {
      // Adicionar nova categoria
      const newCategory = {
        name,
        color,
        budget: monthlyBudget * percentageValue,
      }
      const newCategoryId = addCategory(newCategory)

      // Atualizar a porcentagem da categoria
      if (newCategoryId) {
        updateCategoryPercentage(newCategoryId, percentageValue)
      }
    }

    setShowForm(false)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text + "99",
      marginBottom: 16,
    },
    addButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    addButtonText: {
      color: "#FFFFFF",
      fontWeight: "bold",
      marginLeft: 8,
    },
    categoryItem: {
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
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    categoryName: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      flex: 1,
    },
    categoryColor: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: 8,
    },
    budgetInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    budgetLabel: {
      fontSize: 14,
      color: colors.text + "99",
    },
    budgetValue: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.text,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 12,
    },
    actionButton: {
      marginLeft: 16,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      width: "90%",
      maxHeight: "80%",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
      textAlign: "center",
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
    },
    colorPicker: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginTop: 8,
    },
    colorOption: {
      width: 36,
      height: 36,
      borderRadius: 18,
      margin: 4,
      borderWidth: 2,
      borderColor: "transparent",
    },
    colorSelected: {
      borderColor: colors.primary,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 24,
    },
    button: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      marginHorizontal: 4,
    },
    cancelButton: {
      backgroundColor: colors.border,
    },
    submitButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontWeight: "bold",
    },
    cancelButtonText: {
      color: colors.text,
    },
    submitButtonText: {
      color: "#FFFFFF",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: colors.text + "99",
      textAlign: "center",
      marginTop: 16,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    backButtonText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
  })

  return (
    <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
  
      {!isLocked && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Nova Categoria</Text>
        </TouchableOpacity>
      )}
    </View>
  
    <FlatList
      data={customCategories}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.budgetValue}>{(categoryBudgetPercentages[item.id] * 100).toFixed(0)}%</Text>
            </View>
          </View>
  
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetLabel}>Orçamento:</Text>
            <Text style={styles.budgetValue}>R$ {getCategoryBudget(item.id).toFixed(2)}</Text>
          </View>
  
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetLabel}>Gasto:</Text>
            <Text style={styles.budgetValue}>R$ {getCategorySpent(item.id).toFixed(2)}</Text>
          </View>
  
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetLabel}>Restante:</Text>
            <Text style={[styles.budgetValue, { color: getCategoryRemaining(item.id) >= 0 ? colors.success : colors.danger }]}>
              R$ {getCategoryRemaining(item.id).toFixed(2)}
            </Text>
          </View>
  
          <BudgetProgressBar current={getCategorySpent(item.id)} total={getCategoryBudget(item.id)} />
  
          {!isLocked && (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleEditCategory(item)}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteCategory(item)}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={64} color={colors.text + "40"} />
          <Text style={styles.emptyText}>
            Nenhuma categoria encontrada. {!isLocked ? "Toque no botão + para adicionar." : ""}
          </Text>
        </View>
      }
    />
  
    <Modal
      visible={showForm}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowForm(false)}
    >
      <View style={styles.modalContainer}>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</Text>
  
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome da categoria"
              placeholderTextColor={colors.text + "80"}
            />
          </View>
  
          <View style={styles.formGroup}>
            <Text style={styles.label}>Cor</Text>
            <View style={styles.colorPicker}>
              {predefinedColors.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorOption, { backgroundColor: c }, color === c && styles.colorSelected]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>
          </View>
  
          <View style={styles.formGroup}>
            <Text style={styles.label}>Porcentagem do Orçamento (%)</Text>
            <TextInput
              style={styles.input}
              value={percentage}
              onChangeText={setPercentage}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.text + "80"}
              autoFocus={true}
            />
          </View>
  
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setShowForm(false)}>
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
              <Text style={[styles.buttonText, styles.submitButtonText]}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  </View>
  )
}

export default CategoriesScreen

