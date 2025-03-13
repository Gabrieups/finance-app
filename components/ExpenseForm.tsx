"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { type Category, type PaymentMethod, useFinance } from "../context/FinanceContext"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"

interface ExpenseFormProps {
  initialValues?: {
    id?: string
    name: string
    amount: number
    category: Category
    paymentMethod: PaymentMethod
    date?: string
    dueDate?: string
    isPaid?: boolean
    isFixed?: boolean
  }
  onSubmit: (values: any) => void
  onCancel: () => void
  isVariable?: boolean
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialValues = {
    name: "",
    amount: 0,
    category: "OTHER" as Category,
    paymentMethod: "CARD" as PaymentMethod,
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    isPaid: false,
  },
  onSubmit,
  onCancel,
  isVariable = false,
}) => {
  const { colors } = useTheme()
  const { isLocked, customCategories } = useFinance()

  const [name, setName] = useState(initialValues.name)
  const [amount, setAmount] = useState(initialValues.amount)
  const [category, setCategory] = useState<Category>(initialValues.category)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialValues.paymentMethod)

  // Date state management
  const [date, setDate] = useState(initialValues.date ? new Date(initialValues.date) : new Date())
  const [dueDate, setDueDate] = useState(initialValues.dueDate ? new Date(initialValues.dueDate) : new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showDueDatePicker, setShowDueDatePicker] = useState(false)
  const [datePickerMode, setDatePickerMode] = useState<"date" | "time">("date")

  const [isPaid, setIsPaid] = useState(initialValues.isPaid || false)
  const [isFixedExpense, setIsFixedExpense] = useState(!isVariable)

  // Estado para controlar erros de validação
  const [errors, setErrors] = useState({
    name: false,
    amount: false,
    category: false,
    paymentMethod: false,
    date: false,
    dueDate: false,
  })

  // Format date for display
  const formatDateForDisplay = (date: Date): string => {
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
  }

  // Format date for storage
  const formatDateForStorage = (date: Date): string => {
    return date.toISOString().split("T")[0]
  }

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false)
    }

    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  // Handle due date change
  const onDueDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDueDatePicker(false)
    }

    if (selectedDate) {
      setDueDate(selectedDate)
    }
  }

  const validateForm = () => {
    const newErrors = {
      name: false, // Name is no longer required
      amount: !amount || isNaN(Number(amount)) || Number(amount) <= 0,
      category: !category,
      paymentMethod: !paymentMethod,
      date: isFixedExpense ? false : !date,
      dueDate: isFixedExpense ? !dueDate : false,
    }

    setErrors(newErrors)

    return !Object.values(newErrors).some((error) => error)
  }

  // Update the handleSubmit function to adjust the due date for future months
  const handleSubmit = () => {
    if (isLocked) return

    if (!validateForm()) {
      return
    }

    // Get the category name to use as default if no name is provided
    const categoryObj = customCategories.find((cat) => cat.id === category)
    const categoryName = categoryObj ? categoryObj.name : ""

    // For fixed expenses, ensure the due date is set correctly
    let finalDueDate = dueDate

    if (isFixedExpense) {
      // If it's a fixed expense, we want to preserve the day of the month
      // This ensures the expense appears on the same day in future months
      finalDueDate = new Date(dueDate)
    }

    const expenseData = {
      id: initialValues.id,
      name: name || categoryName, // Use category name if no name is provided
      amount: Number.parseFloat(amount) || 0,
      category,
      paymentMethod,
      date: formatDateForStorage(date),
      isFixed: isFixedExpense,
      // Incluir dueDate e isPaid apenas para despesas fixas
      ...(isFixedExpense
        ? {
            dueDate: formatDateForStorage(finalDueDate),
            isPaid,
          }
        : {}),
    }

    onSubmit(expenseData)
  }

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.text,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: colors.text,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      padding: 12,
      color: colors.text,
    },
    inputValue: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      padding: 12,
      color: colors.text,
    },
    inputError: {
      borderColor: colors.danger,
      borderWidth: 1,
    },
    errorText: {
      color: colors.danger,
      fontSize: 12,
      marginTop: 4,
    },
    pickerContainer: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      marginBottom: 16,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
      marginBottom: 30
    },
    button: {
      padding: 12,
      borderRadius: 4,
      alignItems: "center",
      flex: 1,
      marginHorizontal: 4,
    },
    submitButton: {
      backgroundColor: colors.primary,
    },
    cancelButton: {
      backgroundColor: colors.danger,
    },
    buttonText: {
      color: "#FFFFFF",
      fontWeight: "bold",
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    switchLabel: {
      fontSize: 16,
      color: colors.text,
    },
    dateInputContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    dateInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      padding: 12,
      color: colors.text,
    },
    dateIcon: {
      position: "absolute",
      right: 12,
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    // Novos estilos para os checkboxes de método de pagamento
    paymentMethodsContainer: {
      marginTop: 8,
    },
    paymentMethodRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    paymentMethodItem: {
      flexDirection: "row",
      alignItems: "center",
      width: "48%",
      marginBottom: 12,
    },
    paymentMethodCheckbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    paymentMethodLabel: {
      fontSize: 14,
      color: colors.text,
    },
    // Estilos para a seleção de categoria
    categoryContainer: {
      marginTop: 8,
    },
    categoryRow: {
      flexDirection: "column",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    categoryItem: {
      flexDirection: "row",
      alignItems: "center",
      width: "48%",
      marginBottom: 12,
    },
    categoryCheckbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    categoryColorIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    categoryLabel: {
      fontSize: 14,
      color: colors.text,
    },
    dateButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      padding: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dateButtonText: {
      color: colors.text,
    },
  })

  if (isLocked) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Edição Bloqueada</Text>
        <Text style={{ color: colors.text }}>
          O aplicativo está bloqueado para edições. Desative o bloqueio nas configurações para fazer alterações.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary, marginTop: 16 }]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {initialValues.id ? "Editar Despesa" : isFixedExpense ? "Nova Despesa Fixa" : "Nova Despesa Variável"}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Valor (R$)</Text>
        <TextInput
          style={[styles.inputValue, errors.amount && styles.inputError]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={colors.text + "80"}
        />
        {errors.amount && <Text style={styles.errorText}>Valor válido é obrigatório</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder="Descrição da despesa (opcional)"
          placeholderTextColor={colors.text + "80"}
        />
        {errors.name && <Text style={styles.errorText}>Nome é obrigatório</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoryContainer}>
          <View style={styles.categoryRow}>
            {customCategories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryItem} onPress={() => setCategory(cat.id)}>
                <View style={styles.categoryCheckbox}>
                  {category === cat.id && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </View>
                <View style={[styles.categoryColorIndicator, { backgroundColor: cat.color }]} />
                <Text style={styles.categoryLabel}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {errors.category && <Text style={styles.errorText}>Categoria é obrigatória</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Forma de Pagamento</Text>
        <View style={styles.paymentMethodsContainer}>
          <View style={styles.paymentMethodRow}>
            <TouchableOpacity style={styles.paymentMethodItem} onPress={() => setPaymentMethod("PIX")}>
              <View style={styles.paymentMethodCheckbox}>
                {paymentMethod === "PIX" && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </View>
              <Text style={styles.paymentMethodLabel}>PIX</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.paymentMethodItem} onPress={() => setPaymentMethod("CARD")}>
              <View style={styles.paymentMethodCheckbox}>
                {paymentMethod === "CARD" && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </View>
              <Text style={styles.paymentMethodLabel}>Cartão</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.paymentMethodItem} onPress={() => setPaymentMethod("CASH")}>
              <View style={styles.paymentMethodCheckbox}>
                {paymentMethod === "CASH" && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </View>
              <Text style={styles.paymentMethodLabel}>Dinheiro</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.paymentMethodItem} onPress={() => setPaymentMethod("OTHER")}>
              <View style={styles.paymentMethodCheckbox}>
                {paymentMethod === "OTHER" && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </View>
              <Text style={styles.paymentMethodLabel}>Outro</Text>
            </TouchableOpacity>
          </View>
        </View>
        {errors.paymentMethod && <Text style={styles.errorText}>Forma de pagamento é obrigatória</Text>}
      </View>

      {!isFixedExpense && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data</Text>
          <TouchableOpacity
            style={[styles.dateButton, errors.date && styles.inputError]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDateForDisplay(date)}</Text>
            <Ionicons name="calendar-outline" size={20} color={colors.text + "80"} />
          </TouchableOpacity>
          {errors.date && <Text style={styles.errorText}>Data é obrigatória</Text>}

          {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />}
        </View>
      )}

      {isFixedExpense && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Vencimento</Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.dueDate && styles.inputError]}
              onPress={() => setShowDueDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatDateForDisplay(dueDate)}</Text>
              <Ionicons name="calendar-outline" size={20} color={colors.text + "80"} />
            </TouchableOpacity>
            {errors.dueDate && <Text style={styles.errorText}>Data de vencimento é obrigatória</Text>}

            {showDueDatePicker && (
              <DateTimePicker value={dueDate} mode="date" display="default" onChange={onDueDateChange} />
            )}
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity style={styles.checkbox} onPress={() => setIsPaid(!isPaid)}>
              {isPaid && <Ionicons name="checkmark" size={18} color={colors.primary} />}
            </TouchableOpacity>
            <Text style={styles.label}>Marcado como Pago</Text>
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default ExpenseForm