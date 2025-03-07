"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { useTheme } from "../context/ThemeContext"
import { type Category, type PaymentMethod, useFinance } from "../context/FinanceContext"
import { Ionicons } from "@expo/vector-icons"

// Atualizar a interface ExpenseFormProps para incluir isFixed
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

// No componente ExpenseForm, adicionar os novos estados
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
  const { isLocked } = useFinance()

  const [name, setName] = useState(initialValues.name)
  const [amount, setAmount] = useState(initialValues.amount)
  const [category, setCategory] = useState<Category>(initialValues.category)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialValues.paymentMethod)
  const [date, setDate] = useState(initialValues.date || new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState(initialValues.dueDate || new Date().toISOString().split("T")[0])
  const [isPaid, setIsPaid] = useState(initialValues.isPaid || false)

  // No handleSubmit, incluir a flag isFixed
  const handleSubmit = () => {
    if (isLocked) return

    const expenseData = {
      id: initialValues.id,
      name,
      amount: Number.parseFloat(amount) || 0,
      category,
      paymentMethod,
      date,
      isFixed: !isVariable,
      // Incluir dueDate e isPaid apenas para despesas fixas
      ...(isVariable ? {} : { dueDate, isPaid }),
    }

    onSubmit(expenseData)
  }

  const getCategoryLabel = (cat: Category): string => {
    switch (cat) {
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

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 10,
      backgroundColor: colors.card,
      borderRadius: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      marginVertical:16,
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
    pickerContainer: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      marginBottom: 16,
    },
    picker: {
      color: colors.text,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBlockEnd: 16,
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

  // No return do componente, adicionar os novos campos para despesas fixas
  // Após o campo de data para despesas variáveis, adicionar:

  // Dentro do return, após o campo de data para despesas variáveis, adicionar:
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{initialValues.id ? "Editar Despesa" : "Nova Despesa"}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nome da despesa"
          placeholderTextColor={colors.text + "80"}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Valor (R$)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={colors.text + "80"}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue as Category)}
            style={styles.picker}
          >
            <Picker.Item label="Contas Mensais" value="MONTHLY_BILLS" />
            <Picker.Item label="Mercado" value="GROCERIES" />
            <Picker.Item label="Lazer" value="LEISURE" />
            <Picker.Item label="Gasolina" value="FUEL" />
            <Picker.Item label="Outros" value="OTHER" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Forma de Pagamento</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={paymentMethod}
            onValueChange={(itemValue) => setPaymentMethod(itemValue as PaymentMethod)}
            style={styles.picker}
          >
            <Picker.Item label="PIX" value="PIX" />
            <Picker.Item label="Cartão" value="CARD" />
            <Picker.Item label="Dinheiro" value="CASH" />
            <Picker.Item label="Outro" value="OTHER" />
          </Picker>
        </View>
      </View>

      {isVariable && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.text + "80"}
          />
        </View>
      )}

      {/* Adicionar campos para despesas fixas */}
      {!isVariable && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Vencimento</Text>
            <TextInput
              style={styles.input}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.text + "80"}
            />
          </View>

          <View style={[styles.inputGroup, { flexDirection: "row", alignItems: "center" }]}>
            <TouchableOpacity
              style={{
                width: 24,
                height: 24,
                borderWidth: 2,
                borderColor: colors.primary,
                borderRadius: 4,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 10,
              }}
              onPress={() => setIsPaid(!isPaid)}
            >
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

