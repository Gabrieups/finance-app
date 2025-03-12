"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { type Category, type PaymentMethod, useFinance } from "../context/FinanceContext"
import { Ionicons } from "@expo/vector-icons"

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
    isRecurring?: boolean
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
    isRecurring: false,
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
  const [date, setDate] = useState(initialValues.date || new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState(initialValues.dueDate || new Date().toISOString().split("T")[0])
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

  // Formatar a data para exibição
  const formatDateForDisplay = (dateString: string): string => {
    const [year, month, day] = dateString.split("-")
    return `${day}/${month}/${year}`
  }

  // Formatar a data para armazenamento
  const formatDateForStorage = (dateString: string): string => {
    // Se já estiver no formato YYYY-MM-DD, retornar como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString
    }

    // Se estiver no formato DD/MM/YYYY, converter para YYYY-MM-DD
    const [day, month, year] = dateString.split("/")
    return `${year}-${month}-${day}`
  }

  const validateForm = () => {
    const newErrors = {
      name: !name,
      amount: !amount || isNaN(Number(amount)) || Number(amount) <= 0,
      category: !category,
      paymentMethod: !paymentMethod,
      date: isFixedExpense ? false : !date,
      dueDate: isFixedExpense ? !dueDate : false,
    }

    setErrors(newErrors)

    return !Object.values(newErrors).some((error) => error)
  }

  const handleSubmit = () => {
    if (isLocked) return

    if (!validateForm()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios corretamente.")
      return
    }

    const expenseData = {
      id: initialValues.id,
      name,
      amount: Number.parseFloat(amount) || 0,
      category,
      paymentMethod,
      date,
      isFixed: isFixedExpense,
      // Incluir dueDate e isPaid apenas para despesas fixas
      ...(isFixedExpense
        ? {
            dueDate: formatDateForStorage(dueDate),
            isPaid,
            isRecurring: initialValues.isRecurring || false,
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
      marginTop: 6,
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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Valor (R$)</Text>
        <TextInput
          style={[styles.input, errors.amount && styles.inputError]}
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
          placeholder="Nome da despesa"
          placeholderTextColor={colors.text + "80"}
        />
        {errors.name && <Text style={styles.errorText}>Descrição é obrigatório</Text>}
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
          <View style={styles.dateInputContainer}>
            <TextInput
              style={[styles.dateInput, errors.date && styles.inputError]}
              value={date}
              onChangeText={setDate}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.text + "80"}
            />
            <Ionicons name="calendar-outline" size={20} color={colors.text + "80"} style={styles.dateIcon} />
          </View>
          {errors.date && <Text style={styles.errorText}>Data é obrigatória</Text>}
        </View>
      )}

      {isFixedExpense && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Vencimento</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={[styles.dateInput, errors.dueDate && styles.inputError]}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.text + "80"}
              />
              <Ionicons name="calendar-outline" size={20} color={colors.text + "80"} style={styles.dateIcon} />
            </View>
            {errors.dueDate && <Text style={styles.errorText}>Data de vencimento é obrigatória</Text>}
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