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
    const safeValue = value != null ? value.toString() : "";

    const numericValue = safeValue.replace(/[^0-9]/g, "");

    const paddedValue = numericValue.padStart(3, "0");

    const decimalPart = paddedValue.slice(-2);
    const wholePart = paddedValue.slice(0, -2) || "0";
    const cleanWholePart = wholePart.replace(/^0+/, "") || "0";

    setWholeNumber(cleanWholePart);
    setDecimal(decimalPart);
    setFormattedValue(`${cleanWholePart},${decimalPart}`);
  }, [value]);


  const handleTextChange = (text?: string) => {
    const safeText = text ?? "";
    const numericValue = safeText.replace(/[^0-9]/g, "");
    onChangeText(numericValue);
  };


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
      marginTop: 15
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
      marginTop: 12
    },
  })

  return (
    <View style={styles.container}>
      <Text style={styles.currencySymbol}>R$</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.wholeNumber}>{wholeNumber}</Text>
        <Text style={styles.decimal}>{decimal}</Text>
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