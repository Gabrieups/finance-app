"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { title } from "process"

type ThemeMode = "light" | "dark" | "system"

interface ThemeContextType {
  themeMode: ThemeMode
  isDarkMode: boolean
  setThemeMode: (mode: ThemeMode) => void
  colors: {
    background: string
    text: string
    card: string
    border: string
    primary: string
    success: string
    warning: string
    danger: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [themeMode, setThemeMode] = useState<ThemeMode>("system")

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem("themeMode")
        if (savedMode) {
          setThemeMode(savedMode as ThemeMode)
        }
      } catch (error) {
        console.error("Error loading theme mode:", error)
      }
    }

    loadThemeMode()
  }, [])

  useEffect(() => {
    const saveThemeMode = async () => {
      try {
        await AsyncStorage.setItem("themeMode", themeMode)
      } catch (error) {
        console.error("Error saving theme mode:", error)
      }
    }

    saveThemeMode()
  }, [themeMode])

  const isDarkMode = themeMode === "dark" || (themeMode === "system" && systemColorScheme === "dark")

  const lightColors = {
    background: "#FFFFFF",
    text: "#1F2937",
    card: "#F9FAFB",
    border: "#E5E7EB",
    primary: "#4F46E5",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  }

  const darkColors = {
    background: "#1F2937",
    text: "#F9FAFB",
    card: "#374151",
    border: "#4B5563",
    primary: "#6366F1",
    success: "#34D399",
    warning: "#FBBF24",
    danger: "#F87171",
  }

  const colors = isDarkMode ? darkColors : lightColors

  const value = {
    themeMode,
    isDarkMode,
    setThemeMode,
    colors,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

