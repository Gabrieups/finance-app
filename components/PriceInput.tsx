"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, TextInput, StyleSheet } from "react-native"
import { useTheme } from "../context/ThemeContext"

interface PriceInputProps {
  value: string
  onChangeText: (text: string) => void
  error?: boolean
}

const PriceInput: React.FC<PriceInputProps> = ({ value, onChangeText, error }) => {
  const { colors } = useTheme()
  const [formattedValue, setFormattedValue] = useState("")
  const [wholeNumber, setWholeNumber] = useState("")
  const [decimal, setDecimal] = useState("")

  useEffect(() => {
    const safeValue = value != null ? value.toString() : ""

    // Remove non-numeric characters
    const numericValue = safeValue.replace(/[^0-9]/g, "")

    // Convert to cents (integer)
    const valueInCents = numericValue === "" ? 0 : Number.parseInt(numericValue, 10)

    // Convert cents to a formatted string with decimal part
    const reals = Math.floor(valueInCents / 100)
    const cents = valueInCents % 100

    // Format the parts
    const formattedReals = reals === 0 && numericValue === "" ? "" : reals.toString()
    const formattedCents = cents.toString().padStart(2, "0")

    setWholeNumber(formattedReals || "0")
    setDecimal(formattedCents)
    setFormattedValue(`${formattedReals || "0"},${formattedCents}`)
  }, [value])

  const handleTextChange = (text?: string) => {
    const safeText = text ?? ""
    const numericValue = safeText.replace(/[^0-9]/g, "")

    // Convert the input to a value in cents
    const valueInCents = numericValue === "" ? 0 : Number.parseInt(numericValue, 10)

    // Pass the value in cents as a string
    onChangeText(valueInCents.toString())
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "stretch",
      backgroundColor: colors.card,
      alignSelf: "center",
    },
    currencySymbol: {
      fontSize: 16,
      color: error ? colors.danger : colors.text,
      marginRight: 3,
      marginTop: 15,
    },
    input: {
      flex: 1,
      color: colors.text,
      padding: 0,
      fontSize: 1,
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      opacity: 0,
    },
    valueContainer: {
      flexDirection: "row",
      alignItems: "stretch",
    },
    wholeNumber: {
      fontSize: 50,
      fontWeight: "bold",
      color: error ? colors.danger : colors.text,
    },
    decimal: {
      fontSize: 24,
      color: error ? colors.danger : colors.text,
      marginLeft: 3,
      marginTop: 12,
    },
  })

  return (
    <View style={styles.container}>
      <Text style={styles.currencySymbol}>R$</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.wholeNumber}>{wholeNumber}</Text>
        <Text style={styles.decimal}>,{decimal}</Text>
      </View>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={value}
        onChangeText={handleTextChange}
        maxLength={10}
      />
    </View>
  )
}

export default PriceInput