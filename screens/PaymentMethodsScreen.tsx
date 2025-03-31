"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ScrollView, Modal } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useFinance, type CustomPaymentMethod } from "../context/FinanceContext"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const PaymentMethodsScreen: React.FC = () => {
  const { colors } = useTheme()
  const { customPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, isLocked } = useFinance()

  const navigation = useNavigation()

  const [showForm, setShowForm] = useState(false)
  const [editingMethod, setEditingMethod] = useState<CustomPaymentMethod | null>(null)
  const [name, setName] = useState("")
  const [color, setColor] = useState("#FF6384")
  const [icon, setIcon] = useState("card")
  const nameInputRef = useRef<TextInput>(null)

  // Lista de ícones predefinidos
  const predefinedIcons = [
    "card",
    "card-outline",
    "cash",
    "cash-outline",
    "wallet",
    "wallet-outline",
    "flash",
    "flash-outline",
    "pricetag",
    "pricetag-outline",
    "basket",
    "basket-outline",
    "cart",
    "cart-outline",
    "gift",
    "gift-outline",
    "ellipsis-horizontal",
  ]

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

  const handleEditMethod = (method: CustomPaymentMethod) => {
    if (isLocked) return
    setEditingMethod(method)
    setName(method.name)
    setColor(method.color)
    setIcon(method.icon)
    setShowForm(true)
  }

  const handleAddMethod = () => {
    if (isLocked) return
    setEditingMethod(null)
    setName("")
    setColor(predefinedColors[0])
    setIcon("card")
    setShowForm(true)
  }

  useEffect(() => {
    if (showForm && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [showForm])

  const handleDeleteMethod = (method: CustomPaymentMethod) => {
    if (isLocked) return

    Alert.alert("Confirmar exclusão", `Tem certeza que deseja excluir o método "${method.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deletePaymentMethod(method.id),
      },
    ])
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome do método de pagamento é obrigatório")
      return
    }

    if (editingMethod) {
      updatePaymentMethod({
        ...editingMethod,
        name,
        color,
        icon,
      })
    } else {
      const newMethod = {
        name,
        color,
        icon,
      }
      addPaymentMethod(newMethod)
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
    methodItem: {
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
    methodHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    methodName: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      flex: 1,
    },
    methodIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
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
      justifyContent: "center",
    },
    colorOption: {
      width: 36,
      height: 36,
      borderRadius: 18,
      margin: 8,
      borderWidth: 2,
      borderColor: "transparent",
    },
    colorSelected: {
      borderColor: colors.primary,
    },
    iconPicker: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    iconOption: {
      width: 48,
      height: 48,
      borderRadius: 24,
      margin: 6,
      borderWidth: 2,
      borderColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    iconSelected: {
      borderColor: colors.primary,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
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
    methodInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Métodos de Pagamento</Text>
        <Text style={styles.subtitle}>Gerencie os métodos de pagamento disponíveis no aplicativo.</Text>

        {!isLocked && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddMethod}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Novo Método de Pagamento</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={customPaymentMethods}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.methodItem}>
            <View style={styles.methodHeader}>
              <View style={styles.methodInfo}>
                <View style={[styles.methodIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.methodName}>{item.name}</Text>
              </View>
            </View>

            {!isLocked && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleEditMethod(item)}>
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteMethod(item)}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color={colors.text + "40"} />
            <Text style={styles.emptyText}>
              Nenhum método de pagamento personalizado.
              {!isLocked ? " Toque no botão + para adicionar." : ""}
            </Text>
          </View>
        }
      />

      {showForm && (
        <Modal visible={showForm} transparent={true} animationType="fade" onRequestClose={() => setShowForm(false)}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingMethod ? "Editar Método de Pagamento" : "Novo Método de Pagamento"}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  ref={nameInputRef}
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nome do método de pagamento"
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
                <Text style={styles.label}>Ícone</Text>
                <View style={styles.iconPicker}>
                  {predefinedIcons.map((iconName) => (
                    <TouchableOpacity
                      key={iconName}
                      style={[styles.iconOption, icon === iconName && styles.iconSelected]}
                      onPress={() => setIcon(iconName)}
                    >
                      <Ionicons name={iconName} size={24} color={icon === iconName ? colors.primary : colors.text} />
                    </TouchableOpacity>
                  ))}
                </View>
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
      )}
    </View>
  )
}

export default PaymentMethodsScreen